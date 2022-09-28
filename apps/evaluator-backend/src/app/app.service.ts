import { Injectable } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import * as jQuery from 'jquery';
const window = new JSDOM('').window;
const document = window.document;
const jquery = jQuery(window);

@Injectable()
export class AppService {
  getData(): { [key: string]: string[]; } {
    const windowObj = Object.getOwnPropertyNames(global).filter((p: any) => {
      return typeof global[p] === 'function' && !p.startsWith('_');
    });
    const stringObj = Object.getOwnPropertyNames(String.prototype).filter((p: string) => {
      return typeof String.prototype[p] === 'function';
    });
    Object.getOwnPropertyNames(String).filter((p: string) => {
      return typeof String[p] === 'function';
    }).forEach((func) => {
      stringObj.push(func);
    });
    const documentObj = Object.getOwnPropertyNames(Object.getPrototypeOf(document)).filter((p: string) => {
      return typeof document[p] === 'function';
    });
    const jsonObj = Object.getOwnPropertyNames(JSON).filter((p: string) => {
      return typeof JSON[p] === 'function';
    });
    const jqueryObj = Object.getOwnPropertyNames(jquery).filter((p: string) => {
      return typeof jquery[p] === 'function';
    });
    return {
      'window': windowObj,
      'String': stringObj,
      'document': documentObj,
      'json': jsonObj,
      'jquery': jqueryObj
    };
  }
}
