export const START = '##START##';
export const END = '##END##';
export const preg_expression = new RegExp(`${START}\\s(.*)\\s${END}`);
const test = `\
\`
${START}
\${expr}
${END}
\`
`;

const template = `const eval_back = window.eval;
window.eval = function (expr) {
  eval_back(expr);
  console.log(${test});
};
`;

export default template;
