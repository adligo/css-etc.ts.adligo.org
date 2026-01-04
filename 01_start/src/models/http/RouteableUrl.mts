
export class RouteableUrl {
    private url: URL;
    private pathParts: string[];

    constructor(req: Request) {
        this.url = new URL(req.url!, `http://${req.headers.host}`);
        this.pathParts = this.url.pathname.split('/').filter(Boolean);
    }

    get getPathParts(): string[] {
        return this.pathParts;
    } 

    get getPathPartsCount(): number {
        return this.pathParts.length;
    }
}