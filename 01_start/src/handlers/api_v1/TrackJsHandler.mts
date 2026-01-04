import { Request, Response, NextFunction } from 'express';
import { AHttpSession } from '../../models/http/AHttpSession.mjs';

export function TrackJsHandler(req: Request, res: Response) {
    console.log("TrackJsHandler called" );
    req.session.setValue(AHttpSession.A_SESSION_JS_ON, true);
    res.status(200).send("");
}