const puppeteer = require('puppeteer');
const { START, template } = require('./eval.template.js');

const myArgs = process.argv.slice(2);
//console.log('myArgs: ', myArgs);
(async () => {
  const url = myArgs[0] || 'https://www.example.com/';
  const hostname = getHostname(url.trim());
  const fn = myArgs[1] || 'window.eval';
  const timeout = +myArgs[2] || 150000;
  const search_pattern = myArgs[3] || '';
  const browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  let tpl = template;
  fn && (tpl = template.replace(/window.eval/gm, fn));
  await page.evaluateOnNewDocument(tpl);

  await page.setUserAgent(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.5304.87 Safari/537.36'
  );

  page.on('request', (request) => {
    if (
      request.isNavigationRequest() &&
      request.frame() === page.mainFrame() &&
      !request.url().includes(hostname)
    ) {
      console.error('aborted', request.url());
      request.abort('aborted');
    } else {
      request.continue();
    }
  });

  page.on('console', (consoleObj) => {
    let execution = consoleObj.text();
    if (
      !execution.includes(START) ||
      (search_pattern && !execution.includes(search_pattern))
    ) {
      // console.error(execution);
      return;
    }
    execution = execution.replace(START, '');
    const json = JSON.parse(execution);
    if (json && typeof json === 'object') {
      json.forEach((element) => {
        element &&
          console?.log(element.toString().trim())?.catch((err) => {
            console.error(err);
          });
      });
    }
  });

  await page
    .goto(url, {
      timeout,
      waitUntil: ['domcontentloaded'],
    })
    .catch((err) => {
      console.error('Error with', url, err);
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
  //return url.hostname;
  return url.hostname.split('.')[0];
}
