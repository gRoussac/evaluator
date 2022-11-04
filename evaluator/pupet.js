const puppeteer = require('puppeteer');
const { START, template } = require('./eval.template.js');

const myArgs = process.argv.slice(2);
//console.log('myArgs: ', myArgs);
(async () => {
  const url = myArgs[0] || 'https://www.example.com/';
  const fn = myArgs[1] || 'window.eval';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  let tpl = template;
  fn && (tpl = template.replace(/window.eval/gm, fn));
  await page.evaluateOnNewDocument(tpl);

  await page.setUserAgent(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
  );

  page.on('request', (request) => {
    if (
      request.isNavigationRequest() &&
      request.frame() === page.mainFrame() &&
      !request.url().includes(getHostname(url.trim()))
    ) {
      console.log('aborted');
      request.abort('aborted');
    } else {
      request.continue();
    }
  });

  page.on('console', (consoleObj) => {
    let execution = consoleObj.text();
    if (!execution.includes(START)) {
      // console.error(execution);
      return;
    }
    execution = execution.replace(START, '');
    const json = JSON.parse(execution);
    if (json && typeof json === 'object') {
      json.forEach((element) => {
        element && console.log(element.toString().trim());
      });
    }
  });

  await page.goto(url, {
    timeout: 6666,
    waitUntil: ['domcontentloaded', 'networkidle0'],
  });

  await page.close();
  await browser.close();
})();

function getHostname(url_test) {
  let url;
  try {
    url = new URL(url_test);
  } catch (_) {
    return url_test;
  }
  return url.hostname;
}
