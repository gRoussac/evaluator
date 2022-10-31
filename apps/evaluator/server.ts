import * as dotenv from 'dotenv';
import 'zone.js/dist/zone-node';
import { APP_BASE_HREF } from '@angular/common';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { AppServerModule } from './src/main.server';
import { existsSync } from 'fs';
import { join } from 'path';
import * as express from 'express';
import { WebSocketServer } from 'ws';
import * as http from 'http';
import { createProxyMiddleware as proxy } from 'http-proxy-middleware';
import { Message } from '@evaluator/shared-types';
import { PuppeteerResolver } from '@evaluator/util-puppeteer';

dotenv.config({ override: true });

const express_app = express();

// Proxy to Nest.js app
const apiProxy = proxy('/api', { target: 'http://localhost:3333' });

// The Express app is exported so that it can be used by appless Functions.
export function app(): express.Express {
  const distFolder = join(process.cwd(), 'dist/evaluator/browser');
  //
  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/main/modules/express-engine)
  express_app.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  express_app.set('view engine', 'html');
  express_app.set('views', distFolder);

  // Example Express Rest API endpoints
  express_app.get('/evaluate/*', PuppeteerResolver.resolve);

  express_app.get('/api/*', apiProxy);

  // Serve static files from /browser
  express_app.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  express_app.get('*', (req, res) => {
    res.render('index', { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return express_app;
}

function setWebscocketServer(server: http.Server) {
  const wss = new WebSocketServer({ server });
  wss.on('connection', (ws) => {
    ws.send(JSON.stringify('connection'));
    ws.on('message', async (message_raw) => {
      ws.send(JSON.stringify('message'));
      const message: Message = JSON.parse(message_raw.toString());
      ws.send(JSON.stringify(message.url));
      await PuppeteerResolver.resolveWs(message, ws);
      ws.send(JSON.stringify('resolved'));
    });
  });
}

// Start up the Node app
function run(): void {
  const port = process.env['PORT'] || 4000;
  const express_app = app();
  const server = http.createServer(express_app);
  setWebscocketServer(server);
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
