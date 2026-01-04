import { Request, Response, NextFunction } from 'express';
import { RouteableUrl } from './RouteableUrl.mjs';
import path from 'node:path';

export class ServerPathPartRoute {
  parts: string[];
  router: ServerPathPartRouter;

  constructor(parts: string[], router: ServerPathPartRouter) {
    this.parts = parts;
    this.router = router;
  }

  get getParts(): string[] {
    return this.parts;
  }
  get getRouter(): ServerPathPartRouter {
    return this.router;
  }
}

export class ServerPathPartRouter {
  serverUrlRouter: ServerUrlRouter;
  defaultRoute: ServerHandler;
  routes: Map<string, ServerPathPartRouter> = new Map();

  constructor(serverUrlRouter: ServerUrlRouter, defaultRoute: ServerHandler) {
    this.serverUrlRouter = serverUrlRouter;
  }


  get getRouterFunction(): (req: Request, res: Response) => void {
    return (req: Request, res: Response) => {
      let fullUrl = req.fullUrl;
      let pathPart = req.pathPart;
      req.pathPart = pathPart + 1;
      let pathParts: string[] = fullUrl.getPathParts;
      let pathPartsCount: number = fullUrl.getPathPartsCount;

      if (pathPart >= pathPartsCount) {
        this.defaultRoute(req, res);
        return;
      } else {
        let pathSeg = pathParts[pathPart];
        console.log("in export class ServerPathPartRouter pathSeg " + pathSeg);
        switch (pathSeg) {
          case 'index.html':
            this.defaultRoute(req, res);
            return;
          default:
            if (this.routes.has(pathSeg)) {
              this.routes.get(pathSeg)?.getRouterFunction(req, res);
              return;
            }
        }
      }
      //send 404
      this.serverUrlRouter.unknownHandler(req, res);
    };
  }
}

export type ServerHandler = (req: Request, res: Response) => void;

export class ServerUrlRouter {
  debug: boolean = false;
  defaultRoute: ServerHandler;
  unknownHandler: ServerHandler;
  routes: Map<string, ServerPathPartRouter> = new Map();

  constructor(defaultRoute: ServerHandler, unknownHandler: ServerHandler, debug: boolean) {
    this.defaultRoute = defaultRoute;
    this.unknownHandler = unknownHandler;
    this.debug = debug;
  }

  addRoute(part: string, router: ServerPathPartRouter): void {
    this.routes.set(part, router);
  }

  addRoutes(part: ServerPathPartRoute): void {
    let paths: string[] = part.getParts;
    for (let p of paths) {
      this.routes.set(p, part.getRouter);
    }
  }

  /**
   * Returns a router function that can be used in an Express app.
   */
  get getRouterFunction(): (req: Request, res: Response) => void {
    return (req: Request, res: Response) => {
      const fullUrl = new RouteableUrl(req);
      if (this.debug) {
        console.log('--- DEBUG START ---\n' +
          `Time: ${new Date().toISOString()}\n` +
          `Method: ${req.method}\n` +
          `path: ${req.url}\n` +
          'Headers:' + JSON.stringify(req.headers, null, 2) + '\n' +
          'Body:' + req.body + '\n' + // Requires express.json() to be above this
          'Session:' + req.session + '\n' + // Useful for your session issues
          '--- DEBUG END ---');
      }
      req.fullUrl = fullUrl;
      req.pathPart = 1;
      const pathParts: string[] = fullUrl.getPathParts;
      const pathPartsCount: number = fullUrl.getPathPartsCount;

      console.log("in ServerUrlRouter get pathParts '" + pathPartsCount + "'");

      switch (pathPartsCount) {
        case 0:
          this.defaultRoute(req, res);
          return;
        default:
          const partZero = pathParts[0];
          switch (partZero) {
            case 'index.html':
              this.defaultRoute(req, res);
              return;
            default:
              if (this.routes.has(partZero)) {
                this.routes.get(partZero)?.getRouterFunction(req, res);
                return;
              }
          }
      }
      //send 404
      this.unknownHandler(req, res);
    };
  }
}