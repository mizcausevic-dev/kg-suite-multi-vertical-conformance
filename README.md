# kg-suite-multi-vertical-conformance

> Run any Kinetic Gain Protocol Suite artifact through **all 11 verticals' fingerprint heuristics** in one pass. Output is a per-vertical applicability posture matrix — *applicable / partial / not-applicable* — for buyer-side procurement reviewers evaluating multi-vertical SaaS vendors (e.g., a tool that touches HealthTech + FinTech + EdTech data simultaneously).

Part of the [Kinetic Gain Protocol Suite](https://suite.kineticgain.com).

## Why this exists

`kg-suite-vertical-router` routes ONE artifact to ONE vertical's verifier. That's the right answer when an artifact is unambiguously vertical-specific.

But many real-world SaaS vendors operate across regulatory regimes — a healthcare-fintech analytics platform, a defense-contractor HR tool, a government education portal. Their artifacts often **legitimately fingerprint to more than one vertical**. A buyer-side procurement reviewer needs to know which verticals' compliance regimes apply, not just the primary one.

This tool answers that question.

## How it works (v0.1 — fingerprint heuristic)

Each vertical has a fingerprint registry of:
- `kind_prefixes` (e.g., `defensetech.`, `fhir.`, `mortgage.`)
- `regulatory_basis_substrings` (e.g., `dfars-252-204`, `ferpa`, `nerc-cip`)
- `resource_type_substrings` (e.g., `technical-data-package`, `student`, `transmission`)
- `key_fields` whose presence is a strong signal (e.g., `resource.cui_categorization`, `agent.fcra_permissible_purpose`, `resource.privilege_tier`)

For each vertical, the tool counts matched signals (out of 4) → produces an `applicability_score` ∈ [0, 1] and a posture verdict:

| Score | Posture |
| --- | --- |
| ≥ 0.6 | **applicable** — strong fingerprint match; run this vertical's verifier |
| 0.2 – 0.6 | **partial** — some signals match; confirm whether the artifact intentionally crosses this regime |
| < 0.2 | **not-applicable** — fingerprint absent |

The output also includes `matched_signals` and `missing_signals` so reviewers can see *why* a posture was assigned, not just the verdict.

## Usage

```bash
npm install -g kg-suite-multi-vertical-conformance
kg-suite-multi-conformance artifact.json
# Primary vertical: defensetech
# Applicable: 1 · Partial: 0
#
# Per-vertical posture matrix:
#   ✓ defensetech  score=1.00  posture=applicable      matched=4/4
#   ✗ healthtech   score=0.00  posture=not-applicable  matched=0/4
#   ...

# Or with JSON output for downstream tooling:
kg-suite-multi-conformance artifact.json --json | jq '.matrix[] | select(.posture == "applicable")'
```

Library API:
```js
import { computeMultiVerticalPosture } from "kg-suite-multi-vertical-conformance";

const artifact = JSON.parse(fs.readFileSync("event.json", "utf8"));
const result = computeMultiVerticalPosture(artifact);
// result = { primary_vertical, matrix, applicable_count, partial_count, recommendations }
```

## Worked example: hybrid FinTech + HealthTech artifact

```json
{
  "kind": "fintech.credit-application.scored",
  "resource": { "type": "credit-application", "fhir_resource_type": "Patient" },
  "regulatory_basis": ["ecoa-reg-b", "fcra-reg-v", "hipaa-permissible-purpose"],
  "agent": { "fcra_permissible_purpose": "604(a)(3)(A)", "permissible_purpose_hipaa": "treatment" }
}
```

Output flags **both** `fintech` (applicable) and `healthtech` (applicable or partial), reflecting that this credit-application is ALSO touching PHI. Recommendation: run both verticals' verifiers, confirm the credit-scoring AI's HIPAA permissible-purpose is documented.

## Composes with

- [`kg-suite-vertical-router`](https://github.com/mizcausevic-dev/kg-suite-vertical-router) — single-vertical routing; this tool's complement for the multi-vertical case
- [`kg-suite-vertical-comparator`](https://github.com/mizcausevic-dev/kg-suite-vertical-comparator) — static cross-vertical reference; this tool gives the *artifact-specific* answer
- [`kg-suite-conformance-runner`](https://github.com/mizcausevic-dev/kg-suite-conformance-runner) — runs a single vertical's verifier; this tool tells you *which* verticals to invoke
- [`kg-suite-fleet-dashboard`](https://github.com/mizcausevic-dev/kg-suite-fleet-dashboard) — Suite-wide posture; this tool gives per-artifact posture
- [Kinetic Gain Protocol Suite](https://suite.kineticgain.com) — umbrella

## Limits (v0.1)

- **Heuristic, not authoritative.** A posture of `applicable` says "this artifact looks like it belongs to this vertical." It doesn't say the artifact *passes* that vertical's verifier — for that, run the vertical's actual verifier. Use this tool to *select* which verifiers to run, not to replace them.
- **4-signal fingerprint** — adequate for the current 11 verticals + their typical artifact shapes. Future versions may need weighted signals or per-shape (audit-stream vs Decision Card vs Evidence Bundle) fingerprint sets.
- **No async fetch / no network** — runs purely against the in-memory artifact. For artifacts that reference external Decision Card URLs, fetch separately and feed the resolved JSON in.

## License

MIT.
