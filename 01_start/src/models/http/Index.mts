import { v4 as uuidv4 } from 'uuid';
import { AHttpSession } from './AHttpSession.mjs';
import { Request, Response, NextFunction } from 'express';

export class IndexHtml {
  aSessionId: string;
  
  constructor(aSessionId: string) {
    this.aSessionId = aSessionId;
  }
  
  getContent(showAllowCookies: boolean, testJs: boolean): string {
    let r = 
`
<html>
<head>
</head>
<body>

<h1>01_Start</h1>
The most basic html page you have ever seen!

<h3>Bun</h3>
Note this can be done via vite with;
<code><pre>
npm run dev
</pre></code>

<h3>Vite</h3>
Note this can be done via vite with;
<code><pre>
npm run dev2
</pre></code>
`;

  if (showAllowCookies) {
    r += `<form action="api_v1/enableCookies" >
      <input value="` + this.aSessionId + `" type="hidden" name="aSessionId" />
      <input value="Allow Cookies?" type="submit" />
    </form>`;
  }

  if (testJs) {
    r += `    <script>
    var img = new Image();
    img.src = "/api_v1/log-js?aSessionId=` + this.aSessionId + `&timestamp=" + new Date().getTime();
    </script>`;
  }
  r += `</body></html>`;
  return r;
}}

export function sendIndexHtml(req: Request, res: Response) {
  //res.status(200).sendFile(path.join(RUN_PATH, "index.html"));
  const aSessionId = req.session.id
  console.log("new session id = " + aSessionId);
  let idx : IndexHtml = new IndexHtml(aSessionId);
  if (req.session == null) {
    res.status(200).send(idx.getContent(true,true));
    return;
  }  
  let cookiesApproved = req.session.isTrue(AHttpSession.A_SESSION_COOKIES_APPROVED);
  let jsOn = req.session.isTrue(AHttpSession.A_SESSION_JS_ON);
  console.log("in sendIndexHtml cookiesApproved = " + cookiesApproved + ", jsOn = " + jsOn);
  res.status(200).send(idx.getContent(!cookiesApproved,!jsOn));
}
