import { randomUUID } from "node:crypto";

import {
  createHttpRequester,
  exitCodeForReport,
  formatProductionReport,
  parseCliOptions,
  runProductionAssurance,
} from "../lib/production-assurance.mjs";
import { PRIVACY_POLICY_FACTS } from "../lib/privacy-policy.ts";

function printHelp() {
  console.log(`Usage: npm run check:production -- [--base-url https://public.example]

Runs read-only production assurance checks. The default target is
https://bannangco.com. An alternate public origin may also be supplied through
BANNANGCO_PRODUCTION_BASE_URL. Localhost, private addresses, credentials,
non-HTTP(S) schemes, paths, query strings, and fragments are rejected.`);
}

async function main() {
  const { baseUrl, help } = parseCliOptions(process.argv.slice(2));
  if (help) {
    printHelp();
    return;
  }

  const requestEvents = [];
  const request = createHttpRequester({
    onRequest(event) {
      requestEvents.push(event);
    },
  });
  const report = await runProductionAssurance({
    request,
    baseUrl,
    privacyFacts: PRIVACY_POLICY_FACTS,
    nonce: randomUUID(),
  });

  console.log(`INFO target — ${report.baseUrl}`);
  console.log(formatProductionReport(report));
  console.log(`INFO requests — ${requestEvents.length} bounded read-only GET requests`);
  process.exitCode = exitCodeForReport(report);
}

main().catch((error) => {
  console.error(`FAIL production assurance — ${error?.message || "unexpected error"}`);
  process.exitCode = 1;
});
