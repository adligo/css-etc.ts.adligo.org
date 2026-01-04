
export class RouteableUrl {
  private _url: URL;
  private _pathParts: string[];

  constructor(req: Request) {
    this._url = new URL(req.url!, `http://${req.headers.host}`);
    this._pathParts = this._url.pathname.split('/').filter(Boolean);
  }

  get pathParts(): string[] {
    return this._pathParts;
  }

  get pathPartsCount(): number {
    return this.pathParts.length;
  }

  hasKey(key: string): boolean {
    return this._url.searchParams.has(key);
  }

  queryValue(key: string): string | null {
    console.log("in RouteableUrl queryValue for key '" + key + "' value '" + this._url.searchParams.get(key) + "' @ \n" + this._url.toString());
    return this._url.searchParams.get(key);
  }
}