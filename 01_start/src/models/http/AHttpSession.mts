import { RouteableUrl } from "./RouteableUrl.mjs";
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';


export class AHttpSession {
    /**
     * the name of the cookie and also the url parameter to identify the session 
     */
    public static readonly A_SESSION_ID: string = "aSessionId";
    /**
     * the session map key for the boolean if cookies have been approved by the user
     */
    public static readonly A_SESSION_COOKIES_APPROVED: string = "aSessionCookiesApproved";
    /**
     * the session map key for the boolean if javascript is enabled in the users browser
     */
    public static readonly A_SESSION_JS_ON: string = "aSessionJsOn";

    public static readonly CREATE_A_SESSION_ID = (): string => {
        return uuidv4().toString();
    }

    public static readonly GET_A_SESSION_ID_FROM_URL = (routeableUrl: RouteableUrl): string | null => {
        return routeableUrl.queryValue(AHttpSession.A_SESSION_ID);
    }

    public static readonly GET_A_SESSION_ID_FROM_COOKIE = (req: Request): string | null => {
       return req.cookies?.aSessionId;
    }

    public static readonly HAS_A_SESSION = (req: Request, routeableUrl: RouteableUrl): boolean => {
       if (AHttpSession.GET_A_SESSION_ID_FROM_COOKIE(req) === null) {
            return false;
       }
       if (AHttpSession.GET_A_SESSION_ID_FROM_URL(routeableUrl) === null) {
            return false;
       }
       return true;
    }

    public static readonly GET_A_SESSION_ID = (req: Request, routeableUrl: RouteableUrl): string | null => {
        let cookeASessionId = AHttpSession.GET_A_SESSION_ID_FROM_COOKIE(req);
       if (cookeASessionId === null || cookeASessionId === undefined) {
        
          let urlASessionId = AHttpSession.GET_A_SESSION_ID_FROM_URL(routeableUrl);
          console.log("in GET_A_SESSION_ID '" + urlASessionId + "' @ \n" + routeableUrl.toString());
    
          //may be null
          return urlASessionId;
       }
       //may be null
       return cookeASessionId;
    }

    private _sessionData: Map<string, any> = new Map();
    private _aSessionId: string = AHttpSession.CREATE_A_SESSION_ID();
    hasKey(key: string): boolean {
        return this._sessionData.has(key);
    }

    isTrue(key: string): boolean {
        let v = this._sessionData.get(key); 
        if (v === true) {
            return true;
        }   
        return false;
    }

    setValue(key: string, value: any): void {
        this._sessionData.set(key, value);
    }

    get id(): string {
        return this._aSessionId;
    }
}

export class AHttpMapSessions {
    private sessions: Map<string, AHttpSession> = new Map();

    getSession(aSessionId: string): AHttpSession | null{
        let session = this.sessions.get(aSessionId);        
        return session;
    }

    createSession(): AHttpSession {
        let session = new AHttpSession();
        session.setValue(AHttpSession.A_SESSION_COOKIES_APPROVED, false);
        session.setValue(AHttpSession.A_SESSION_JS_ON, false);
        this.sessions.set(session.id, session);
        return session;
    }

    logSessions(): void {   
        console.log("AHttpMapSessions logSessions " + JSON.stringify(Array.from(this.sessions.keys())));
    }
}