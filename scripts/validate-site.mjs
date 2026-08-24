import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const errors = [];

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(path));
    else files.push(path);
  }
  return files;
}

const htmlFiles = (await filesUnder(root)).filter((path) => {
  const name = relative(root, path).replaceAll("\\", "/");
  return path.endsWith(".html") && !name.startsWith("assets/");
});
const titles = new Map();
const localPages = new Set(htmlFiles.map((path) => {
  const name = relative(root, path).replaceAll("\\", "/");
  if (name === "index.html") return "/";
  if (name.endsWith("/index.html")) return `/${name.slice(0, -"index.html".length)}`;
  return `/${name}`;
}));
for (const path of htmlFiles) {
  const source = await readFile(path, "utf8");
  const name = relative(root, path).replaceAll("\\", "/");
  const title = source.match(/<title>([^<]+)<\/title>/i)?.[1];
  const description = source.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1];
  const canonical = source.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  const h1Count = (source.match(/<h1(?:\s|>)/gi) || []).length;
  if (!title) errors.push(`${name}: missing title`);
  if (!description && name !== "404.html") errors.push(`${name}: missing meta description`);
  if (!canonical && !["404.html", "thank-you.html"].includes(name)) errors.push(`${name}: missing canonical`);
  if (h1Count !== 1) errors.push(`${name}: expected one h1, found ${h1Count}`);
  if (title) {
    if (titles.has(title)) errors.push(`${name}: duplicate title with ${titles.get(title)}`);
    titles.set(title, name);
  }
  if (/14-днев|GPS проследяване|Повышение|директно в вашия/.test(source)) errors.push(`${name}: contains stale or unsupported claim`);
  if (/\bOCR\b/i.test(source)) errors.push(`${name}: contains outdated OCR wording`);
  if (/<a class="related-card"[^>]*><strong>\//.test(source)) errors.push(`${name}: related card exposes a raw URL as its title`);
  if (/<a(?![^>]*href="https:\/\/logitruck\.lumina-88\.com\/register")[^>]*>Безплатен тест<\/a>/.test(source)) errors.push(`${name}: exact trial link does not target registration`);

  for (const match of source.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch (error) { errors.push(`${name}: invalid JSON-LD (${error.message})`); }
  }

  for (const match of source.matchAll(/href="(\/[^"]*)"/g)) {
    const href = match[1];
    const url = new URL(href, "https://www.lumina-88.com");
    if (url.pathname.match(/\.[a-z0-9]+$/i)) continue;
    const normalized = url.pathname === "/" || url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
    if (!localPages.has(normalized)) errors.push(`${name}: broken internal link ${href}`);
  }
}

const sitemap = await readFile(join(root, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
for (const url of sitemapUrls) {
  const path = new URL(url).pathname;
  const target = path === "/" ? join(root, "index.html") : join(root, path.slice(1), "index.html");
  try { await readFile(target); } catch { errors.push(`sitemap: missing file for ${url}`); }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Validated ${htmlFiles.length} HTML files and ${sitemapUrls.length} sitemap URLs`);
