# css-etc.ts.adligo.org
This is a project with a bunch of stuff including css themes from various platforms, components embedded from various frameworks and various dns setups (subapps via vhost and reverse httpProxy).  Each numbered folder (i.e. 01_start) contains a complete node.js server application which can be started independently.  In addition, each server can be started and developed independently.  However, the 01_start server can also use a subapp approach to delegate to the various subdomains (configured through /etc/hosts).

### Configuration

All of the sites are configured through the config.json file in the root directory.
You will need to set the CSS_ETC_HOME environment variable so that the various tools can find the file;

```
export CSS_ETC_HOME=`pwd`
```

### Prerequsites

Most of the servers are in TypeScript and I use bun to run them;

[Install Bun](https://bun.com/docs/installation)

[Install Rollup](https://www.npmjs.com/package/rollup)

```
npm install --global rollup
# Then if your on Windows
npm install @rollup/rollup-win32-x64-msvc
# Or Linux
npm install @rollup/rollup-linux-arm64-gnu 


```



