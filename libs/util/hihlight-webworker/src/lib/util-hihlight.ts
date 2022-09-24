import hljs from 'highlight.js';

export const highlight = (message: any) => {
  message['result'] = message['result'] && hljs.highlight(message['result'], { language: 'javascript' }).value;
  message['stacktrace'] = message['stacktrace'] && hljs.highlight(JSON.stringify(message['stacktrace'], null, 2), { language: 'json' }).value;
  //console.log('highlight', message);
  return message;
};