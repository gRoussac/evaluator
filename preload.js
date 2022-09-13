eval_back = window.eval;
window.eval = function (expr) {
  //eval_back(expr);
  console.log(`

  eval executed

  ##START##
  ${expr}
  ##END##
  `);
};
