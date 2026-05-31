import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { computeMultiVerticalPosture, VERTICALS } from "../src/index.mjs";

const defenseEvent = JSON.parse(readFileSync(new URL("../examples/defense-event.json", import.meta.url), "utf8"));
const hybridEvent = JSON.parse(readFileSync(new URL("../examples/hybrid-fintech-fintech.json", import.meta.url), "utf8"));

test("10 verticals registered", () => assert.equal(VERTICALS.length, 10));

test("defense event primary vertical = defensetech", () => {
  const r = computeMultiVerticalPosture(defenseEvent);
  assert.equal(r.primary_vertical, "defensetech");
  const def = r.matrix.find((m) => m.vertical === "defensetech");
  assert.equal(def.posture, "applicable");
  assert.ok(def.applicability_score >= 0.75);
});

test("defense event posture matrix returns all 10 verticals sorted by score", () => {
  const r = computeMultiVerticalPosture(defenseEvent);
  assert.equal(r.matrix.length, 10);
  for (let i = 0; i < r.matrix.length - 1; i++) {
    assert.ok(r.matrix[i].applicability_score >= r.matrix[i+1].applicability_score, `row ${i} should sort by descending score`);
  }
});

test("defense event flags non-applicability of healthtech", () => {
  const r = computeMultiVerticalPosture(defenseEvent);
  const health = r.matrix.find((m) => m.vertical === "healthtech");
  assert.equal(health.posture, "not-applicable");
});

test("hybrid event detects multiple applicable verticals", () => {
  // FinTech credit-application kind + ECOA/FCRA basis + agent.fcra_permissible_purpose → FinTech applicable
  // Plus fhir_resource_type:Patient + hipaa-permissible-purpose → HealthTech partial or applicable
  const r = computeMultiVerticalPosture(hybridEvent);
  const fin = r.matrix.find((m) => m.vertical === "fintech");
  const health = r.matrix.find((m) => m.vertical === "healthtech");
  assert.equal(fin.posture, "applicable");
  assert.ok(["applicable", "partial"].includes(health.posture));
  assert.ok(r.applicable_count + r.partial_count >= 2);
});

test("empty artifact returns no primary vertical", () => {
  const r = computeMultiVerticalPosture({});
  assert.equal(r.primary_vertical, null);
  assert.ok(r.recommendations.some((s) => s.includes("not be a KG Suite artifact")));
});

test("recommendations surface multi-vertical applicability", () => {
  const r = computeMultiVerticalPosture(hybridEvent);
  assert.ok(r.recommendations.length > 0);
});

test("matrix rows include primary_repo for routing", () => {
  const r = computeMultiVerticalPosture(defenseEvent);
  const def = r.matrix.find((m) => m.vertical === "defensetech");
  assert.equal(def.primary_repo, "defense-decision-record-audit-stream");
});
