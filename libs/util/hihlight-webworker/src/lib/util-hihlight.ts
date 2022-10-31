import { MessageResult } from '@evaluator/shared-types';
import hljs from 'highlight.js';

export const highlight = (message: MessageResult) => {
  if (!message) {
    return message;
  }
  message['result'] = message['result'].map(element => {
    const elementAsString = typeof element === 'object' ? JSON.stringify(element) : element.toString();
    return hljs.highlightAuto(elementAsString, ['javascript', 'json', 'text']).value;
  }
  );
  message['stacktrace_as_string'] = message['stacktrace'] && hljs.highlight(JSON.stringify(message['stacktrace'], null, 2), { language: 'json' }).value;
  return message;
};