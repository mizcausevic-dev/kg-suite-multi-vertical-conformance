// index.mjs — Public API.
//
// computeMultiVerticalPosture(artifact) → { primary_vertical, matrix, recommendations }
//   matrix[i] = { vertical, applicability_score, posture, matched_signals, missing_signals, primary_repo }
//
// Posture values:
//   - applicable:     score ≥ 0.6 (strong fingerprint match)
//   - partial:        0.2 ≤ score < 0.6 (some signals match, missing key fields)
//   - not-applicable: score < 0.2

import { VERTICALS } from "./vertical-shapes.mjs";

function getNested(obj, path) {
  return path.split(".").reduce((acc, key) => (acc !== undefined && acc !== null ? acc[key] : undefined), obj);
}

function scoreOneVertical(artifact, vertical) {
  const signals = { matched: [], missing: [] };
  let score = 0;
  const maxScore = 4; // kind prefix (1) + regulatory_basis (1) + resource_type (1) + key_fields (1)

  // 1) kind prefix match
  if (typeof artifact.kind === "string" && vertical.kind_prefixes.some((p) => artifact.kind.startsWith(p))) {
    signals.matched.push(`kind-prefix:${vertical.kind_prefixes.find((p) => artifact.kind.startsWith(p))}`);
    score += 1;
  } else if (artifact.kind) {
    signals.missing.push(`kind-prefix:${vertical.kind_prefixes.join("|")}`);
  }

  // 2) regulatory_basis substring match
  const bases = Array.isArray(artifact.regulatory_basis) ? artifact.regulatory_basis : [];
  const matchedBases = bases.filter((b) => vertical.regulatory_basis_substrings.some((s) => b.includes(s)));
  if (matchedBases.length > 0) {
    signals.matched.push(`regulatory_basis:${matchedBases.length}-hits`);
    score += 1;
  } else if (bases.length > 0) {
    signals.missing.push(`regulatory_basis:${vertical.regulatory_basis_substrings.slice(0, 3).join("|")}+...`);
  }

  // 3) resource.type substring match
  const resType = getNested(artifact, "resource.type") || getNested(artifact, "resource.kind") || "";
  if (resType && vertical.resource_type_substrings.some((s) => resType.includes(s))) {
    signals.matched.push(`resource.type:${resType}`);
    score += 1;
  } else if (resType) {
    signals.missing.push(`resource.type-substring:${vertical.resource_type_substrings.slice(0, 3).join("|")}+...`);
  }

  // 4) key_fields presence (at least one)
  const matchedKeys = vertical.key_fields.filter((f) => getNested(artifact, f) !== undefined);
  if (matchedKeys.length > 0) {
    signals.matched.push(`key_fields:${matchedKeys.join(",")}`);
    score += 1;
  } else {
    signals.missing.push(`key_fields:${vertical.key_fields.join("|")}`);
  }

  const applicability_score = score / maxScore;
  let posture;
  if (applicability_score >= 0.6) posture = "applicable";
  else if (applicability_score >= 0.2) posture = "partial";
  else posture = "not-applicable";

  return {
    vertical: vertical.code,
    name: vertical.name,
    applicability_score: Math.round(applicability_score * 100) / 100,
    posture,
    matched_signals: signals.matched,
    missing_signals: signals.missing,
    primary_repo: vertical.primary_repo
  };
}

export function computeMultiVerticalPosture(artifact) {
  const matrix = VERTICALS.map((v) => scoreOneVertical(artifact, v))
    .sort((a, b) => b.applicability_score - a.applicability_score);

  const primary = matrix[0];
  const applicable = matrix.filter((m) => m.posture === "applicable");
  const partial = matrix.filter((m) => m.posture === "partial");

  const recommendations = [];
  if (applicable.length > 1) {
    recommendations.push(`Artifact applies to ${applicable.length} verticals (${applicable.map((m) => m.vertical).join(", ")}). Run per-vertical verification on each.`);
  }
  if (partial.length > 0) {
    recommendations.push(`Partial fingerprint match on ${partial.length} additional vertical(s) (${partial.map((m) => m.vertical).join(", ")}). Confirm whether artifact intentionally crosses these regulatory regimes.`);
  }
  if (applicable.length === 0) {
    recommendations.push(`No vertical reaches applicability threshold. Artifact may not be a KG Suite artifact, or vertical fingerprints need extension.`);
  }

  return {
    primary_vertical: primary.posture === "applicable" ? primary.vertical : null,
    matrix,
    applicable_count: applicable.length,
    partial_count: partial.length,
    recommendations
  };
}

export { VERTICALS };
