import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "out");
const failures = [];

let announcements = [];
try {
  const announcementData = JSON.parse(
    await readFile(path.join(projectRoot, "data", "announcements.json"), "utf8"),
  );

  if (!Array.isArray(announcementData)) {
    throw new TypeError("Announcement data must be an array.");
  }

  announcements = announcementData;
} catch {
  failures.push("Unable to read authoritative announcement data.");
}

async function isFile(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function requireFile(relativePath) {
  const filePath = path.join(outputRoot, ...relativePath.split("/"));

  if (!(await isFile(filePath))) {
    failures.push(`Missing required export file: out/${relativePath}`);
  }
}

async function requireRoute(route) {
  const relativeRoute = route.replace(/^\//, "");
  const candidates = relativeRoute
    ? [`${relativeRoute}.html`, `${relativeRoute}/index.html`]
    : ["index.html"];

  if (!(await Promise.all(candidates.map((candidate) => isFile(path.join(outputRoot, candidate))))).some(Boolean)) {
    failures.push(`Missing expected exported route: ${route}`);
  }
}

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(entryPath);
    }
  }

  return files;
}

function exportedPathFromUrl(url) {
  const pathname = decodeURIComponent(url.split(/[?#]/, 1)[0]);

  if (!pathname.startsWith("/") || pathname === "/") {
    return null;
  }

  return path.join(outputRoot, ...pathname.slice(1).split("/"));
}

await requireFile("index.html");
await requireFile("404.html");
await requireFile("robots.txt");
await requireFile("sitemap.xml");
await requireFile("_headers");
await requireRoute("/");
await requireRoute("/announcements");

for (const announcement of announcements) {
  if (typeof announcement?.id !== "string" || announcement.id.length === 0) {
    failures.push("Announcement data contains a record without a valid id.");
    continue;
  }

  await requireRoute(`/announcements/${encodeURIComponent(announcement.id)}`);

  const documentHref = announcement.document?.href;
  if (typeof documentHref === "string" && documentHref.startsWith("/")) {
    const documentPath = exportedPathFromUrl(documentHref);
    if (documentPath && !(await isFile(documentPath))) {
      failures.push(
        `Announcement ${announcement.id} references a missing document: ${documentHref}`,
      );
    }
  }
}

const staleDetailCandidates = [
  path.join(outputRoot, "announcements", "1.html"),
  path.join(outputRoot, "announcements", "1.txt"),
  path.join(outputRoot, "announcements", "1", "index.html"),
  path.join(outputRoot, "announcements", "1", "index.txt"),
  path.join(outputRoot, "announcements", "__no_announcements__.html"),
  path.join(outputRoot, "announcements", "__no_announcements__.txt"),
];

if ((await Promise.all(staleDetailCandidates.map(isFile))).some(Boolean)) {
  failures.push(
    "Stale or synthetic announcement detail output remains in the export.",
  );
}

let htmlFiles = [];
try {
  htmlFiles = await collectHtmlFiles(outputRoot);
} catch {
  failures.push("Unable to inspect the out/ directory. Run `npm run build` first.");
}

for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, "utf8");
  const relativePath = path.relative(projectRoot, htmlFile).replaceAll(path.sep, "/");

  if (html.includes("/_next/image")) {
    failures.push(`${relativePath} references the Next.js image optimizer`);
  }

  if (/localhost|127\.0\.0\.1|(?::|%3a)3001/i.test(html)) {
    failures.push(`${relativePath} contains a local server reference`);
  }

  if (/\/announcements\/1(?:[/?#"']|$)/.test(html)) {
    failures.push(`${relativePath} references the removed /announcements/1 placeholder`);
  }

  const assetUrls = new Set();
  for (const match of html.matchAll(/\b(?:src|poster)=["'](\/[^"']+)["']/gi)) {
    assetUrls.add(match[1]);
  }
  for (const match of html.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(",")) {
      const [url] = candidate.trim().split(/\s+/, 1);
      if (url?.startsWith("/")) {
        assetUrls.add(url);
      }
    }
  }

  for (const assetUrl of assetUrls) {
    const assetPath = exportedPathFromUrl(assetUrl);
    if (assetPath && !(await isFile(assetPath))) {
      failures.push(`${relativePath} references missing local asset: ${assetUrl}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Static export verification failed:");
  for (const failure of [...new Set(failures)]) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Static export verified (${htmlFiles.length} HTML files inspected).`);
}
