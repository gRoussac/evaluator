import * as puppeteer from 'puppeteer';
export type MessageResult = {
  sha256: string;
  result: string[];
  stacktrace: puppeteer.ConsoleMessageLocation[];
  stacktrace_as_string?: string;
  caller: string;
};