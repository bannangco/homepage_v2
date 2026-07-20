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
  console.log(`Usage: npm run check:production [-- --help]

Runs read-only production assurance checks against the fixed production origin
https://bannangco.com. Alternate targets are intentionally not accepted.`);
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
