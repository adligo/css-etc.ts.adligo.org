import express from "express";
import path from "path";
import * as http from 'http';
import { RouteableUrl } from './src/models/http/RouteableUrl.mjs';
import { ServerUrlRouter } from './src/models/http/ServerUrlRouter.mjs';
import { sendIndexHtml } from './src/models/http/Index.mjs';
import {TrackJsHandler} from './src/handlers/api_v1/TrackJsHandler.mjs';
import {EnableCookiesHandler} from './src/handlers/api_v1/EnableCookiesHandler.mjs';
import { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';

import * as fs from 'fs';
//import { readFileSync } from 'node:fs/promises';
import { join } from 'node:path';

const CSS_ETC_HOME: string = process.env.CSS_ETC_HOME as string;
const RUN_PATH = process.cwd();

function openConfigFile() {
  try {
    // It's best practice to use path.join to handle slashes correctly across OSs
    const filePath = join(CSS_ETC_HOME, 'config.json');

    // 'utf8' encodes the buffer into a readable string
    const data = fs.readFileSync(filePath, 'utf8').toString();

    console.log("In server.ts read file " + filePath + " with data\n" + data);

    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading file:', err);
  }
}

const CONFIG = openConfigFile();
const app = express();
const PORT = CONFIG.start_01?.port ?? 3005;
const DEBUG = CONFIG.start_01?.debug ?? false;

/*
app.use((req, res, next) => {
  const fullUrl = new RouteableUrl(req);
    if (DEBUG) {
    console.log('--- DEBUG START ---\n' +
      `Time: ${new Date().toISOString()}\n` +
      `Method: ${req.method}\n` +
      `path: ${req.url}\n` +
      'Headers:' + JSON.stringify(req.headers, null, 2) + '\n' +
      'Body:' + req.body + '\n' + // Requires express.json() to be above this
      'Session:' + req.session + '\n' + // Useful for your session issues
      '--- DEBUG END ---');
  } 


  // You can now access various parsed properties with TypeScript support:
  const pathParts: string[] = fullUrl.getPathParts; 
  const pathPartsCount: number = fullUrl.getPathPartsCount;
  
  console.log("in server.ts get pathParts '" + pathPartsCount + "'");

  switch (pathPartsCount) {
    case 0:
      sendIndexHtml(res); 
      break;
    default:
      const partZero = pathParts[0];
      switch (partZero) {
        case 'index.html':
          sendIndexHtml(res);
          break;
        default:
          send404(res);
      }
  }
  //next(); // CRITICAL: If you forget this, the request will hang forever
});
*/
let router = new ServerUrlRouter(
  sendIndexHtml,
  send404,
  DEBUG, true
);
app.use(cookieParser());
router.addHandler("api_v1/log-js", TrackJsHandler);
router.addHandler("api_v1/enableCookies", EnableCookiesHandler);
//Ignore .well-known for Google's Chrome Dev Tools
router.addIgnore(".well-known");
app.use(router.routerFunction);


app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

function send404(req: Request, res: Response) {
  res.status(404).send('Not Found');
}

