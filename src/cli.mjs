#!/usr/bin/env node
// cli.mjs — read artifact JSON from stdin or file, print posture matrix.

import { readFileSync } from "node:fs";
import { computeMultiVerticalPosture } from "./index.mjs";

const args = process.argv.slice(2);
let artifact;

if (args.length === 0 || args[0] === "-") {
  let stdin = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) stdin += chunk;
  artifact = JSON.parse(stdin);
} else {
  artifact = JSON.parse(readFileSync(args[0], "utf8"));
}

const result = computeMultiVerticalPosture(artifact);
const asJson = args.includes("--json");

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`Primary vertical: ${result.primary_vertical ?? "(none reached threshold)"}`);
  console.log(`Applicable: ${result.applicable_count} · Partial: ${result.partial_count}`);
  console.log("");
  console.log("Per-vertical posture matrix:");
  for (const row of result.matrix) {
    const score = row.applicability_score.toFixed(2);
    const marker = row.posture === "applicable" ? "✓" : row.posture === "partial" ? "·" : "✗";
    console.log(`  ${marker} ${row.vertical.padEnd(12)} score=${score}  posture=${row.posture.padEnd(15)} matched=${row.matched_signals.length}/4`);
  }
  if (result.recommendations.length) {
    console.log("");
    console.log("Recommendations:");
    for (const r of result.recommendations) console.log(`  - ${r}`);
  }
}
