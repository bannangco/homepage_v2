# Production operations

This runbook covers read-only assurance, manual post-deployment verification, and incident response for the Bannangco static website. It does not authorize a deployment or a Cloudflare, DNS, search-engine, or analytics setting change.

## Production topology

- The only canonical origin is `https://bannangco.com`.
- `http://bannangco.com`, `https://www.bannangco.com`, and `http://www.bannangco.com` must redirect once to HTTPS apex while preserving the complete path and query string.
- The site is a Next.js static export in `out/`, served by Cloudflare Workers Static Assets without an application Worker runtime.
- The production branch is `master`. The repository build command is `npm run build && npm run check:static`; the explicitly authorized deploy command is `npm run deploy:cloudflare`.
- `/`, `/privacy`, `/announcements`, `/robots.txt`, and `/sitemap.xml` are expected public routes. Unknown routes must return the Bannangco custom 404 body with HTTP 404.
- Cloudflare Web Analytics/Browser Insights is intentionally retained and disclosed on `/privacy`. HSTS and CSP are intentionally not enforced at this stage.

Public HTTP responses cannot prove which Git commit is deployed. After every authorized deployment, open the authenticated Cloudflare Workers Builds or Versions & Deployments view, identify the active deployment's Git source commit, and compare its full SHA with the intended commit on `origin/master`. Record the comparison in the deployment log without copying credentials or unrelated account data.

## Production smoke checks

From a clean checkout using Node.js 24, run:

```bash
npm ci
npm run check:production
```

The check is read-only. It verifies live routes, redirects, canonical metadata, robots, sitemap URLs, privacy disclosures, security headers, hashed-asset caching, first-party assets, the custom 404, and the disabled legacy Workers URL. HSTS and CSP are reported for information only.

The production checker is intentionally fixed to `https://bannangco.com`; it does not accept a CLI, environment, or repository-configured target override. This prevents accidental internal-network probing. A future staging domain requires a separate, source-reviewed allowlist change.

After an authorized deployment, also confirm manually:

1. The active Cloudflare deployment source SHA matches the intended `origin/master` SHA.
2. HTTPS apex routes return their expected status without broken assets or console errors.
3. HTTP apex and HTTP/HTTPS `www` preserve a probe path and query while redirecting once to HTTPS apex.
4. Canonical and Open Graph URLs, `robots.txt`, and every sitemap URL use only the HTTPS apex.
5. The custom 404, required security headers, and immutable one-year caching for a hashed `/_next/static/` asset remain effective.
6. The legacy `*.workers.dev` address does not serve the canonical production site.

The read-only GitHub Actions monitor is defined in [`.github/workflows/production-smoke.yml`](../.github/workflows/production-smoke.yml). In GitHub, open **Actions → Production Smoke → Run workflow** to start it manually. It also runs weekly. Do not add a Cloudflare token, deployment command, or write permission to this workflow.

## Rollback boundary

Rollback is an explicitly authorized Cloudflare operation. If a deployment causes a production regression:

1. Identify the most recent previously verified Cloudflare deployment/version and its source SHA.
2. Restore that known-good version through Cloudflare Workers Versions & Deployments.
3. Repeat the production smoke checks and verify the active source SHA manually.
4. Revert the faulty source change in a normal review branch when necessary; do not force-push or rewrite shared history.

The repository does not automate rollback and cannot verify authenticated Dashboard state.

## Search discovery operations

### Google Search Console

1. Create or use the [Google Search Console Domain property](https://support.google.com/webmasters/answer/34592?hl=en) for `bannangco.com`. Domain properties use only the domain name, without a scheme or path.
2. Follow Google's [ownership verification instructions](https://support.google.com/webmasters/answer/9008080?hl=en) and copy the Google-provided DNS TXT value into Cloudflare DNS manually under an authorized session.
3. Verify the property in Search Console. Never commit the TXT value or a verification token to this repository.
4. Submit `https://bannangco.com/sitemap.xml`.
5. Use URL Inspection for `/`, `/privacy`, and `/announcements`; request indexing only after the live canonical and status are correct.

### Bing Webmaster Tools

After the Search Console property is verified, use Bing Webmaster Tools' [import-from-Google-Search-Console flow](https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b). Confirm the imported apex site and sitemap. Do not place Bing credentials or verification tokens in source.

## Analytics baseline

[Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/about/) is Cloudflare-managed and must not be duplicated with a source-inserted beacon. After an authorized deployment, inspect its Dashboard for page views, Core Web Vitals, and obvious route or traffic discontinuities. Record a dated operational baseline and compare later releases against it. A Dashboard observation is manual evidence; repository tests cannot enforce the authenticated analytics configuration.

## Incident triage

Start with `npm run check:production`, note the first failing contract, and preserve the exact status and redirect Location without recording complete Cloudflare response identifiers.

- **TLS:** confirm certificate validity and hostname coverage at apex and `www`; do not bypass certificate errors. Escalate Cloudflare Edge Certificate changes for explicit approval.
- **Redirect:** inspect each hop manually. Verify one permanent redirect, exact apex destination, and unchanged path/query. Check zone-level Redirect Rules and Always Use HTTPS ownership without editing them during diagnosis.
- **404:** distinguish an intentional unknown-route 404 from a missing expected route. Confirm the custom body and the `404-page` static-assets behavior.
- **Metadata:** compare canonical and Open Graph URLs with HTTPS apex, then inspect `robots.txt` and sitemap entries. Do not patch production HTML directly.
- **Cache:** inspect a hashed `/_next/static/` response for `public`, one-year `max-age`, and `immutable`; do not apply the policy to mutable HTML.
- **Deployment:** compare the active Cloudflare deployment source SHA with `origin/master`, inspect the Workers build result, and roll back to a known-good version if authorized.

## HSTS and CSP

HSTS remains deferred until HTTPS and redirect behavior have demonstrated stable operation and a separate change is approved. The first proposed stage is one month (`max-age=2592000`) with `includeSubDomains` off (the directive omitted) and `preload` off (the directive omitted). Reassess certificates, subdomains, rollback readiness, and incident history before extending it. Never enable preload as part of the first stage.

CSP is a later report-only evaluation. Any policy must account for the Cloudflare Insights script and beacon endpoints, local fonts, Next.js static assets, metadata images, and current inline output. Collect and review reports before considering enforcement; do not add an untested enforcing policy.

## Content maintenance boundaries

- Electronic announcements belong only in `data/announcements.json`; independent approved legal documents belong only in `data/legal-documents.json`.
- Keep both arrays empty when no authoritative, publication-approved record exists. Do not create placeholder records, synthetic routes, notices, legal dates, or PDFs.
- A public PDF requires explicit privacy review and publication approval. Never infer metadata from its filename, modification time, build time, or corporate founding date.
- Privacy facts are maintained in `lib/privacy-policy.ts`. Review the policy whenever Gmail, Cloudflare, retention, collection methods, forms, accounts, payments, newsletters, or analytics change.
- Do not put financial or tax information, unapproved corporate facts, personal addresses, personal telephone numbers, identifiers, credentials, or private correspondence in source or public artifacts.
- Store Cloudflare, Search Console, Bing, DNS, and other credentials or verification values only in their authorized external systems, never in commits, fixtures, logs, screenshots, PR bodies, or documentation.

Dependabot PRs #10–#14 remain a separate maintenance stream. Observe their status as read-only operational context; do not merge, rebase, update, close, or modify them as part of production assurance work.
