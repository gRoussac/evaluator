import { Fn, Functions } from '@evaluator/shared-types';
import * as Crypto from 'crypto';
import * as jQuery from 'jquery';
import { DOMWindow, JSDOM } from 'jsdom';
import { writeFile, statSync, readFileSync } from 'fs';
import { Inject, Injectable } from '@nestjs/common';
import { Entries } from './entries';

@Injectable()
export class UtilFunctionsService {
  constructor(
    @Inject('FUNCTIONS_PATH') private readonly path: string
  ) {
    console.log(this.path);
  }

  getFunctions() {
    try {
      statSync(this.path);
      return JSON.parse(readFileSync(this.path, 'utf8'));
    }
    catch (e) {
      console.log(this.path + ' does not exist.');
      return this.setFunctions();
    }
  }

  setFunctions(): Functions {
    const windowJSDOM: DOMWindow = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost' }).window;
    const document: Document = windowJSDOM?.document;
    const jquery = jQuery(windowJSDOM);

    const filterFunc = (property: string, obj: object, key: string) => {
      return typeof obj === 'function' && !property.startsWith('_') && !property.toLowerCase().includes(key);
    };
    const createHash = (property: string, salt: string): Fn => {
      const sha256 = Crypto.createHash('sha256').update([salt, property].join('_')).digest('hex');

      return { sha256, property, default: property === 'eval' };
    };

    const string_proto = 'String.prototype';
    const str = 'String';
    const variablesNames = new Map<string, any>();
    variablesNames.set('window', windowJSDOM);
    variablesNames.set('document', document);
    variablesNames.set(string_proto, String.prototype);
    variablesNames.set(str, String);
    variablesNames.set('JSON', JSON);
    variablesNames.set('console', console);
    variablesNames.set('jQuery', jquery);


    const variables = new Map<string, Fn[]>();
    variablesNames.forEach((object, key) => {
      const obj: object = (key === 'document') ? Object.getPrototypeOf(object) : object;
      variables.set(key,
        Object.getOwnPropertyNames(obj)
          .filter((property: string) => {
            return filterFunc(property, object[property], key);
          })
          .sort(Intl.Collator().compare)
          .map(property => {
            const fn = createHash(property, key);
            fn.prototype = key === string_proto;
            return fn;
          }));
    });
    const vars_proto = variables.get(string_proto);
    variables.get(str)?.forEach((func: Fn) => {
      vars_proto && vars_proto.push(func);
    });
    if (vars_proto) {
      vars_proto.sort((a, b) => Intl.Collator().compare(a.property, b.property));
      variables.set(str, vars_proto);
      variables.delete(string_proto);
    }
    const entries = Object.fromEntries(variables);
    this.saveFunctions(entries);
    return entries;
  }

  private saveFunctions(entries: Entries) {
    try {
      statSync(this.path);
    }
    catch (e) {
      console.log(this.path + ' does not exist.');
      writeFile(this.path, JSON.stringify(entries), (err) => {
        err && console.error(err, 'can not write functions file');
      });
    }
  }
}