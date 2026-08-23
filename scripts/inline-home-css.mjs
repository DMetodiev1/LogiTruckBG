import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const indexPath = resolve(root, "index.html");
const css = await Promise.all([
  readFile(resolve(root, "styles.css"), "utf8"),
  readFile(resolve(root, "content.css"), "utf8"),
]);

const source = await readFile(indexPath, "utf8");
const marker = /<style data-home-css>[\s\S]*?<\/style>/;

if (!marker.test(source)) {
  throw new Error("index.html is missing the data-home-css style marker");
}

const minifyCss = (value) => value
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .replace(/\s*([{}:;,>])\s*/g, "$1")
  .replace(/;}/g, "}")
  .trim();

const output = source.replace(marker, `<style data-home-css>${minifyCss(css.join("\n"))}</style>`);
await writeFile(indexPath, output);
console.log("Inlined homepage CSS");
