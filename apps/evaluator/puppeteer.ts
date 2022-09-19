import { NextFunction, Request, Response } from 'express';
import * as puppeteer from 'puppeteer';
import template, { preg_expression, START } from "./eval";
import { EventEmitter, Injectable } from '@angular/core';
import * as Crypto from 'crypto';


@Injectable({
  providedIn: 'root'
})
export class PuppeteerResolver {

  static get_url(req: Request | string): string {
    let testURL: string;
    if (req instanceof Request) {
      const url = new URL(req.url);
      testURL = url.searchParams.get('url') || '';
    } else {
      testURL = req.toString();
    }
    return testURL;
  }

  static async resolve(req: Request, res: Response, next: NextFunction) {
    try {
      const puppet = new Puppet();
      res.write('[');
      puppet.result$.subscribe(result => {
        const key = Crypto.createHash('sha256').update(result).digest('hex');
        const test = {
          [key]: result
        };
        console.log(test);
        res.write(JSON.stringify(test));
        res.write(',');
      });
      await puppet.goto(PuppeteerResolver.get_url(req));
      await puppet.close();
      res.write(']');
      res.send();
    }
    catch (error) {
      return next(error);
    }

    // res.status(200).send(result);
  }

  static async resolveSite(url: string, ws: any) {
    try {
      const puppet = new Puppet();
      puppet.result$.subscribe(result => {
        const key = Crypto.createHash('sha256').update(result).digest('hex');
        const obj = {
          'sha256': key,
          'result': result
        };
        console.log(obj);
        ws.send(JSON.stringify(obj));
      });
      await puppet.goto(url);
      await puppet.close();
    }
    catch (error) {
      return error;
    }
  }
}

class Puppet {

  result: string[] = [];

  private browser: Promise<puppeteer.Browser>;

  result$: EventEmitter<string> = new EventEmitter();

  constructor() {
    this.browser = this.getBrowser();
  }

  async getBrowser(): Promise<puppeteer.Browser> {
    return await puppeteer.launch();
  }

  async goto(url: string): Promise<puppeteer.HTTPResponse | null> {
    const page = await this.getNewPage();
    this.setListener(page);
    console.log(url);
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
      if (!execution.includes(START))
        return;
      const eval_match = preg_expression.exec(execution)?.pop();
      if (eval_match) {
        this.result$.emit(eval_match);
        //this.result.push(eval_match);
        //console.log(eval_match);
      }
    });
  }
}