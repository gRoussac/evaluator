import { Injectable } from '@nestjs/common';
import { Fn, Fonctions } from '@evaluator/shared-types';
import { JSDOM } from 'jsdom';
import * as jQuery from 'jquery';
const window = new JSDOM('').window;
const document = window.document;
const jquery = jQuery(window);
import * as Crypto from 'crypto';

@Injectable()
export class AppService {
  getFunctions(): Fonctions {
    const filterFunc = (property: string, obj: object) => {
      return typeof obj === 'function' && !property.startsWith('_');
    };
    const createHash = (property: string, salt: string): Fn => {
      const sha256 = Crypto.createHash('sha256').update([salt, property].join('_')).digest('hex');

      return { sha256, property, default: property === 'eval' };
    };

    const string_proto = 'String.prototype';
    const str = 'String';
    const variablesNames = new Map<string, object>();
    variablesNames.set('window', global);
    variablesNames.set(string_proto, String.prototype);
    variablesNames.set(str, String);
    variablesNames.set('document', document);
    variablesNames.set('JSON', JSON);
    variablesNames.set('jquery', jquery);

    const variables = new Map<string, Fn[]>();
    variablesNames.forEach((object, key) => {
      let document_proto: object;
      if (key === 'document') {
        document_proto = Object.getPrototypeOf(object);
      }
      variables.set(key, Object.getOwnPropertyNames(document_proto || object).filter((property: string) => {
        return filterFunc(property, object[property]);
      }).sort(Intl.Collator().compare).map(property => createHash(property, key)));
    });
    variables.get(str).forEach((func: Fn) => {
      variables.get(string_proto).push(func);
    });
    variables.set(str, variables.get(string_proto));
    variables.delete(string_proto);
    return Object.fromEntries(variables);
  }
}
