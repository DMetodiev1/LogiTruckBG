import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const indexPath = resolve(root, "index.html");
const source = await readFile(indexPath, "utf8");
const marker = /<style data-home-css>[\s\S]*?<\/style>/;

if (!marker.test(source)) {
  throw new Error("index.html is missing the data-home-css style marker");
}

const bundleLinks = /\s*<link[^>]+data-home-bundle[^>]*>/g;
const withoutOldLinks = source.replace(bundleLinks, "");
const criticalCss = ":root{--ink:#151124;--surface:#fff;--purple-900:#241144;--header-height:76px}*{box-sizing:border-box}body{margin:0;color:var(--ink);background:var(--surface);font-family:Manrope,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}.site-header{height:var(--header-height);background:#fff}.hero{min-height:100svh;background:#241144}";
const assets = `<style data-home-css>${criticalCss}</style>\n    <link data-home-bundle rel="preload" href="/assets/build/styles.min.css?v=20260825-2" as="style" />\n    <link data-home-bundle rel="stylesheet" href="/assets/build/styles.min.css?v=20260825-2" />\n    <link data-home-bundle rel="stylesheet" href="/assets/build/content.min.css?v=20260825-1" />`;
const output = withoutOldLinks.replace(marker, assets);
await writeFile(indexPath, output);
console.log("Linked minified homepage CSS with a small critical style");
