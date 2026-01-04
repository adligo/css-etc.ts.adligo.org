import { Request, Response, NextFunction } from 'express';
import {sendIndexHtml} from '../../models/http/Index.mjs';
import { AHttpSession } from '../../models/http/AHttpSession.mjs';

export function EnableCookiesHandler(req: Request, res: Response) {
  console.log("EnableCookiesHandler called" );
  req.session.setValue(AHttpSession.A_SESSION_COOKIES_APPROVED, true);
  res.cookie(AHttpSession.A_SESSION_ID, req.session.id, {
        httpOnly: true  // Security: Prevents client-side JS from reading the cookie
    });
  sendIndexHtml(req, res);
}