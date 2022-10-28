export const START = '##START##';
export const preg_expression = new RegExp(`${START}([^]*)`, 'gms');
const test = `\`${START} \${ expr }\``;
const test_object = `\`${START} \${ stringify_back(expr) }\``;
const template = `
const stringify_back = JSON.stringify;
const console_log_back = console.log;
const eval_back = window.eval;
window.eval = function (...expr) {
  if (typeof expr === 'object') {
    console_log_back(${test_object});
  } else {
    console_log_back(${test});
  }
  return eval_back.call(this, ...expr);
};
`;

export default template;
