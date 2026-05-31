# Changelog

## [0.1] — 2026-05-31

### Added

- Initial release. `computeMultiVerticalPosture(artifact)` runs an artifact through fingerprint heuristics for all 10 KG Suite verticals (HealthTech / EdTech / PropTech / InsurTech / HR Tech / FinTech / GovTech / LegalTech / EnergyTech / DefenseTech).
- Per-vertical 4-signal fingerprint: kind prefix · regulatory_basis substring · resource.type substring · key field presence.
- Posture verdicts: applicable (≥0.6) · partial (0.2–0.6) · not-applicable (<0.2).
- Output includes `matched_signals` + `missing_signals` for explainability + `primary_repo` for downstream routing.
- `kg-suite-multi-conformance` CLI: stdin / file input, human-readable or `--json` output.
- 8 unit tests including: 10-vertical registry, single-vertical defense event, sorted matrix, multi-vertical hybrid detection, empty-artifact, recommendations.

### Not yet

- Weighted signal scoring (today all 4 signals contribute equally).
- Per-artifact-shape fingerprints (audit-stream events vs Decision Cards vs Evidence Bundles may need shape-specific fingerprints).
- Cross-binding-ref resolution (today doesn't follow `cross_binding_refs` URLs to verify the referenced artifacts also fit the same verticals).
- Confidence intervals / Bayesian posterior on applicability_score.
