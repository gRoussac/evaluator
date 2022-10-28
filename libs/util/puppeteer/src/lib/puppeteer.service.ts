import { NextFunction, Request, Response } from 'express';
import * as puppeteer from 'puppeteer';
import template, { START } from "./eval.template";
import * as Crypto from 'crypto';
import * as WebSocket from 'ws';

import { Fn, Message, MessageResult } from '@evaluator/shared-types';
import { readFileSync } from 'fs';
import { filter, map, pipe, Subject, take } from 'rxjs';
import { Entries } from '@evaluator-backend/util-functions';

import * as Path from 'path';

export class PuppeteerResolver {
  private static readonly url_not_valid = 'not a valid url?';
  private static readonly parse_failure = 'parsing failure';
  private static readonly result_max = 1000;

  static async resolve(req: Request, res: Response, next: NextFunction) {
    const url = req.query['url']?.toString() || '';
    const fn = req.query['function']?.toString() || '';
    const clearFn = !!fn;
    if (!isValidHttpUrl(url)) {
      res.status(400).send([PuppeteerResolver.url_not_valid]);
      return;
    }
    try {
      const puppet = new Puppet();
      res.status(200).write('[');
      const subscription = puppet.results.pipe(
        PuppeteerResolver.dedupAndFilter()
      ).subscribe((result: MessageResult | undefined) => {
        result && res.status(200).write(JSON.stringify(result));
      });
      await puppet.goto({ url, fn, clearFn });
      await puppet.close();
      res.status(200).write(']');
      subscription.unsubscribe();
    }
    catch (error) {
      res.status(500).send([PuppeteerResolver.parse_failure, error?.toString()]);
      return next(error);
    }
  }

  static async resolveWs(message: Message, ws: WebSocket) {
    if (!isValidHttpUrl(message.url)) {
      ws.send(JSON.stringify(false));
      return;
    }
    try {
      const puppet = new Puppet();

      const subscription = puppet.results.pipe(
        PuppeteerResolver.dedupAndFilter()
      ).subscribe((result: MessageResult | undefined) => {
        result && ws.send(JSON.stringify(result));
      });
      await puppet.goto(message);
      await puppet.close();
      ws.send(JSON.stringify(false));
      ws.close();
      subscription.unsubscribe();
    }
    catch (error) {
      return error;
    }
  }

  private static dedupAndFilter() {
    const duplicates = new Map<string, MessageResult>();
    return pipe(map((message: puppeteer.ConsoleMessage) => {
      const result = PuppeteerResolver.decorateResult(message);
      const key = result && result?.sha256 + result?.caller;
      if (key && !duplicates.has(key)) {
        duplicates.set(key, result);
        return result;
      }
      return;
    }),
      filter((x: MessageResult | undefined) => !!x?.sha256),
      take(PuppeteerResolver.result_max));
  }

  private static decorateResult(message: puppeteer.ConsoleMessage) {
    let result: string[] = JSON.parse(message.text().replace(START, '').trim());
    console.log(result);
    result = result && result.filter((result) => result.toString().length);
    console.log(result);
    const sha256 = Crypto.createHash('sha256').update(message.text()).digest('hex'),
      stacktrace = message.stackTrace(),
      firstcaller = stacktrace.slice(-1)[0];
    let lastcaller = stacktrace.slice()[0];
    // Remove our proper script
    if (lastcaller['lineNumber'] === 4 && lastcaller['columnNumber'] === 10) {
      stacktrace.shift();
    }
    lastcaller = stacktrace.slice()[0];
    firstcaller['lineNumber'] = (firstcaller['lineNumber'] || 0) + 1;
    const line = lastcaller['lineNumber'];
    const caller = [lastcaller['url'], line].join('#L');

    const messageResult: MessageResult = {
      sha256,
      result,
      stacktrace,
      stacktrace_as_string: '',
      caller
    };
    return messageResult;
  }
}

class Puppet {
  result$: Subject<puppeteer.ConsoleMessage> = new Subject();
  private browser: Promise<puppeteer.Browser>;
  private readonly timeout = 6666;

  constructor(
  ) {
    this.browser = this.getBrowser();
  }

  async getBrowser(): Promise<puppeteer.Browser> {
    return await puppeteer.launch();
  }

  async goto(message: Message): Promise<puppeteer.HTTPResponse | null | void> {
    const page = await this.getNewPage(message);
    this.setListener(page);
    let aborted = false;
    let url = '';
    page.on('request', req => {
      if (req.isNavigationRequest() && req.frame() === page.mainFrame() && req.url() !== message.url) {
        aborted = true;
        url = req.url();
        req.abort('aborted');
      } else {
        req.continue();
      }
    });
    await page.setRequestInterception(true);
    const result = await page.goto(message.url, { timeout: this.timeout, waitUntil: ['domcontentloaded', 'networkidle0'] }).catch(err => console.error(message.url, url, err));

    if (!aborted) {
      await page.screenshot({ path: 'test.png' });
    }

    return result;
  }

  getFunction(message: Message) {
    const filename = "functions.json";
    const fnSha256 = message.fn;
    const path = Path.join(__dirname, filename);
    const dist = '/dist/';
    const functions_path = path.substring(0, path.lastIndexOf(dist)) + dist + filename;
    let functions: Entries = {};
    try {
      functions = JSON.parse(readFileSync(functions_path, 'utf8'));
    }
    catch {
      console.error(`can't read functions file ` + functions_path);
    }
    let fnGroup = '';
    const func = Object.values(functions).map((group: Fn[], index: number) => {
      const groupfound = group.find((fn: Fn) => {
        return fn.sha256 === fnSha256;
      });
      groupfound && (fnGroup = Object.keys(functions)[index]);
      return groupfound;
    }).filter(x => x).pop();
    fnGroup = func?.prototype ? fnGroup.replace('String', 'String.prototype') : fnGroup;
    return [fnGroup, func?.property].join('.');
  }

  async getNewPage(message: Message) {
    const browser = await this.browser;
    const page = await browser.newPage();
    let tpl = template;
    if (message.fn && !message.clearFn) {
      const func = this.getFunction(message);
      tpl = template.replace(/window.eval/gm, func);
      console.log(tpl);
    } else if (message.clearFn) {
      console.log(message);
      tpl = template.replace(/window.eval/gm, message.fn);
    }
    await page.evaluateOnNewDocument(tpl);
    await page.setUserAgent(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
    );
    return page;
  }

  async close() {
    const browser = await this.browser;
    await browser?.close();
  }

  setListener(page: puppeteer.Page) {
    page.on('console', (consoleObj: puppeteer.ConsoleMessage) => {
      const execution = consoleObj.text();
      if (!execution.includes(START)) {
        return;
      }
      this.result$.next(consoleObj);
    });
  }

  get results() {
    return this.result$.asObservable();
  }
}

function isValidHttpUrl(url_test: string) {
  let url;
  try {
    url = new URL(url_test);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}