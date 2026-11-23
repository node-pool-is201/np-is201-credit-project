#!/usr/bin/env node
/**
 * node_pool · IS 201 CI Validation Suite
 * Supports multi-stage pipeline checks with zero external npm dependencies:
 *   node scripts/validate-project.js --stage=syntax
 *   node scripts/validate-project.js --stage=rubric
 *   node scripts/validate-project.js --stage=simulation
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const stageArg = (process.argv.find((a) => a.startsWith("--stage=")) || "--stage=all").split("=")[1];

const REQUIRED_FILES = ["index.html", "styles.css", "app.js", "content.js", "firebase.json", ".firebaserc"];
const CONFLICT_REGEX = /^(<{7}|={7}|>{7})(\s|$)/m;

function fail(msg) {
  console.error(`❌ [FAIL] ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ [PASS] ${msg}`);
}

function loadSiteContent() {
  const contentPath = path.join(ROOT, "content.js");
  const code = fs.readFileSync(contentPath, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: "content.js" });
  if (!sandbox.window || !sandbox.window.SITE_CONTENT) {
    fail("window.SITE_CONTENT was not defined in content.js");
  }
  return sandbox.window.SITE_CONTENT;
}

function runSyntaxStage() {
  console.log("=== Stage 1: Syntax & Merge-Conflict Check ===");
  for (const rel of REQUIRED_FILES) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) fail(`Missing required file: ${rel}`);
    const raw = fs.readFileSync(full, "utf8");
    if (!raw.trim()) fail(`Required file is empty: ${rel}`);
    if (CONFLICT_REGEX.test(raw)) fail(`Unresolved Git merge conflict markers found in ${rel}`);
  }
  pass("All required static & Firebase files present and conflict-free");

  for (const jsFile of ["content.js", "app.js"]) {
    try {
      execFileSync(process.execPath, ["--check", path.join(ROOT, jsFile)], { stdio: "pipe" });
      pass(`JavaScript syntax valid: ${jsFile}`);
    } catch (err) {
      fail(`Syntax error in ${jsFile}:\n${err.stderr ? err.stderr.toString() : err.message}`);
    }
  }

  for (const jsonFile of ["firebase.json", ".firebaserc"]) {
    try {
      JSON.parse(fs.readFileSync(path.join(ROOT, jsonFile), "utf8"));
      pass(`JSON syntax valid: ${jsonFile}`);
    } catch (err) {
      fail(`Invalid JSON in ${jsonFile}: ${err.message}`);
    }
  }
}

function runRubricStage() {
  console.log("=== Stage 2: IS 201 Rubric & Schema Gate ===");
  const data = loadSiteContent();

  // 1. Decision variables >= 5, each with >= 2 meaningful options
  const vars = data.decisionVariables;
  if (!Array.isArray(vars) || vars.length < 5) {
    fail("IS 201 Rubric requires at least 5 decision variables in content.js");
  }
  const varIds = new Set();
  for (const v of vars) {
    if (!v.id || !v.name || !v.description) fail(`Decision variable missing id/name/description: ${JSON.stringify(v)}`);
    if (varIds.has(v.id)) fail(`Duplicate decision variable id: ${v.id}`);
    varIds.add(v.id);
    if (!Array.isArray(v.quickOptions) || v.quickOptions.length < 2) {
      fail(`Decision variable "${v.id}" must provide at least 2 meaningful options`);
    }
  }
  pass(`${vars.length} decision variables verified with valid options`);

  // 2. Consequence indicators >= 5, baseline = 50, covering required pillars
  const inds = data.indicators;
  if (!Array.isArray(inds) || inds.length < 5) {
    fail("IS 201 Rubric requires at least 5 consequence indicators in content.js");
  }
  const indIds = new Set();
  for (const ind of inds) {
    if (!ind.id || !ind.name) fail("Indicator missing id or name");
    if (indIds.has(ind.id)) fail(`Duplicate indicator id: ${ind.id}`);
    indIds.add(ind.id);
    if (typeof ind.baseline !== "number" || ind.baseline < 0 || ind.baseline > 100) {
      fail(`Indicator "${ind.id}" must have a numeric baseline between 0 and 100`);
    }
    let influencingCount = 0;
    for (const vId of varIds) {
      const w = ind.weights && ind.weights[vId];
      if (typeof w !== "number" || Number.isNaN(w)) {
        fail(`Indicator "${ind.id}" is missing numeric weight for variable "${vId}"`);
      }
      if (w !== 0) influencingCount++;
    }
    if (influencingCount < 2) {
      fail(`IS 201 Rubric requires multiple variables to affect indicator "${ind.id}"`);
    }
  }
  pass(`${inds.length} consequence indicators verified with multi-variable weights`);

  // 3. 4+ Variable interactions, EACH ON A DISTINCT PAIR OF VARIABLES, with justification
  const rules = data.interactions;
  if (!Array.isArray(rules) || rules.length < 4) {
    fail("IS 201 Rubric requires at least 4 conditional variable interactions");
  }
  const seenPairs = new Set();
  for (const r of rules) {
    if (!r.id || !r.name || !r.justification || !r.justification.trim()) {
      fail(`Interaction "${r.id || "unknown"}" is missing name or ethical justification`);
    }
    if (!indIds.has(r.targetIndicatorId)) {
      fail(`Interaction "${r.id}" references unknown targetIndicatorId "${r.targetIndicatorId}"`);
    }
    if (!Array.isArray(r.conditions) || r.conditions.length < 2) {
      fail(`Interaction "${r.id}" must link at least 2 decision variables`);
    }
    const condVars = [...new Set(r.conditions.map((c) => c.variableId))].sort();
    if (condVars.length < 2) {
      fail(`Interaction "${r.id}" must reference at least 2 distinct decision variables`);
    }
    for (const cv of condVars) {
      if (!varIds.has(cv)) fail(`Interaction "${r.id}" references unknown variable "${cv}"`);
    }
    const pairKey = condVars.join("×");
    if (seenPairs.has(pairKey)) {
      fail(`IS 201 Rubric violation: Duplicate variable pair "${pairKey}" in interaction "${r.id}". Every interaction must use a distinct pair!`);
    }
    seenPairs.add(pairKey);
  }
  pass(`${rules.length} conditional interactions verified on ${seenPairs.size} distinct variable pairs`);

  // 4. Transparency, Hypothetical Disclaimer, Stakeholders, & Evidence
  if (!data.hero?.disclaimerTag || !data.modelAndEthics?.hypotheticalBanner) {
    fail("Hypothetical model disclaimers must remain clearly defined");
  }
  if (!Array.isArray(data.scenario?.stakeholders) || data.scenario.stakeholders.length < 3) {
    fail("Scenario must define affected stakeholders");
  }
  if (!Array.isArray(data.evidence?.items) || data.evidence.items.length < 5) {
    fail("Evidence tab must include at least 5 reference entries");
  }
  pass("Stakeholders, model transparency, hypothetical labels, and evidence entries verified");
}

function evaluateRuleCondition(cond, values) {
  const actual = values[cond.variableId];
  switch (cond.operator) {
    case ">": return actual > cond.threshold;
    case ">=": return actual >= cond.threshold;
    case "<": return actual < cond.threshold;
    case "<=": return actual <= cond.threshold;
    case "===":
    case "==": return actual === cond.threshold;
    default: fail(`Unsupported operator "${cond.operator}"`);
  }
}

function simulate(data, sliderValues) {
  const activeRules = data.interactions.filter((r) =>
    r.conditions.every((c) => evaluateRuleCondition(c, sliderValues))
  );
  const scores = {};
  for (const ind of data.indicators) {
    let total = ind.baseline;
    for (const v of data.decisionVariables) {
      const val = sliderValues[v.id];
      const w = ind.weights[v.id] || 0;
      total += w * ((val - 50) / 50);
    }
    for (const r of activeRules) {
      if (r.targetIndicatorId === ind.id) total += r.delta;
    }
    scores[ind.id] = Math.max(0, Math.min(100, Math.round(total)));
  }
  return { scores, activeRules };
}

function runSimulationStage() {
  console.log("=== Stage 3: Simulation Engine & Trigger Smoke Tests ===");
  const data = loadSiteContent();

  // Neutral baseline check (all 50s -> baseline 50 when no rule fires)
  const neutral = Object.fromEntries(data.decisionVariables.map((v) => [v.id, 50]));
  const neutralRes = simulate(data, neutral);
  for (const [indId, score] of Object.entries(neutralRes.scores)) {
    if (Number.isNaN(score) || score < 0 || score > 100) {
      fail(`Invalid neutral score for ${indId}: ${score}`);
    }
  }
  pass(`Neutral baseline simulation healthy: ${JSON.stringify(neutralRes.scores)}`);

  // Presets check
  for (const preset of data.presets) {
    for (const v of data.decisionVariables) {
      const val = preset.values?.[v.id];
      if (typeof val !== "number" || val < 0 || val > 100) {
        fail(`Preset "${preset.id}" has invalid value for "${v.id}": ${val}`);
      }
    }
    const res = simulate(data, preset.values);
    for (const [indId, score] of Object.entries(res.scores)) {
      if (Number.isNaN(score) || score < 0 || score > 100) {
        fail(`Preset "${preset.id}" produced out-of-bounds score on "${indId}": ${score}`);
      }
    }
    pass(`Preset "${preset.name}" simulated cleanly -> ${JSON.stringify(res.scores)}`);
  }

  // Interaction demoValues trigger test
  for (const rule of data.interactions) {
    if (!rule.demoValues) fail(`Interaction "${rule.id}" missing demoValues for [Test] button`);
    const res = simulate(data, rule.demoValues);
    const fired = res.activeRules.some((r) => r.id === rule.id);
    if (!fired) {
      fail(`Interaction "${rule.id}" failed to trigger when applying its own demoValues!`);
    }
    pass(`Rule [Test] trigger verified: "${rule.name}" (${rule.delta > 0 ? "+" : ""}${rule.delta} ${rule.targetIndicatorId})`);
  }
}

if (stageArg === "syntax" || stageArg === "all") runSyntaxStage();
if (stageArg === "rubric" || stageArg === "all") runRubricStage();
if (stageArg === "simulation" || stageArg === "all") runSimulationStage();
