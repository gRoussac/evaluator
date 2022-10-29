import * as puppeteer from 'puppeteer';


export type Result = string | number | object;

export type MessageResult = {
  sha256: string;
  result: Result[];
  stacktrace: puppeteer.ConsoleMessageLocation[];
  stacktrace_as_string?: string;
  caller: string;
};