import { Request, Response, NextFunction } from 'express';
import { RouteableUrl } from './RouteableUrl.mjs';
import { AHttpMapSessions, AHttpSession } from './AHttpSession.mjs';
import path from 'node:path';

export class ServerPathPartRouter {
  serverUrlRouter: ServerUrlRouter;
  defaultRoute: ServerHandler;
  routes: Map<string, ServerPathPartRouter> = new Map();

  constructor(serverUrlRouter: ServerUrlRouter, defaultRoute: ServerHandler) {
    this.serverUrlRouter = serverUrlRouter;
    this.defaultRoute = defaultRoute;
  }

  add(part: string, router: ServerPathPartRouter): void {
    if (this.routes.has(part)) {
      throw new Error("Route part already exists @ '" + part + "'");
    } else {
      this.routes.set(part, router);
    }
  }

  addHandler(part: string, handler: ServerHandler): void {
    if (this.routes.has(part)) {
      throw new Error("Route part already exists @ '" + part + "'");
    } else {
      this.routes.set(part, new ServerPathPartRouter(this.serverUrlRouter, handler));
    }
  }

  has(part: string): boolean {
    return this.routes.has(part);
  }

  get(part: string): ServerPathPartRouter | undefined {
    return this.routes.get(part);
  }

  get routerFunction(): (req: Request, res: Response) => void {
    return (req: Request, res: Response) => {
      let fullUrl = req.fullUrl;
      let pathPart = req.pathPart;
      req.pathPart = pathPart + 1;
      let pathParts: string[] = fullUrl.pathParts;
      let pathPartsCount: number = fullUrl.pathPartsCount;

      if (pathPart >= pathPartsCount || pathParts === undefined) {
        this.defaultRoute(req, res);
        return;
      } else {
        console.log("in ServerPathPartRouter pathPart " + pathPart);
        let pathSeg = pathParts[pathPart];
        console.log("in ServerPathPartRouter pathSeg " + pathSeg);
        switch (pathSeg) {
          case 'index.html':
            this.defaultRoute(req, res);
            return;
          default:
            if (this.routes.has(pathSeg)) {
              this.routes.get(pathSeg)?.routerFunction(req, res);
              return;
            } else {
              console.log ("no route for pathSeg '" + pathSeg + "' \n " +
                " pathParts '" + JSON.stringify(this.routes.keys()) + "'");
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
  ignores: Set<string> = new Set();
  useSessions: boolean = true;
  sessions: AHttpMapSessions = null;

  constructor(defaultRoute: ServerHandler, unknownHandler: ServerHandler, debug: boolean, useSessions: boolean = true) {
    this.defaultRoute = defaultRoute;
    this.unknownHandler = unknownHandler;
    this.debug = debug;
    this.useSessions = useSessions;
    if (useSessions) {
      console.log("ServerUrlRouter using AHttpMapSessions");
      this.sessions = new AHttpMapSessions();
    } 
  }

  addHandler(parts: string, handler: ServerHandler): void {
    let segs = parts.split('/').filter(Boolean);
    if (segs.length === 0) {
        throw new Error("Cannot add empty route");
    } else {
        if (segs.length === 1) {
            let part = segs[0];
            this.routes.set(part, new ServerPathPartRouter(this, handler));
            return;
        } else {
            var lastRouter: ServerPathPartRouter = null;
            for (let i = 0; i < segs.length; i++) {
                let part = segs[i];
                if (i === segs.length - 1) {
                    // last one
                    if (lastRouter === null) {
                      let nextRouter = new ServerPathPartRouter(this, handler);
                      this.routes.set(part, nextRouter);
                      console.log("added last part '" + part + "' " + i);
                    } else if (lastRouter.has(part)) {
                      throw new Error("Route part already exists @ '" + part + "'");                    
                    } else {
                      lastRouter.addHandler(part, handler);
                      console.log("added last part '" + part + "' " + i);
                    }
                } else {
                  if (lastRouter === null) {
                    if (this.routes.has(part)) {
                      lastRouter = this.routes.get(part);
                      console.log("had first part '" + part + "' " + i);    
                    } else {
                      let nextRouter = new ServerPathPartRouter(this, this.unknownHandler);
                      this.routes.set(part, nextRouter);
                      lastRouter = nextRouter;
                      console.log("added first part '" + part + "' " + i);
                    }
                  } else if (lastRouter.has(part)) {
                    lastRouter = lastRouter.get(part);
                    console.log("lastRouter had '" + part + "' " + i);                      
                  } else {
                    let nextRouter = new ServerPathPartRouter(this, this.unknownHandler);
                    lastRouter.add(part, nextRouter);
                    lastRouter = nextRouter;
                    console.log("added part '" + part + "' " + i);
                  }
                }
            }
        }
    }
  }

  addIgnore(part: string): void {
    this.ignores.add(part);
  }

  /**
   * Returns a router function that can be used in an Express app.
   */
  get routerFunction(): (req: Request, res: Response) => void {
    return (req: Request, res: Response) => {
      const fullUrl = new RouteableUrl(req);
      req.fullUrl = fullUrl;
      req.pathPart = 1;
      const pathParts: string[] = fullUrl.pathParts;
      const pathPartsCount: number = fullUrl.pathPartsCount;

      console.log("in ServerUrlRouter get pathParts '" + pathParts + "'");

      
      switch (pathPartsCount) {
        case 0:
          if (this.debug) {
            debugRequest(req);
          }
          this.doSessionLogic(req, fullUrl);
          this.defaultRoute(req, res);
          return;
        default:
          const partZero = pathParts[0];
          switch (partZero) {
            case 'index.html':
              if (this.debug) {
                debugRequest(req);
              }
              this.doSessionLogic(req, fullUrl);
              this.defaultRoute(req, res);
              return;
            default:
              if (this.routes.has(partZero)) {
                if (this.debug) {
                  debugRequest(req);
                }
                this.doSessionLogic(req, fullUrl);
                this.routes.get(partZero)?.routerFunction(req, res);
                return;
              } else if (this.ignores.has(partZero)) {
                //do nothing
              } else {
                console.log ("no route for partZero '" + partZero + "'");
              }
          }
      }
      //send 404
      this.unknownHandler(req, res);
    };
  }

  private doSessionLogic(req: Request, fullUrl: RouteableUrl) {
    if (this.useSessions) {
      
      if (!AHttpSession.HAS_A_SESSION(req, fullUrl)) {
        //create a new session
        let aSession = this.sessions.createSession();
        console.log("Created new AHttpSession with id '" + aSession.id + "' @  \n" + req.url);
        this.sessions.logSessions();
        req.session = aSession;
      } else {
        let aSessionId = AHttpSession.GET_A_SESSION_ID(req, fullUrl);
        console.log("Using existing aSessionId '" + aSessionId + "' @  \n" + req.url);
        if (aSessionId != null) {
          let aSession = this.sessions.getSession(aSessionId);   
          if (aSession === null || aSession === undefined) {
            let aSession = this.sessions.createSession();
            console.log("Unable to find session for aSessionId '" + aSessionId + "', created new AHttpSession with id '" + aSession.id + "'");
            req.session = aSession;
            this.sessions.logSessions();
          } else {
            console.log("Found existing AHttpSession with id '" + aSession.id + "' @ \n" + req.url);
            req.session = aSession;
          }
        }

      }
    }
  }
}

function debugRequest(req: Request) {
  console.log('--- DEBUG START ---\n' +
    `Time: ${new Date().toISOString()}\n` +
    `Method: ${req.method}\n` +
    `path: ${req.url}\n` +
    'Headers:' + JSON.stringify(req.headers, null, 2) + '\n' +
    'Body:' + req.body + '\n' + // Requires express.json() to be above this
    '--- DEBUG END ---');
}
