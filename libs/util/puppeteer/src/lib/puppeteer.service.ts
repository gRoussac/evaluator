import { NextFunction, Request, Response } from 'express';
import * as puppeteer from 'puppeteer';
import template, { START } from "./eval.template";
import * as Crypto from 'crypto';
import * as WebSocket from 'ws';

import { Fn, Message, MessageResult, Result } from '@evaluator/shared-types';
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
      res.write('[hello');
      const subscription = puppet.results.pipe(
        PuppeteerResolver.dedupAndFilter()
      ).subscribe((result: MessageResult | undefined) => {
        result && res.write([JSON.stringify(result), ''].join());
      });
      // const screenshot = await puppet.goto({ url, fn, clearFn });
      await puppet.close();
      //res.write(['\n', screenshot, ']'].join(''));
      res.end();
      subscription.unsubscribe();
    }
    catch (error) {
      res.status(500).send([PuppeteerResolver.parse_failure, error?.toString()]);
      return next(error);
    }
  }

  static async resolveWs(message: Message, ws: WebSocket) {
    ws.send(JSON.stringify('resolveWs ' + message.url));
    if (!isValidHttpUrl(message.url)) {
      ws.send(JSON.stringify('isValidHttpUrl ' + message.url));
      ws.send(JSON.stringify(false));
      return;
    }
    try {
      ws.send(JSON.stringify('url ' + message.url));
      ws.send(JSON.stringify('fn ' + message.fn));
      const puppet = new Puppet();

      const subscription = puppet.results.pipe(
        PuppeteerResolver.dedupAndFilter()
      ).subscribe((result: MessageResult | undefined) => {
        ws.send(JSON.stringify('result found'));
        result && ws.send(JSON.stringify(result));
      });
      ws.send(JSON.stringify('goto page ' + message.url));
      const screenshot = await puppet.goto(message, ws);
      ws.send(JSON.stringify('screenshot done'));
      screenshot && ws.send(screenshot);
      ws.send(JSON.stringify('puppet close'));
      await puppet.close();
      ws.send(JSON.stringify('puppet closed'));
      ws.send(JSON.stringify(false));
      ws.send(JSON.stringify('ws close'));
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
    const result: Result[] = JSON.parse(message.text().replace(START, '').trim())
      .map((result: Result) =>
        typeof result === 'string' ? (result as string).trim() : result
      );
    const sha256 = Crypto.createHash('sha256').update(message.text()).digest('hex');
    let stacktrace = message.stackTrace();
    const lastcaller = stacktrace && stacktrace.slice(-1)[0];
    stacktrace = stacktrace.filter((trace) => {
      trace['lineNumber'] = (trace['lineNumber'] || 0) + 1;
      return !!trace.url;
    });
    lastcaller && stacktrace.length === 0 && stacktrace.push(lastcaller);
    const firstcaller = stacktrace && stacktrace.slice()[0];
    const caller = firstcaller && [firstcaller['url'], firstcaller['lineNumber']].join('#L'),
      messageResult: MessageResult = {
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

  async goto(message: Message, ws: WebSocket): Promise<puppeteer.HTTPResponse | null | void | string> {
    const page = await this.getNewPage(message);
    this.setListener(page);
    let aborted = false;
    let url = '';
    ws.send(JSON.stringify('goto'));
    console.log(getHostname(message.url.trim()));
    page.on('request', req => {
      if (req.isNavigationRequest() && req.frame() === page.mainFrame() && !req.url().includes(getHostname(message.url.trim()))) {
        aborted = true;
        url = req.url();
        console.error(req.url(), message.url);
        ws.send(JSON.stringify('aborted'));
        req.abort('aborted');
      } else {
        ws.send(JSON.stringify('continue'));
        req.continue();
      }
    });
    ws.send(JSON.stringify('setRequestInterception'));
    await page.setRequestInterception(true);
    ws.send(JSON.stringify('server message.url ' + message.url.trim()));
    console.log('server message.url', message.url.trim());
    const result = await page.goto(message.url.trim(), { timeout: this.timeout, waitUntil: ['domcontentloaded', 'networkidle0'] }).catch(err => {
      ws.send(JSON.stringify('error ' + err.toString()));
      console.error(message.url, url, err);
    });
    ws.send(JSON.stringify('screenshot '));
    console.log('server tries screenshot', message.url.trim());
    let screenshot, base64 = '';
    !aborted && (base64 = await page.screenshot({ encoding: "base64" }) as string);
    ws.send(JSON.stringify('screenshot done'));
    console.log('server screenshot');
    base64 && (screenshot = JSON.stringify(`data:image/png;base64,${base64}`));
    return screenshot || result;
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
    } else if (message.clearFn) {
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

function getHostname(url_test: string): string {
  let url: URL;
  try {
    url = new URL(url_test);
  } catch (_) {
    return url_test;
  }
  return url.hostname;
}