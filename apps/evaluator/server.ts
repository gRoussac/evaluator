import 'zone.js/dist/zone-node';
import { APP_BASE_HREF } from '@angular/common';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { existsSync } from 'fs';
import { join } from 'path';
import { AppServerModule } from './src/main.server';
import * as express from 'express';
import { PuppeteerResolverResolver } from './puppeteer';
import { WebSocketServer } from 'ws';
import * as http from 'http';
const express_app = express();
// const testURL = 'https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_eval';


// The Express app is exported so that it can be used by appless Functions.
export function app(): express.Express {
  const distFolder = join(process.cwd(), 'dist/evaluator/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/main/modules/express-engine)
  express_app.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  express_app.set('view engine', 'html');
  express_app.set('views', distFolder);

  // Example Express Rest API endpoints
  express_app.get('/api/*', PuppeteerResolverResolver.resolve);



  // Serve static files from /browser
  express_app.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  express_app.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return express_app;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node app
  const express_app = app();
  const server = http.createServer(express_app);
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log(32);
    ws.on('message', (message) => {
      console.log(message);
      ws.send('mess ' + message);
    });
  });
  server.listen(port, () => {
    console.log(`Node Express app listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the app is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
