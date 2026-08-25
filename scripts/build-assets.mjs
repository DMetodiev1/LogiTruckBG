import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { transform } from "esbuild";

const root = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(root, "assets", "build");
const assets = [
  ["styles.css", "styles.min.css", "css"],
  ["content.css", "content.min.css", "css"],
  ["analytics.js", "analytics.min.js", "js"],
  ["script.js", "script.min.js", "js"],
  ["content.js", "content.min.js", "js"],
];

await mkdir(outputDirectory, { recursive: true });

for (const [sourceName, outputName, loader] of assets) {
  const source = await readFile(resolve(root, sourceName), "utf8");
  const result = await transform(source, {
    loader,
    minify: true,
    legalComments: "none",
    target: loader === "js" ? "es2020" : undefined,
  });
  await writeFile(resolve(outputDirectory, outputName), result.code);
}

console.log(`Built ${assets.length} minified assets`);
