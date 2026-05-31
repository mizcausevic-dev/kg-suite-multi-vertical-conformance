// vertical-shapes.mjs — Per-vertical fingerprint registry.
//
// Each vertical has a "fingerprint" of telltale fields, kind prefixes,
// regulatory_basis values, and resource.type values. The conformance
// tool inspects an artifact and computes, per vertical:
//   - applicability_score (0-1): how strongly this artifact matches the
//     vertical's fingerprint
//   - posture: applicable | partial | not-applicable
//   - matched_signals + missing_signals: what tipped the decision

export const VERTICALS = [
  {
    code: "healthtech",
    name: "HealthTech",
    kind_prefixes: ["healthtech.", "fhir."],
    regulatory_basis_substrings: ["hipaa", "fda-samd", "imdrf", "section-1557", "hitech"],
    resource_type_substrings: ["fhir", "patient", "phi", "clinical", "medical-device"],
    key_fields: ["resource.fhir_resource_type", "agent.permissible_purpose_hipaa"],
    primary_repo: "fhir-resource-access-audit"
  },
  {
    code: "edtech",
    name: "EdTech",
    kind_prefixes: ["edtech.", "student-data."],
    regulatory_basis_substrings: ["ferpa", "coppa", "idea-", "section-504", "essa", "soppa", "ed-law-2-d", "scope-tx", "chaipa"],
    resource_type_substrings: ["student", "iep", "lep", "ed-fi", "ceds"],
    key_fields: ["resource.ferpa_basis", "agent.school_official_or_consent_basis"],
    primary_repo: "student-data-access-audit-stream"
  },
  {
    code: "proptech",
    name: "PropTech",
    kind_prefixes: ["proptech.", "mortgage.", "real-estate."],
    regulatory_basis_substrings: ["respa", "ecoa", "fair-housing", "hmda", "glba", "cfpb-udaap", "tila-respa-trid", "nar-2024-settlement"],
    resource_type_substrings: ["mortgage", "loan-application", "appraisal", "title", "mls", "urla", "mismo"],
    key_fields: ["agent.human_underwriter_required"],
    primary_repo: "mortgage-decision-record-audit-stream"
  },
  {
    code: "insurtech",
    name: "InsurTech",
    kind_prefixes: ["insurtech.", "insurance.", "underwriting.", "claims.", "pricing."],
    regulatory_basis_substrings: ["naic-ai-model-bulletin", "ny-dfs-cl-7", "co-sb-21-169", "ca-doi-bulletin", "fcra", "acord"],
    resource_type_substrings: ["policy", "claim", "underwriting", "policyholder", "acord"],
    key_fields: ["agent.human_adjudicator_required"],
    primary_repo: "insurance-decision-record-audit-stream"
  },
  {
    code: "hrtech",
    name: "HR Tech",
    kind_prefixes: ["hrtech.", "employment.", "hiring.", "candidate."],
    regulatory_basis_substrings: ["eeoc-ai-guidance", "title-vii", "ada-", "adea-", "gina-", "ofccp", "nyc-ll-144", "il-820-ilcs-42", "md-hb-1202", "ugesp"],
    resource_type_substrings: ["candidate", "employee", "performance-review", "interview"],
    key_fields: ["agent.human_hiring_decision_required", "agent.ll_144_candidate_notice_provided"],
    primary_repo: "employment-decision-record-audit-stream"
  },
  {
    code: "fintech",
    name: "FinTech",
    kind_prefixes: ["fintech.", "credit.", "deposit.", "payment.", "fraud.", "aml."],
    regulatory_basis_substrings: ["cfpb-ai-bulletin", "section-1071", "section-1033", "occ-2011-12", "frb-sr-11-7", "ecoa-reg-b", "fcra-reg-v", "bsa-aml", "fincen"],
    resource_type_substrings: ["credit-application", "deposit", "payment", "ach", "swift", "robo-advisor", "fincen-sar"],
    key_fields: ["agent.human_credit_officer_required", "agent.fcra_permissible_purpose"],
    primary_repo: "financial-decision-record-audit-stream"
  },
  {
    code: "govtech",
    name: "GovTech",
    kind_prefixes: ["govtech.", "agency.", "fed.", "state-agency."],
    regulatory_basis_substrings: ["omb-m-24-10", "omb-m-24-18", "ai-bill-of-rights", "section-508", "privacy-act", "foia", "nist-ai-rmf", "fedramp"],
    resource_type_substrings: ["benefit-determination", "permit", "tax-admin", "agency-chatbot"],
    key_fields: ["agent.human_agency_officer_required", "agent.federal_ai_use_case_inventory_entry_id", "agent.classification_clearance"],
    primary_repo: "government-decision-record-audit-stream"
  },
  {
    code: "legaltech",
    name: "LegalTech",
    kind_prefixes: ["legaltech.", "matter.", "litigation.", "discovery."],
    regulatory_basis_substrings: ["aba-rule", "attorney-client-privilege", "work-product-doctrine", "mata-v-avianca", "fed-r-evid-502", "abamodelrule", "bar-opinion"],
    resource_type_substrings: ["matter", "engagement-letter", "filed-brief", "tribunal-disclosure"],
    key_fields: ["resource.privilege_tier", "agent.supervising_attorney_bar_id"],
    primary_repo: "matter-decision-record-audit-stream"
  },
  {
    code: "energytech",
    name: "EnergyTech",
    kind_prefixes: ["energytech.", "grid.", "transmission.", "pipeline.", "ferc.", "puc."],
    regulatory_basis_substrings: ["nerc-cip", "ferc-order", "tsa-sd-2021-02", "doe-eo-14028", "epa-clean-air-act", "iso-rto-bpm"],
    resource_type_substrings: ["transmission", "load-forecast", "outage", "pipeline-scada", "der"],
    key_fields: ["resource.bes_cyber_system_categorization", "resource.ot_it_boundary", "agent.nerc_certification_id_tokenized"],
    primary_repo: "grid-decision-record-audit-stream"
  },
  {
    code: "defensetech",
    name: "DefenseTech",
    kind_prefixes: ["defensetech.", "dfars.", "cmmc.", "itar.", "ear."],
    regulatory_basis_substrings: ["dfars-252-204", "cmmc-2-0", "nist-sp-800-171", "nist-sp-800-172", "itar-22-cfr-120", "ear-15-cfr-730", "ear-deemed-export", "dodi-5230-24", "cui-notice-2020-04", "nispom-32-cfr-117"],
    resource_type_substrings: ["cui", "technical-data-package", "weapon-system", "classified", "cage"],
    key_fields: ["resource.cui_categorization", "resource.export_control_status", "resource.foreign_person_access_restriction"],
    primary_repo: "defense-decision-record-audit-stream"
  }
];
