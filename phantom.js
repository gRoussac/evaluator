const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const myArgs = process.argv.slice(2);
const testURL = myArgs[0];
const preloadFile = fs.readFileSync(
  path.resolve(__dirname + '/preload.js'),
  'utf8'
);

(async () => {
  const browser = await puppeteer.launch();
  let page = await browser.newPage();
  await page.evaluateOnNewDocument(preloadFile);
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36'
  );
  page.on('console', (consoleObj) => {
    const exec = consoleObj.text();
    if (!exec.includes('##START##')) return;
    console.log(exec);
  });
  //console.log(testURL);
  await page.goto(testURL);
  await browser.close();
})();
