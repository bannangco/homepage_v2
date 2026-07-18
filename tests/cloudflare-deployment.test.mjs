import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const projectUrl = new URL("../", import.meta.url);

async function readJson(relativePath) {
  return JSON.parse(await readFile(new URL(relativePath, projectUrl), "utf8"));
}

test("uses an exact assets-only Wrangler configuration", async () => {
  const config = await readJson("wrangler.jsonc");

  assert.deepEqual(config, {
    $schema: "./node_modules/wrangler/config-schema.json",
    name: "bannangco-homepage-v2",
    compatibility_date: "2026-07-18",
    assets: {
      directory: "./out",
      not_found_handling: "404-page",
      html_handling: "auto-trailing-slash",
    },
    routes: [
      {
        pattern: "bannangco.com",
        custom_domain: true,
      },
    ],
    workers_dev: false,
    preview_urls: false,
  });
  assert.equal(config.routes.length, 1);
  assert.deepEqual(config.routes[0], {
    pattern: "bannangco.com",
    custom_domain: true,
  });
  assert.equal(/^bannangco\.com$/.test(config.routes[0].pattern), true);
  assert.equal(config.routes[0].pattern.startsWith("www."), false);
  assert.equal(config.workers_dev, false);
  assert.equal(config.preview_urls, false);

  for (const forbiddenKey of [
    "main",
    "bindings",
    "account_id",
    "zone_id",
    "secrets",
    "pages_build_output_dir",
  ]) {
    assert.equal(Object.hasOwn(config, forbiddenKey), false);
  }
  assert.equal(Object.hasOwn(config, "route"), false);
});

test("pins Wrangler and exposes only the intended deployment commands", async () => {
  const packageJson = await readJson("package.json");
  const packageLock = await readJson("package-lock.json");

  assert.equal(packageJson.devDependencies.wrangler, "4.112.0");
  assert.equal(packageJson.scripts["deploy:cloudflare"], "wrangler deploy");
  assert.equal(
    packageJson.scripts["check:cloudflare"],
    "wrangler deploy --dry-run",
  );
  assert.equal(packageLock.packages[""].devDependencies.wrangler, "4.112.0");
  assert.equal(packageLock.packages["node_modules/wrangler"].version, "4.112.0");
});

test("preserves the Next static export without OpenNext configuration", async () => {
  const nextConfig = require("../next.config.js");
  const packageJson = await readJson("package.json");
  const packageLock = await readJson("package-lock.json");
  const rootEntries = await readdir(projectUrl);
  const dependencyNames = [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
    ...Object.keys(packageLock.packages ?? {}),
  ];

  assert.equal(nextConfig.output, "export");
  assert.equal(nextConfig.images?.unoptimized, true);
  assert.equal(
    dependencyNames.some((name) => /open-?next/i.test(name)),
    false,
  );
  assert.deepEqual(
    rootEntries.filter((name) => /^open-?next\.config\./i.test(name)),
    [],
  );
});

test("keeps local Wrangler state and credentials out of version control", async () => {
  const gitignore = await readFile(new URL(".gitignore", projectUrl), "utf8");

  assert.match(gitignore, /^\/\.wrangler\/$/m);
  assert.match(gitignore, /^\.dev\.vars$/m);
  assert.match(gitignore, /^\.dev\.vars\.\*$/m);
});
