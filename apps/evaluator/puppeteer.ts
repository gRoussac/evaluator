import { NextFunction, Request, Response } from 'express';
import * as puppeteer from 'puppeteer';
import template, { START } from "./eval";
import { EventEmitter, Injectable } from '@angular/core';
import * as Crypto from 'crypto';
import * as WebSocket from 'ws';

@Injectable({
  providedIn: null
})
export class PuppeteerResolver {
  private static readonly url_not_valid = 'not a valid url?';
  private static readonly parse_failure = 'parsing failure';

  static async resolve(req: Request, res: Response, next: NextFunction) {
    const url = req.query['url']?.toString() || '';
    if (!isValidHttpUrl(url)) {
      res.status(400).send([PuppeteerResolver.url_not_valid]);
      return;
    }
    try {
      const puppet = new Puppet();
      await puppet.goto(url);
      await puppet.close();
      res.status(200).send(puppet.result);
    }
    catch (error) {
      res.status(500).send([PuppeteerResolver.parse_failure, error?.toString()]);
      return next(error);
    }
  }

  static async resolveWs(url: string, ws: WebSocket) {
    if (!isValidHttpUrl(url)) {
      ws.send(JSON.stringify(false));
      //ws.send(JSON.stringify(PuppeteerResolver.url_not_valid));
      return;
    }
    try {
      const puppet = new Puppet();
      puppet.result$.subscribe(result => {
        const key = Crypto.createHash('sha256').update(result.text()).digest('hex');
        const stacktrace = result.stackTrace().slice(-1)[0];
        const caller = stacktrace['url'];
        const line = (stacktrace['lineNumber'] || 0) + 1;
        const obj = {
          'sha256': key,
          'result': result.text().replace(START, '').trim(),
          'stacktrace': stacktrace,
          'caller': [caller, line].join('#L')
        };
        ws.send(JSON.stringify(obj));
      });
      await puppet.goto(url);
      await puppet.close();
      if (!puppet.result.length) {
        ws.send(JSON.stringify(false));
      }
    }
    catch (error) {
      return error;
    }
  }
}

class Puppet {

  result: puppeteer.ConsoleMessage[] = [];
  result$: EventEmitter<puppeteer.ConsoleMessage> = new EventEmitter();
  private browser: Promise<puppeteer.Browser>;

  constructor() {
    this.browser = this.getBrowser();
  }

  async getBrowser(): Promise<puppeteer.Browser> {
    return await puppeteer.launch();
  }

  async goto(url: string): Promise<puppeteer.HTTPResponse | null> {
    const page = await this.getNewPage();
    this.setListener(page);
    return page.goto(url);
  }

  async getNewPage() {
    const browser = await this.browser;
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(template);
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36'
    );
    return page;
  }

  async close() {
    const browser = await this.browser;
    await browser?.close();
  }

  setListener(page: puppeteer.Page) {
    this.result = [];
    page.on('console', (consoleObj: puppeteer.ConsoleMessage) => {
      const execution = consoleObj.text();
      if (!execution.includes(START)) {
        return;
      }
      this.result.push(consoleObj);
      this.result$.emit(consoleObj);
    });
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