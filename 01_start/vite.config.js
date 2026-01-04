import { defineConfig, normalizePath } from "vite";
import * as fs from 'fs';
import { readFileSync } from 'node:fs/promises';
import { join } from 'node:path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from "path";
import checker from 'vite-plugin-checker'

const CSS_ETC_HOME = process.env.CSS_ETC_HOME;

function openConfigFile() {
  try {
    // It's best practice to use path.join to handle slashes correctly across OSs
    const filePath = join(CSS_ETC_HOME, 'config.json');

    // 'utf8' encodes the buffer into a readable string
    const data = fs.readFileSync(filePath, 'utf8').toString();

    console.log("In viet.config.js read file " + filePath + " with data\n" + data);

    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading file:', err);
  }
}

const CONFIG = openConfigFile();
console.log("got config " + JSON.stringify(CONFIG));
const PORT = CONFIG.start_01?.port ?? 3005;

// https://vitejs.dev/config/
export default defineConfig({
  plugins:
    [],

  /*    viteStaticCopy({
          targets: [{
            // Use normalizePath and path.resolve to ensure compatibility across operating systems,
            // especially Windows.
            src: 'public*',
            dest: 'public', // This is relative to the 'outDir' (default is 'dist').
          }],
        })],*/
  server: {
    port: PORT
  }
});
