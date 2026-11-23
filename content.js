/**
 * ============================================================================
 * node_pool — EDITABLE SITE CONTENT & RULE-BASED MODEL CONFIGURATION (IS 201)
 * ============================================================================
 * HOW TO EDIT THIS WEBSITE:
 * 1. Open this file (`content.js`) in any text editor (VS Code, Notepad, TextEdit).
 * 2. Edit any text inside quotes ("...") or numbers (weights, baselines, thresholds).
 * 3. Save this file and refresh `index.html` in your web browser.
 *
 * Everything on the website—including the live simulator math, the weight
 * matrix table in "Model & Ethics", the interaction rules, and the references—
 * updates automatically from this single file.
 * ============================================================================
 */

window.SITE_CONTENT = {
  // --------------------------------------------------------------------------
  // SITE METADATA & NAVIGATION
  // --------------------------------------------------------------------------
  meta: {
    brandName: "node_pool",
    brandTagline: "AI Credit Scoring Ethics Simulator",
    courseBadge: "IS 201",
    submissionNote: "Educational Simulation · Placeholder Draft",
    footerDisclaimer:
      "Built by node_pool for IS 201. This educational ethics simulator uses hypothetical baselines, weights, and rules to illustrate policy trade-offs—not real credit predictions."
  },

  // --------------------------------------------------------------------------
  // 1. OVERVIEW (HERO SECTION)
  // --------------------------------------------------------------------------
  hero: {
    eyebrow: "node_pool — AI Credit Scoring Ethics Simulator",
    headline: "Every lending algorithm makes a moral choice.",
    headlineAccent: "",
    subtext:
      "Explore how AI loan evaluation affects unbanked and thin-file borrowers. Adjust system policies, inspect trade-offs, and test ethical outcomes.",
    disclaimerTag:
      "Educational simulation · Hypothetical placeholder model · Not a real lending tool",
    primaryCta: "Open Policy Simulator",
    secondaryCta: "Explore Scenario & Stakeholders",
    previewTitle: "POLICY OUTCOME PREVIEW",
    previewSubtitle: "Select a stakeholder preset to inspect modeled trade-offs",
    quickStats: [
      { value: "5", label: "Decision Variables", detail: "0–100 policy sliders" },
      { value: "5", label: "Consequence Indicators", detail: "Baseline = 50 / 100" },
      { value: "4", label: "Interaction Rules", detail: "Distinct variable pairs" },
      { value: "4", label: "Stakeholder Presets", detail: "Competing viewpoints" }
    ]
  },

  // --------------------------------------------------------------------------
  // 2. THE SCENARIO & STAKEHOLDERS
  // --------------------------------------------------------------------------
  scenario: {
    sectionEyebrow: "IS 201 · CREDIT SCORING SCENARIO",
    title: "Evaluating Thin-File Borrowers with Algorithmic Lending",
    context:
      "A digital bank deploys an AI credit-scoring system to evaluate loan applications—including applicants with \"thin\" or no formal credit histories. While AI can expand financial access, it also risks hidden bias, privacy intrusion, and opaque rejections.",
    extendedContext:
      "Traditional credit bureaus rely on prior credit cards, mortgages, and formal bank records—systematically locking out gig workers, students, and unbanked households. Modern fintech lenders promise to bridge this gap using alternative behavioral data and machine learning. Yet every design choice—what data is scraped, how transparent rejections are, when humans intervene, how strictly bias is audited, and how aggressively models retrain—shifts burdens and benefits across society.",
    pipelineSteps: [
      {
        step: "01",
        title: "Data Ingestion",
        detail: "Traditional bureau files vs. utility, telco, e-wallet, and behavioral metadata."
      },
      {
        step: "02",
        title: "Algorithmic Scoring",
        detail: "ML risk models trained via lightweight batch updates or continuous cloud clusters."
      },
      {
        step: "03",
        title: "Oversight & Auditing",
        detail: "Automated instant cutoffs vs. demographic parity checks and human underwriter review."
      },
      {
        step: "04",
        title: "Borrower Outcome",
        detail: "Credit access or rejection—delivered as a black-box score or actionable adverse-action reasons."
      }
    ],
    stakeholders: [
      {
        id: "thin-file",
        role: "Affected Group",
        name: "Thin-File Applicants",
        description:
          "Freelancers, students, and low-income borrowers lacking traditional bank records.",
        priority: "Fair credit access, affordable loan terms, dignity, and clear steps to qualify if denied.",
        risk: "Being locked out by rigid bureau rules—or subjected to invasive phone/e-wallet surveillance and unappealable AI rejections.",
        linkedPresetId: "inclusion-advocate",
        linkedPresetLabel: "Test Inclusion Advocate Preset"
      },
      {
        id: "digital-lenders",
        role: "System Operator",
        name: "Digital Lenders",
        description:
          "Financial institutions seeking fast loan approvals and low default rates.",
        priority: "High predictive accuracy, low portfolio default rates, automated loan turnaround, and proprietary IP protection.",
        risk: "Over-relying on opaque black-box correlations, triggering regulatory fines, or excluding creditworthy thin-file segments.",
        linkedPresetId: "risk-averse-bank",
        linkedPresetLabel: "Test Risk-Averse Bank Preset"
      },
      {
        id: "regulators",
        role: "Public Oversight",
        name: "Financial Regulators",
        description:
          "Oversight bodies enforcing fairness, transparency, and consumer rights.",
        priority: "Non-discrimination compliance, auditability, right to explanation, data privacy, and systemic lending stability.",
        risk: "Struggling to audit rapidly shifting ML models or balancing innovation against consumer protection mandates.",
        linkedPresetId: "balanced-regulator",
        linkedPresetLabel: "Test Balanced Regulator Preset"
      },
      {
        id: "data-brokers",
        role: "Supply Chain & Compute",
        name: "Data Brokers & Infrastructure Providers",
        description:
          "Entities supplying alternative behavioral data and cloud compute.",
        priority: "Monetizing high-volume telco/e-wallet telemetry and scaling continuous cloud GPU training pipelines.",
        risk: "Normalizing invasive personal data harvesting without meaningful consent and escalating data-center carbon/energy footprints.",
        linkedPresetId: "privacy-officer",
        linkedPresetLabel: "Contrast with Privacy Officer Preset"
      }
    ]
  },

  // --------------------------------------------------------------------------
  // 3A. STAKEHOLDER PRESETS (QUICK-START MODES)
  // --------------------------------------------------------------------------
  presets: [
    {
      id: "inclusion-advocate",
      name: "Inclusion Advocate",
      shortSummary: "High alternative data, high human review, high transparency.",
      rationale:
        "Maximizes thin-file financial inclusion by accepting alternative utility/telco records while pairing them with strong human appeals, bias audits, and clear explanations—accepting higher operational and privacy trade-offs.",
      values: {
        altData: 85,
        transparency: 80,
        humanReview: 80,
        fairnessAudit: 75,
        computeIntensity: 55
      }
    },
    {
      id: "risk-averse-bank",
      name: "Risk-Averse Bank",
      shortSummary: "Traditional bureau data only, low human review, low transparency.",
      rationale:
        "Protects institutional margins and proprietary scoring logic using conservative bureau records and automated cutoffs—minimizing manual underwriting costs at the expense of thin-file exclusion and low accountability.",
      values: {
        altData: 15,
        transparency: 20,
        humanReview: 20,
        fairnessAudit: 25,
        computeIntensity: 65
      }
    },
    {
      id: "privacy-officer",
      name: "Privacy & Ethics Officer",
      shortSummary: "Minimal data collection, strict fairness audits, high transparency.",
      rationale:
        "Enforces strict data minimization and glass-box explainability while running rigorous fairness audits on traditional bureau features (triggering the Exclusion Shield)—trading off raw predictive speed for civil liberties.",
      values: {
        altData: 20,
        transparency: 85,
        humanReview: 70,
        fairnessAudit: 85,
        computeIntensity: 30
      }
    },
    {
      id: "balanced-regulator",
      name: "Balanced Regulator",
      shortSummary: "Moderate alternative data, mandatory appeal reviews, periodic audits.",
      rationale:
        "Seeks a pragmatic policy compromise: regulated utility/telco opt-in data, mandatory human appeal pathways, clear adverse-action notices, and scheduled batch retraining to keep energy and risk in check.",
      values: {
        altData: 55,
        transparency: 75,
        humanReview: 70,
        fairnessAudit: 70,
        computeIntensity: 45
      }
    }
  ],

  // --------------------------------------------------------------------------
  // 3B. 5 DECISION VARIABLES (0-100 SLIDERS)
  // --------------------------------------------------------------------------
  decisionVariables: [
    {
      id: "altData",
      code: "D1",
      name: "Alternative Data Depth",
      shortLow: "Bureau only",
      shortHigh: "Full behavioral",
      description:
        "How much non-traditional data (utility bills, telco, e-wallet, social behavior) the AI analyzes.",
      lowLabel: "0 · Traditional bureau records only",
      midLabel: "50 · Opt-in utility & telco bills",
      highLabel: "100 · Deep e-wallet & social behavior scraping",
      quickOptions: [
        { label: "Bureau Only", value: 15 },
        { label: "Regulated Bills", value: 50 },
        { label: "Full Behavioral", value: 85 }
      ]
    },
    {
      id: "transparency",
      code: "D2",
      name: "Model Transparency",
      shortLow: "Black-box score",
      shortHigh: "Clear reasons",
      description:
        "Level of explainability provided to denied applicants (from black-box score to clear adverse-action reasons).",
      lowLabel: "0 · Proprietary black-box cutoff",
      midLabel: "50 · Summary reason codes",
      highLabel: "100 · Clear adverse-action & counterfactual steps",
      quickOptions: [
        { label: "Black Box", value: 20 },
        { label: "Reason Codes", value: 55 },
        { label: "Full Explainability", value: 85 }
      ]
    },
    {
      id: "humanReview",
      code: "D3",
      name: "Human Review Level",
      shortLow: "Auto-only",
      shortHigh: "Human appeals",
      description:
        "Degree of human oversight for borderline applications and customer appeals.",
      lowLabel: "0 · 100% automated instant decision",
      midLabel: "50 · Appeals reviewed on request",
      highLabel: "100 · Mandatory underwriter review on borderline & appeals",
      quickOptions: [
        { label: "Auto-Only", value: 15 },
        { label: "Spot Appeals", value: 50 },
        { label: "Mandatory Review", value: 80 }
      ]
    },
    {
      id: "fairnessAudit",
      code: "D4",
      name: "Fairness Auditing Strictness",
      shortLow: "Unchecked",
      shortHigh: "Strict parity",
      description:
        "Frequency and strength of demographic bias testing and parity adjustments.",
      lowLabel: "0 · No demographic bias checks",
      midLabel: "50 · Annual compliance audit",
      highLabel: "100 · Continuous parity constraints & proxy pruning",
      quickOptions: [
        { label: "Unchecked", value: 20 },
        { label: "Periodic Audit", value: 55 },
        { label: "Strict Parity", value: 85 }
      ]
    },
    {
      id: "computeIntensity",
      code: "D5",
      name: "Compute & Retraining Intensity",
      shortLow: "Batch updates",
      shortHigh: "Real-time cloud",
      description:
        "Frequency of real-time model retraining on large cloud clusters vs. lightweight batch updates.",
      lowLabel: "0 · Lightweight quarterly batch update",
      midLabel: "50 · Scheduled monthly retraining",
      highLabel: "100 · Continuous real-time cloud GPU retraining",
      quickOptions: [
        { label: "Light Batch", value: 25 },
        { label: "Monthly Sync", value: 50 },
        { label: "Real-Time Cloud", value: 85 }
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // 3C. 5 CONSEQUENCE INDICATORS (0-100 SCALE, BASELINE = 50)
  // --------------------------------------------------------------------------
  indicators: [
    {
      id: "equity",
      name: "Equity & Social Justice",
      subtitle: "Financial Inclusion",
      pillarTag: "Core Area · Equity & Social Justice",
      color: "#1f6357",
      baseline: 50,
      description: "Ability of thin-file applicants to qualify fairly for credit.",
      weights: {
        altData: 22,
        transparency: 8,
        humanReview: 14,
        fairnessAudit: 18,
        computeIntensity: 4
      }
    },
    {
      id: "governance",
      name: "Technology Governance",
      subtitle: "Accountability",
      pillarTag: "Core Area · Technology Governance",
      color: "#234e70",
      baseline: 50,
      description: "Ability of applicants and regulators to audit and contest decisions.",
      weights: {
        altData: -8,
        transparency: 24,
        humanReview: 18,
        fairnessAudit: 14,
        computeIntensity: -8
      }
    },
    {
      id: "sustainability",
      name: "Computing & Sustainability",
      subtitle: "Eco-Efficiency",
      pillarTag: "Core Area · Computing & Sustainability",
      color: "#3a6b35",
      baseline: 50,
      description: "Environmental efficiency of data storage and model retraining.",
      weights: {
        altData: -12,
        transparency: 6,
        humanReview: 0,
        fairnessAudit: -6,
        computeIntensity: -30
      }
    },
    {
      id: "privacy",
      name: "Privacy & Data Protection",
      subtitle: "Informational Rights",
      pillarTag: "Applied Area · Privacy & Digital Rights",
      color: "#7a4928",
      baseline: 50,
      description: "Protection of applicants from invasive data harvesting.",
      weights: {
        altData: -30,
        transparency: 10,
        humanReview: -4,
        fairnessAudit: 8,
        computeIntensity: -6
      }
    },
    {
      id: "innovation",
      name: "Responsible Innovation",
      subtitle: "Lending Reliability",
      pillarTag: "Core Area · Responsible Innovation",
      color: "#9e3a26",
      baseline: 50,
      description: "Predictive accuracy and protection against mass loan defaults.",
      weights: {
        altData: 16,
        transparency: -7,
        humanReview: -6,
        fairnessAudit: -6,
        computeIntensity: 22
      }
    }
  ],

  // Score interpretation tiers (0-100)
  scoreBands: [
    { min: 75, max: 100, label: "Strong", cssClass: "band-strong" },
    { min: 60, max: 74, label: "Balanced", cssClass: "band-balanced" },
    { min: 40, max: 59, label: "Needs Attention", cssClass: "band-warn" },
    { min: 0, max: 39, label: "Critical Risk", cssClass: "band-critical" }
  ],

  // --------------------------------------------------------------------------
  // 3D. 4 VARIABLE INTERACTIONS (CONDITIONAL RULES ON DISTINCT PAIRS)
  // --------------------------------------------------------------------------
  interactions: [
    {
      id: "surveillance-trap",
      name: "Surveillance Trap",
      pairLabel: "Alternative Data Depth × Model Transparency",
      conditions: [
        { variableId: "altData", operator: ">", threshold: 70 },
        { variableId: "transparency", operator: "<", threshold: 60 }
      ],
      targetIndicatorId: "privacy",
      delta: -15,
      conditionSummary: "When Alternative Data > 70 and Model Transparency < 60",
      justification:
        "Privacy drops by -15 pts because non-financial personal behavior is scraped behind an opaque model, preventing borrowers from seeing or contesting how intimate lifestyle metadata is used.",
      evidenceRef: "Placeholder 3 — Data Privacy & Regulation",
      demoValues: { altData: 85, transparency: 35, humanReview: 50, fairnessAudit: 50, computeIntensity: 50 }
    },
    {
      id: "blind-review-penalty",
      name: "Blind Review Penalty",
      pairLabel: "Human Review Level × Model Transparency",
      conditions: [
        { variableId: "humanReview", operator: ">", threshold: 60 },
        { variableId: "transparency", operator: "<", threshold: 40 }
      ],
      targetIndicatorId: "governance",
      delta: -10,
      conditionSummary: "When Human Review > 60 but Model Transparency < 40",
      justification:
        "Governance loses -10 pts because human reviewers cannot explain or meaningfully audit a black-box score, turning oversight into 'rubber-stamping' and automation bias.",
      evidenceRef: "Placeholder 4 — Explainable AI & Governance",
      demoValues: { altData: 50, transparency: 25, humanReview: 75, fairnessAudit: 50, computeIntensity: 50 }
    },
    {
      id: "exclusion-shield",
      name: "Exclusion Shield",
      pairLabel: "Fairness Auditing Strictness × Alternative Data Depth",
      conditions: [
        { variableId: "altData", operator: "<", threshold: 30 },
        { variableId: "fairnessAudit", operator: ">", threshold: 70 }
      ],
      targetIndicatorId: "equity",
      delta: 12,
      conditionSummary: "When Alternative Data < 30 and Fairness Auditing > 70",
      justification:
        "Equity gains +12 pts by actively correcting historical bias and demographic proxy redlining in traditional credit bureaus even when invasive alternative data is restricted.",
      evidenceRef: "Placeholder 2 — Algorithmic Bias & Credit",
      demoValues: { altData: 20, transparency: 75, humanReview: 60, fairnessAudit: 85, computeIntensity: 40 }
    },
    {
      id: "compute-footprint-spike",
      name: "Compute Footprint Spike",
      pairLabel: "Compute & Retraining Intensity × Alternative Data Depth",
      conditions: [
        { variableId: "computeIntensity", operator: ">", threshold: 70 },
        { variableId: "altData", operator: ">", threshold: 70 }
      ],
      targetIndicatorId: "sustainability",
      delta: -14,
      conditionSummary: "When both Retraining Intensity > 70 and Alternative Data > 70",
      justification:
        "Sustainability drops by -14 pts due to heavy continuous cloud processing, feature extraction, and GPU retraining over massive unstructured behavioral data streams.",
      evidenceRef: "Placeholder 5 — Green AI & Compute",
      demoValues: { altData: 85, transparency: 65, humanReview: 50, fairnessAudit: 50, computeIntensity: 85 }
    }
  ],

  // --------------------------------------------------------------------------
  // 4. MODEL & ETHICS (TRANSPARENCY TAB)
  // --------------------------------------------------------------------------
  modelAndEthics: {
    sectionEyebrow: "MODEL TRANSPARENCY & ETHICAL REASONING",
    title: "How the Rule-Based Model & Ethical Trade-Offs Work",
    hypotheticalBanner:
      "HYPOTHETICAL PLACEHOLDER MODEL: This simulator illustrates ethical trade-offs in algorithmic credit scoring. It does not predict real-world default rates or bank approvals. All baselines, weights, and interaction deltas below are explicitly labeled placeholder values.",
    howScoringWorks:
      "Every indicator starts at a neutral baseline of 50/100. Decision sliders add or subtract weighted points, trigger interaction rules, and clamp final scores between 0 and 100.",
    formulaText:
      "Final Indicator = clamp( 50 + Σ [ Weight × ((Slider − 50) / 50) ] + Σ [ Triggered Interaction Deltas ], 0, 100 )",
    weightSettingExplanation:
      "Placeholder weights are scaled proportionally to the ethical magnitude of each policy lever: primary structural drivers (such as Alternative Data on Privacy [-30] or Compute Intensity on Sustainability [-30]) carry ±22 to ±30 max points, secondary governance/oversight levers carry ±12 to ±18 max points, and indirect friction effects carry ±4 to ±10 max points.",
    tradeOffs: [
      {
        title: "Inclusion vs. Privacy",
        competingInterests: "Thin-File Applicants seeking access vs. Consumer Privacy Rights",
        summary:
          "Using alternative data helps thin-file borrowers get approved, but sacrifices personal privacy.",
        detail:
          "Expanding `Alternative Data Depth` (+22 Equity, +16 Reliability) unlocks credit for unbanked freelancers and students, yet directly penalizes `Privacy & Data Protection` (-30) and risks triggering the Surveillance Trap (-15) if paired with low transparency."
      },
      {
        title: "Speed vs. Accountability",
        competingInterests: "Digital Lenders' operational efficiency vs. Applicants' due process",
        summary:
          "Full automation lowers bank costs, but removes due process for edge-case applicants.",
        detail:
          "High `Human Review` (+18 Governance, +14 Equity) and `Model Transparency` (+24 Governance) empower applicants to contest errors, but slightly reduce `Lending Reliability` (-6 and -7) due to underwriting latency and gaming risk—and fail if humans review black-box scores (Blind Review Penalty, -10)."
      },
      {
        title: "Accuracy vs. Sustainability",
        competingInterests: "Portfolio risk calibration vs. Environmental compute stewardship",
        summary:
          "Real-time retraining improves predictions, but increases carbon and energy footprints.",
        detail:
          "Cranking `Compute & Retraining Intensity` (+22 Reliability) keeps default predictions calibrated during economic shifts, but severely degrades `Computing & Sustainability` (-30) and triggers the Compute Footprint Spike (-14) when combined with high-volume behavioral data."
      }
    ],
    courseConcepts: [
      {
        category: "Central Course Pillar 1",
        name: "Equity & Social Justice",
        howItShapesModel:
          "Modeled directly via the Financial Inclusion indicator, weighting non-traditional credit visibility, human hardship review, and the Exclusion Shield interaction that mitigates historical bureau redlining."
      },
      {
        category: "Central Course Pillar 2",
        name: "Technology Governance & Responsible Innovation",
        howItShapesModel:
          "Split into two distinct indicators—Accountability (auditability, contestability, Blind Review Penalty) and Lending Reliability (default calibration)—exposing the tension between rapid fintech deployment and institutional oversight."
      },
      {
        category: "Central Course Pillar 3",
        name: "Computing & Sustainability",
        howItShapesModel:
          "Shapes the Eco-Efficiency indicator through negative weights on raw behavioral data retention, counterfactual audit compute, and continuous cloud GPU retraining (Compute Footprint Spike)."
      },
      {
        category: "Applied Area A",
        name: "Privacy, Data, & Digital Rights",
        howItShapesModel:
          "Governs informational self-determination in the Privacy indicator: data minimization raises scores, while behavioral scraping without explainability triggers the -15 pt Surveillance Trap."
      },
      {
        category: "Applied Area B",
        name: "AI (Explainable AI & Algorithmic Bias)",
        howItShapesModel:
          "Models the accuracy-interpretability trade-off, automation bias when human reviewers oversee black-box AI, and proxy discrimination mitigation via Fairness Auditing Strictness."
      },
      {
        category: "Applied Area C",
        name: "Ethical Frameworks & Professional Responsibility",
        howItShapesModel:
          "Embedded in the 4 Stakeholder Presets—contrasting Utilitarian portfolio efficiency (Risk-Averse Bank), Rawlsian justice for the least advantaged (Inclusion Advocate), and Deontological rights/duties (Privacy & Ethics Officer)."
      }
    ],
    assumptionsAndLimitations: [
      "All weights, baselines, and point deltas in this draft are hypothetical placeholder values designed to illustrate policy trade-offs rather than predict real bank default rates.",
      "Linear base effects assume smooth proportional change between 0 and 100, whereas real credit markets exhibit institutional, legal, and macroeconomic shocks.",
      "Thin-file borrowers are modeled as one stakeholder group here, though freelancers, rural unbanked households, and students face distinct data-availability barriers.",
      "Regulatory compliance thresholds (e.g., interaction cutoffs at 30, 40, 60, and 70) represent stylized policy tipping points that our group will ground in literature in the Evidence tab."
    ]
  },

  // --------------------------------------------------------------------------
  // 5. EVIDENCE & REFERENCES (PLACEHOLDER TAB)
  // --------------------------------------------------------------------------
  evidence: {
    sectionEyebrow: "EVIDENCE & LITERATURE GROUNDING",
    title: "Credible Sources Supporting the Model",
    subtitle:
      "Draft placeholder entries prepared for group literature verification. Edit `evidence.items` in `content.js` to insert verified academic papers, laws, and institutional guidelines.",
    items: [
      {
        id: "ref-1",
        tag: "Placeholder 1 — Financial Inclusion & Thin Files",
        status: "Placeholder · Needs Citation",
        supportsRules: "Alternative Data → Equity (+22) & Lending Reliability (+16)",
        placeholderPrompt:
          "Insert citation on how alternative data (telco/utility payments) expands credit access for unbanked populations.",
        citationDraft: "Author, A. A. (Year). [Title of study on alternative credit scoring & thin-file financial inclusion]. Journal / World Bank / BSP Working Paper.",
        keyTakeaway:
          "To verify: Empirical evidence showing utility, telco, and cash-flow payment histories help score creditworthy unbanked applicants missed by traditional bureaus."
      },
      {
        id: "ref-2",
        tag: "Placeholder 2 — Algorithmic Bias & Credit",
        status: "Placeholder · Needs Citation",
        supportsRules: "Fairness Auditing → Equity (+18) & Exclusion Shield Interaction (+12)",
        placeholderPrompt:
          "Insert citation on historical proxy discrimination in automated credit scoring.",
        citationDraft: "Author, B. B. (Year). [Title of paper on algorithmic redlining, proxy discrimination, and fairness constraints in lending]. Conference / Law Review.",
        keyTakeaway:
          "To verify: Evidence that geographic, educational, or behavioral variables can act as proxies for protected groups unless fairness auditing and parity adjustments are enforced."
      },
      {
        id: "ref-3",
        tag: "Placeholder 3 — Data Privacy & Regulation",
        status: "Placeholder · Needs Citation",
        supportsRules: "Alternative Data → Privacy (-30) & Surveillance Trap Interaction (-15)",
        placeholderPrompt:
          "Insert citation on data minimization and consumer privacy laws (e.g., RA 10173 / RA 9510).",
        citationDraft: "Republic Act No. 10173 (Data Privacy Act of 2012) & Republic Act No. 9510 (Credit Information System Act), Philippines.",
        keyTakeaway:
          "To verify: Legal principles of proportionality, transparency, and legitimate purpose limiting invasive non-financial behavioral data scraping."
      },
      {
        id: "ref-4",
        tag: "Placeholder 4 — Explainable AI & Governance",
        status: "Placeholder · Needs Citation",
        supportsRules: "Model Transparency → Governance (+24) & Blind Review Penalty (-10)",
        placeholderPrompt:
          "Insert citation on the right to explanation and human-in-the-loop oversight in high-risk AI.",
        citationDraft: "Author, C. C. / EU AI Act / NIST AI RMF (Year). [Source on high-risk credit AI explainability, adverse-action notices, and human rubber-stamping].",
        keyTakeaway:
          "To verify: Research demonstrating that human-in-the-loop oversight fails ('automation bias' / rubber-stamping) when operators lack interpretable explanations for model scores."
      },
      {
        id: "ref-5",
        tag: "Placeholder 5 — Green AI & Compute",
        status: "Placeholder · Needs Citation",
        supportsRules: "Compute Intensity → Sustainability (-30) & Compute Footprint Spike (-14)",
        placeholderPrompt:
          "Insert citation on the environmental cost of continuous large-scale model training.",
        citationDraft: "Schwartz, R., Dodge, J., Smith, N. A., & Etzioni, O. (2020) / Patterson et al. [Insert verified Green AI / ML energy consumption source].",
        keyTakeaway:
          "To verify: Findings on escalating electricity, carbon, and water footprints caused by frequent retraining on large streaming datasets vs. lightweight batch models."
      }
    ]
  }
};
