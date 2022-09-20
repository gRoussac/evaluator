export const START = '##START##';
export const preg_expression = new RegExp(`${START}([^]*)`, 'gms');
const test = `\`${START}\${ expr }\``;
const template = `
const eval_back = window.eval;
window.eval = function (expr) {
  eval_back(expr);
  console.log(${test});
};
`;

export default template;
