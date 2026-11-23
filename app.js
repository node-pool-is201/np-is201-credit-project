/**
 * ============================================================================
 * node_pool — RETRO POLICY SIMULATOR ENGINE (IS 201)
 * ============================================================================
 * Driven completely by `window.SITE_CONTENT` in `content.js`.
 * Progressive disclosure keeps upfront text minimal while preserving full
 * mathematical and ethical transparency one click away.
 * ============================================================================
 */

(function () {
  "use strict";

  const CONTENT = window.SITE_CONTENT;
  if (!CONTENT) {
    console.error("node_pool Error: window.SITE_CONTENT not found. Check content.js.");
    return;
  }

  // --------------------------------------------------------------------------
  // APPLICATION STATE
  // --------------------------------------------------------------------------
  const defaultPreset = CONTENT.presets[3] || CONTENT.presets[0]; // Balanced Regulator
  const state = {
    activeTab: "overview",
    fullPageMode: false,
    heroPresetId: CONTENT.presets[0].id,
    activePresetId: defaultPreset ? defaultPreset.id : null,
    inspectedIndicatorId: null, // Closed at first glance; opens when user clicks a meter
    openVarHelp: {}, // Tracks which slider [?] drawers are open
    compareMode: "presets",
    allEvidenceOpen: false,
    values: Object.assign({}, defaultPreset ? defaultPreset.values : {}),
    savedSnapshots: loadSavedSnapshots()
  };

  CONTENT.decisionVariables.forEach(function (v) {
    if (typeof state.values[v.id] !== "number") {
      state.values[v.id] = 50;
    }
  });

  // --------------------------------------------------------------------------
  // STORAGE HELPERS
  // --------------------------------------------------------------------------
  function loadSavedSnapshots() {
    try {
      const raw = window.localStorage.getItem("node_pool_snapshots_v1");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
    } catch (e) {
      return [];
    }
  }

  function persistSavedSnapshots() {
    try {
      window.localStorage.setItem(
        "node_pool_snapshots_v1",
        JSON.stringify(state.savedSnapshots.slice(0, 3))
      );
    } catch (e) {
      // Safe no-op in restricted file:// contexts
    }
  }

  // --------------------------------------------------------------------------
  // UTILITIES
  // --------------------------------------------------------------------------
  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatInlineCode(str) {
    return escapeHtml(str).replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  function formatSigned(num, decimals) {
    const fixed =
      typeof decimals === "number" ? Math.abs(num).toFixed(decimals) : String(Math.abs(num));
    if (num > 0.04) return "+" + fixed;
    if (num < -0.04) return "-" + fixed;
    return "0" + (decimals ? "." + "0".repeat(decimals) : "");
  }

  function getScoreBand(score) {
    for (let i = 0; i < CONTENT.scoreBands.length; i++) {
      const band = CONTENT.scoreBands[i];
      if (score >= band.min && score <= band.max) {
        return band;
      }
    }
    return { label: "Balanced", cssClass: "band-balanced" };
  }

  function evaluateOperator(actual, op, threshold) {
    switch (op) {
      case ">":
        return actual > threshold;
      case ">=":
        return actual >= threshold;
      case "<":
        return actual < threshold;
      case "<=":
        return actual <= threshold;
      case "==":
      case "===":
        return actual === threshold;
      default:
        return false;
    }
  }

  // --------------------------------------------------------------------------
  // RULE-BASED MODEL ENGINE
  // --------------------------------------------------------------------------
  function evaluatePolicy(policyValues) {
    const evaluatedInteractions = CONTENT.interactions.map(function (rule) {
      const allMet = rule.conditions.every(function (cond) {
        const currentVal = Number(policyValues[cond.variableId] ?? 50);
        return evaluateOperator(currentVal, cond.operator, cond.threshold);
      });
      return {
        rule: rule,
        triggered: allMet
      };
    });

    const indicatorResults = {};
    const indicatorList = CONTENT.indicators.map(function (ind) {
      const baseline = typeof ind.baseline === "number" ? ind.baseline : 50;
      let baseSum = baseline;
      const contributions = [];

      CONTENT.decisionVariables.forEach(function (variable) {
        const sliderVal = Number(policyValues[variable.id] ?? 50);
        const weight = Number((ind.weights && ind.weights[variable.id]) || 0);
        const normalized = (sliderVal - 50) / 50;
        const points = weight * normalized;
        baseSum += points;
        contributions.push({
          variableId: variable.id,
          code: variable.code,
          name: variable.name,
          sliderVal: sliderVal,
          weight: weight,
          points: points
        });
      });

      const activeRulesForInd = evaluatedInteractions.filter(function (item) {
        return item.triggered && item.rule.targetIndicatorId === ind.id;
      });

      let interactionSum = 0;
      activeRulesForInd.forEach(function (item) {
        interactionSum += item.rule.delta;
      });

      const unclamped = baseSum + interactionSum;
      const finalScore = clamp(Math.round(unclamped), 0, 100);
      const deltaFromBaseline = finalScore - baseline;
      const band = getScoreBand(finalScore);

      const res = {
        indicator: ind,
        baseline: baseline,
        baseSum: baseSum,
        interactionSum: interactionSum,
        unclamped: unclamped,
        score: finalScore,
        deltaFromBaseline: deltaFromBaseline,
        band: band,
        contributions: contributions,
        activeRules: activeRulesForInd
      };
      indicatorResults[ind.id] = res;
      return res;
    });

    const triggeredRules = evaluatedInteractions.filter(function (x) {
      return x.triggered;
    });

    const avgScore = Math.round(
      indicatorList.reduce(function (acc, item) {
        return acc + item.score;
      }, 0) / indicatorList.length
    );

    return {
      indicators: indicatorList,
      byId: indicatorResults,
      interactions: evaluatedInteractions,
      triggeredRules: triggeredRules,
      averageScore: avgScore
    };
  }

  // --------------------------------------------------------------------------
  // SVG PENTAGON RADAR
  // --------------------------------------------------------------------------
  function buildRadarSvg(indicatorList, options) {
    const opts = options || {};
    const size = opts.size || 195;
    const cx = size / 2;
    const cy = size / 2 + 4;
    const radius = size * 0.33;
    const count = indicatorList.length;

    const gridColor = "#c5c0b2";
    const axisColor = "#d0cbbd";
    const baselineStroke = "#5c5a52";
    const polyFill = "rgba(31, 99, 87, 0.26)";
    const polyStroke = "#1f6357";
    const labelColor = "#161614";

    function polarToCartesian(index, value0to100) {
      const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
      const r = (clamp(value0to100, 0, 100) / 100) * radius;
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle)
      };
    }

    const rings = [25, 50, 75, 100]
      .map(function (level) {
        const pts = indicatorList
          .map(function (_, i) {
            const p = polarToCartesian(i, level);
            return p.x.toFixed(1) + "," + p.y.toFixed(1);
          })
          .join(" ");
        const isBaseline = level === 50;
        return (
          '<polygon points="' +
          pts +
          '" fill="none" stroke="' +
          (isBaseline ? baselineStroke : gridColor) +
          '" stroke-width="' +
          (isBaseline ? "1.5" : "1") +
          '" ' +
          (isBaseline ? 'stroke-dasharray="3,3"' : "") +
          " />"
        );
      })
      .join("");

    const shortLabels = {
      equity: "EQUITY",
      governance: "GOV",
      sustainability: "ECO",
      privacy: "PRIV",
      innovation: "RELIAB"
    };

    const axesAndLabels = indicatorList
      .map(function (item, i) {
        const outer = polarToCartesian(i, 100);
        const labelPos = polarToCartesian(i, 128);
        const shortName =
          shortLabels[item.indicator.id] ||
          item.indicator.name.split(" ")[0].toUpperCase();
        return (
          '<line x1="' +
          cx +
          '" y1="' +
          cy +
          '" x2="' +
          outer.x.toFixed(1) +
          '" y2="' +
          outer.y.toFixed(1) +
          '" stroke="' +
          axisColor +
          '" stroke-width="1" />' +
          '<text x="' +
          labelPos.x.toFixed(1) +
          '" y="' +
          labelPos.y.toFixed(1) +
          '" text-anchor="middle" dominant-baseline="middle" fill="' +
          labelColor +
          '" font-family="IBM Plex Mono, monospace" font-size="9" font-weight="700">' +
          escapeHtml(shortName) +
          "</text>"
        );
      })
      .join("");

    const valuePts = indicatorList
      .map(function (item, i) {
        const p = polarToCartesian(i, item.score);
        return p.x.toFixed(1) + "," + p.y.toFixed(1);
      })
      .join(" ");

    const dots = indicatorList
      .map(function (item, i) {
        const p = polarToCartesian(i, item.score);
        return (
          '<rect x="' +
          (p.x - 2.8).toFixed(1) +
          '" y="' +
          (p.y - 2.8).toFixed(1) +
          '" width="5.6" height="5.6" fill="' +
          polyStroke +
          '" stroke="#f6f4ec" stroke-width="1" />'
        );
      })
      .join("");

    return (
      '<svg width="' +
      size +
      '" height="' +
      size +
      '" viewBox="0 0 ' +
      size +
      " " +
      size +
      '" role="img" aria-label="Pentagon chart of 5 ethical indicators">' +
      rings +
      axesAndLabels +
      '<polygon points="' +
      valuePts +
      '" fill="' +
      polyFill +
      '" stroke="' +
      polyStroke +
      '" stroke-width="2" />' +
      dots +
      "</svg>"
    );
  }

  // --------------------------------------------------------------------------
  // STATIC CONTENT POPULATION
  // --------------------------------------------------------------------------
  function renderStaticSections() {
    document.getElementById("nav-brand-name").textContent = CONTENT.meta.brandName;
    document.getElementById("nav-course-badge").textContent = CONTENT.meta.courseBadge;
    document.getElementById("footer-brand-name").textContent = CONTENT.meta.brandName;
    document.getElementById("footer-disclaimer-text").textContent =
      CONTENT.meta.footerDisclaimer;

    // 1. OVERVIEW (Highlight key moral phrase in headline)
    document.getElementById("hero-disclaimer").textContent = CONTENT.hero.disclaimerTag;
    document.getElementById("hero-eyebrow").textContent = CONTENT.hero.eyebrow;

    const headlineEl = document.getElementById("hero-headline");
    const hText = CONTENT.hero.headline || "";
    const targetPhrase = "moral choice.";
    if (hText.toLowerCase().includes(targetPhrase)) {
      const idx = hText.toLowerCase().indexOf(targetPhrase);
      const before = hText.slice(0, idx);
      const match = hText.slice(idx, idx + targetPhrase.length);
      const after = hText.slice(idx + targetPhrase.length);
      headlineEl.innerHTML =
        escapeHtml(before) +
        '<span class="hl-mark">' +
        escapeHtml(match) +
        "</span>" +
        escapeHtml(after);
    } else {
      headlineEl.textContent = hText;
    }

    document.getElementById("hero-subtext").textContent = CONTENT.hero.subtext;
    document.getElementById("hero-primary-cta").innerHTML =
      escapeHtml(CONTENT.hero.primaryCta) + " &rarr;";
    document.getElementById("hero-preview-title").textContent = CONTENT.hero.previewTitle;

    renderHeroPreview();

    // 2. SCENARIO & FACTION CARDS (Concise upfront, stakes expandable)
    document.getElementById("scenario-eyebrow").textContent = CONTENT.scenario.sectionEyebrow;
    document.getElementById("scenario-title").textContent = CONTENT.scenario.title;
    document.getElementById("scenario-context").textContent = CONTENT.scenario.context;
    document.getElementById("scenario-extended-context").textContent =
      CONTENT.scenario.extendedContext;

    document.getElementById("scenario-pipeline-grid").innerHTML =
      CONTENT.scenario.pipelineSteps
        .map(function (s) {
          return (
            '<div class="pipeline-step">' +
            '<div class="pipeline-num">[' +
            escapeHtml(s.step) +
            "]</div>" +
            '<div class="pipeline-title">' +
            escapeHtml(s.title) +
            "</div>" +
            '<p class="pipeline-detail">' +
            escapeHtml(s.detail) +
            "</p>" +
            "</div>"
          );
        })
        .join("");

    document.getElementById("stakeholders-grid").innerHTML = CONTENT.scenario.stakeholders
      .map(function (stk) {
        return (
          '<article class="stakeholder-card">' +
          "<div>" +
          '<div class="stk-head">' +
          '<h3 class="stakeholder-name">' +
          escapeHtml(stk.name) +
          "</h3>" +
          '<span class="stakeholder-role">' +
          escapeHtml(stk.role) +
          "</span>" +
          "</div>" +
          '<p class="stakeholder-desc">' +
          escapeHtml(stk.description) +
          "</p>" +
          "</div>" +
          "<div>" +
          '<div class="stk-actions-row">' +
          '<button type="button" class="btn-utility stakeholder-preset-jump" data-preset-id="' +
          escapeHtml(stk.linkedPresetId) +
          '">' +
          escapeHtml(stk.linkedPresetLabel) +
          " &rarr;</button>" +
          "</div>" +
          '<details class="stk-details">' +
          "<summary>[+] Stakes &amp; Risks</summary>" +
          '<div class="stakeholder-meta-box">' +
          "<p><strong>Goal:</strong> " +
          escapeHtml(stk.priority) +
          "</p>" +
          "<p><strong>Risk:</strong> " +
          escapeHtml(stk.risk) +
          "</p>" +
          "</div>" +
          "</details>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    // 3. SIMULATOR SLIDERS SHELL
    buildSimulatorSlidersDom();

    // 4. MODEL & ETHICS
    const me = CONTENT.modelAndEthics;
    document.getElementById("model-hypothetical-banner").textContent = me.hypotheticalBanner;
    document.getElementById("model-eyebrow").textContent = me.sectionEyebrow;
    document.getElementById("model-title").textContent = me.title;
    document.getElementById("model-how-scoring-works").textContent = me.howScoringWorks;
    document.getElementById("model-formula-text").textContent = me.formulaText;
    document.getElementById("model-weight-explanation").textContent =
      me.weightSettingExplanation;

    renderTransparencyTables();

    document.getElementById("tradeoffs-grid").innerHTML = me.tradeOffs
      .map(function (t) {
        return (
          '<article class="tradeoff-card">' +
          '<h4 class="tradeoff-title">' +
          escapeHtml(t.title) +
          "</h4>" +
          '<p class="tradeoff-summary">' +
          escapeHtml(t.summary) +
          "</p>" +
          '<details class="tradeoff-more">' +
          "<summary>[+] Model mechanics</summary>" +
          '<p class="tradeoff-detail">' +
          formatInlineCode(t.detail) +
          "</p>" +
          "</details>" +
          "</article>"
        );
      })
      .join("");

    document.getElementById("course-concepts-grid").innerHTML = me.courseConcepts
      .map(function (c) {
        return (
          '<article class="concept-card">' +
          '<div class="concept-cat">' +
          escapeHtml(c.category) +
          "</div>" +
          '<h4 class="concept-name">' +
          escapeHtml(c.name) +
          "</h4>" +
          '<p class="concept-desc">' +
          escapeHtml(c.howItShapesModel) +
          "</p>" +
          "</article>"
        );
      })
      .join("");

    document.getElementById("assumptions-list").innerHTML = me.assumptionsAndLimitations
      .map(function (item) {
        return "<li>" + escapeHtml(item) + "</li>";
      })
      .join("");

    // 5. EVIDENCE (Compact expandable accordion rows)
    document.getElementById("evidence-eyebrow").textContent = CONTENT.evidence.sectionEyebrow;
    document.getElementById("evidence-title").textContent = CONTENT.evidence.title;
    document.getElementById("evidence-subtitle").textContent = CONTENT.evidence.subtitle;

    document.getElementById("evidence-cards-container").innerHTML = CONTENT.evidence.items
      .map(function (ev, idx) {
        return (
          '<details class="disclosure-drawer evidence-item-drawer">' +
          '<summary class="disclosure-summary">' +
          "<span>[0" +
          (idx + 1) +
          "] " +
          escapeHtml(ev.tag) +
          "</span>" +
          '<span class="disclosure-hint">' +
          escapeHtml(ev.status) +
          "</span>" +
          "</summary>" +
          '<div class="disclosure-body">' +
          '<div class="ev-supports">Rule Link: ' +
          escapeHtml(ev.supportsRules) +
          "</div>" +
          '<div class="ev-prompt-box">' +
          escapeHtml(ev.placeholderPrompt) +
          "</div>" +
          '<p class="ev-draft"><strong>Draft:</strong> ' +
          escapeHtml(ev.citationDraft) +
          "</p>" +
          '<p class="ev-takeaway">' +
          escapeHtml(ev.keyTakeaway) +
          "</p>" +
          "</div>" +
          "</details>"
        );
      })
      .join("");
  }

  // --------------------------------------------------------------------------
  // HERO PREVIEW CONSOLE
  // --------------------------------------------------------------------------
  function renderHeroPreview() {
    const preset =
      CONTENT.presets.find(function (p) {
        return p.id === state.heroPresetId;
      }) || CONTENT.presets[0];

    const evalResult = evaluatePolicy(preset.values);

    document.getElementById("hero-preset-tabs").innerHTML = CONTENT.presets
      .map(function (p) {
        const isActive = p.id === preset.id;
        return (
          '<button type="button" class="lens-preset-btn ' +
          (isActive ? "active" : "") +
          '" data-hero-preset="' +
          escapeHtml(p.id) +
          '">' +
          escapeHtml(p.name) +
          "</button>"
        );
      })
      .join("");

    document.getElementById("hero-radar-container").innerHTML = buildRadarSvg(
      evalResult.indicators,
      { size: 175 }
    );

    document.getElementById("hero-mini-bars").innerHTML = evalResult.indicators
      .map(function (item) {
        return (
          '<div class="mini-bar-row">' +
          '<div class="mini-bar-top">' +
          '<span class="mini-bar-name">' +
          escapeHtml(item.indicator.name.split(" ")[0]) +
          "</span>" +
          '<span class="mini-bar-val">' +
          item.score +
          "</span>" +
          "</div>" +
          '<div class="mini-bar-track">' +
          '<div class="mini-bar-fill" style="width:' +
          item.score +
          "%; background:" +
          escapeHtml(item.indicator.color) +
          '"></div>' +
          "</div>" +
          "</div>"
        );
      })
      .join("");

    const activeRuleSummaryEl = document.getElementById("hero-active-rule-summary");
    if (evalResult.triggeredRules.length > 0) {
      const first = evalResult.triggeredRules[0].rule;
      activeRuleSummaryEl.textContent =
        "[!] " + first.name.toUpperCase() + " (" + formatSigned(first.delta) + ")";
    } else {
      activeRuleSummaryEl.textContent = "AVG SCORE: " + evalResult.averageScore + " / 100";
    }
  }

  // --------------------------------------------------------------------------
  // SIMULATOR SLIDERS (CLEAN UPFRONT, [?] PROGRESSIVE DISCLOSURE)
  // --------------------------------------------------------------------------
  function buildSimulatorSlidersDom() {
    const container = document.getElementById("decision-variables-container");
    container.innerHTML = CONTENT.decisionVariables
      .map(function (v) {
        const impactChips = CONTENT.indicators
          .map(function (ind) {
            const w = Number((ind.weights && ind.weights[v.id]) || 0);
            return { shortName: ind.name.split(" ")[0], weight: w };
          })
          .filter(function (x) {
            return Math.abs(x.weight) >= 10;
          })
          .map(function (x) {
            const cls = x.weight > 0 ? "impact-up" : "impact-down";
            const sign = x.weight > 0 ? "+" : "-";
            return (
              '<span class="impact-chip ' +
              cls +
              '">' +
              sign +
              escapeHtml(x.shortName) +
              "</span>"
            );
          })
          .join("");

        const quickBtns = (v.quickOptions || [])
          .map(function (opt) {
            return (
              '<button type="button" class="quick-opt-btn" data-var-id="' +
              escapeHtml(v.id) +
              '" data-quick-val="' +
              opt.value +
              '">' +
              escapeHtml(opt.label) +
              " [" +
              opt.value +
              "]</button>"
            );
          })
          .join("");

        const currentVal = state.values[v.id];
        const shortLow = v.shortLow || v.lowLabel;
        const shortHigh = v.shortHigh || v.highLabel;

        return (
          '<div class="variable-card" id="var-card-' +
          escapeHtml(v.id) +
          '">' +
          '<div class="var-top-row">' +
          '<div class="var-title-group">' +
          '<span class="var-code">' +
          escapeHtml(v.code) +
          "</span>" +
          '<h4 class="var-name">' +
          escapeHtml(v.name) +
          "</h4>" +
          '<button type="button" class="var-help-btn" data-toggle-var-help="' +
          escapeHtml(v.id) +
          '" title="Toggle description and presets">[?]</button>' +
          "</div>" +
          '<span class="var-num-readout" id="val-' +
          escapeHtml(v.id) +
          '">' +
          currentVal +
          "</span>" +
          "</div>" +
          '<input type="range" min="0" max="100" step="1" value="' +
          currentVal +
          '" class="policy-slider" id="slider-' +
          escapeHtml(v.id) +
          '" data-var-id="' +
          escapeHtml(v.id) +
          '" aria-label="' +
          escapeHtml(v.name) +
          '" />' +
          '<div class="var-endpoints">' +
          "<span>" +
          escapeHtml(shortLow) +
          "</span>" +
          "<span>" +
          escapeHtml(shortHigh) +
          "</span>" +
          "</div>" +
          '<div class="var-drawer hidden" id="drawer-' +
          escapeHtml(v.id) +
          '">' +
          '<p class="var-desc">' +
          escapeHtml(v.description) +
          "</p>" +
          '<div class="var-quick-row">' +
          '<div class="quick-tier-btns">' +
          quickBtns +
          "</div>" +
          '<div class="var-impacts-mini">' +
          impactChips +
          "</div>" +
          "</div>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function syncSliderControlsUi() {
    CONTENT.decisionVariables.forEach(function (v) {
      const val = state.values[v.id];
      const slider = document.getElementById("slider-" + v.id);
      const readout = document.getElementById("val-" + v.id);
      const drawer = document.getElementById("drawer-" + v.id);
      const helpBtn = document.querySelector(
        '[data-toggle-var-help="' + v.id + '"]'
      );

      if (slider && Number(slider.value) !== val) {
        slider.value = String(val);
      }
      if (readout) readout.textContent = String(val);

      const isOpen = Boolean(state.openVarHelp[v.id]);
      if (drawer) drawer.classList.toggle("hidden", !isOpen);
      if (helpBtn) helpBtn.classList.toggle("open", isOpen);

      const quickBtns = document.querySelectorAll(
        '.quick-opt-btn[data-var-id="' + v.id + '"]'
      );
      quickBtns.forEach(function (btn) {
        const qVal = Number(btn.getAttribute("data-quick-val"));
        btn.classList.toggle("selected", qVal === val);
      });
    });
  }

  // --------------------------------------------------------------------------
  // SIMULATOR DASHBOARD RENDER
  // --------------------------------------------------------------------------
  function renderSimulatorDashboard() {
    syncSliderControlsUi();

    const activePreset = CONTENT.presets.find(function (p) {
      return p.id === state.activePresetId;
    });

    document.getElementById("active-preset-badge").textContent = activePreset
      ? activePreset.name.toUpperCase()
      : "CUSTOM POLICY";

    document.getElementById("simulator-presets-grid").innerHTML = CONTENT.presets
      .map(function (p) {
        const isAct = p.id === state.activePresetId;
        return (
          '<button type="button" class="preset-card-btn ' +
          (isAct ? "active" : "") +
          '" data-sim-preset="' +
          escapeHtml(p.id) +
          '">' +
          (isAct ? "▸ " : "") +
          escapeHtml(p.name) +
          "</button>"
        );
      })
      .join("");

    const rationaleBox = document.getElementById("preset-rationale-box");
    rationaleBox.textContent = activePreset
      ? activePreset.rationale
      : "Sliders manually customized. Open Compare Policies below to save and benchmark this run.";

    const evalResult = evaluatePolicy(state.values);

    // 1. Render 5 Clean, High-Contrast Meters
    document.getElementById("consequence-indicators-container").innerHTML =
      evalResult.indicators
        .map(function (item) {
          const ind = item.indicator;
          const isSelected = ind.id === state.inspectedIndicatorId;
          const deltaCls =
            item.deltaFromBaseline > 0
              ? "delta-pos"
              : item.deltaFromBaseline < 0
              ? "delta-neg"
              : "";
          const deltaLabel = formatSigned(item.deltaFromBaseline);

          return (
            '<div class="indicator-card ' +
            (isSelected ? "selected" : "") +
            '" data-select-indicator="' +
            escapeHtml(ind.id) +
            '" role="button" tabindex="0" title="Click to inspect calculation">' +
            '<div class="ind-header">' +
            '<h4 class="ind-title">' +
            escapeHtml(ind.name) +
            ' <span class="ind-subtitle-inline">· ' +
            escapeHtml(ind.subtitle) +
            "</span></h4>" +
            '<div class="ind-score-cluster">' +
            '<span class="delta-tag ' +
            deltaCls +
            '">' +
            escapeHtml(deltaLabel) +
            "</span>" +
            '<span class="band-pill ' +
            escapeHtml(item.band.cssClass) +
            '">' +
            escapeHtml(item.band.label) +
            "</span>" +
            '<span class="ind-score-num" style="color:' +
            escapeHtml(ind.color) +
            '">' +
            item.score +
            "</span>" +
            "</div>" +
            "</div>" +
            '<div class="ind-bar-track">' +
            '<span class="ind-bar-baseline-tick"></span>' +
            '<div class="ind-bar-fill" style="width:' +
            item.score +
            "%; background:" +
            escapeHtml(ind.color) +
            '"></div>' +
            "</div>" +
            "</div>"
          );
        })
        .join("");

    // 2. Render Click-to-Inspect Math Console (only visible when an indicator is selected!)
    const inspectorEl = document.getElementById("formula-inspector-card");
    if (state.inspectedIndicatorId && evalResult.byId[state.inspectedIndicatorId]) {
      inspectorEl.classList.remove("hidden");
      renderFormulaInspector(evalResult.byId[state.inspectedIndicatorId]);
    } else {
      inspectorEl.classList.add("hidden");
    }

    // 3. Highlighted Active Event Alerts (Only triggered rules pop up!)
    const alertsStrip = document.getElementById("active-alerts-strip");
    alertsStrip.innerHTML = evalResult.triggeredRules
      .map(function (entry) {
        const rule = entry.rule;
        const isBonus = rule.delta > 0;
        const cardCls = isBonus ? "event-alert-bonus" : "event-alert-penalty";
        const badgeCls = isBonus ? "event-badge-bonus" : "event-badge-penalty";
        const symbol = isBonus ? "[+]" : "[!]";
        const targetInd = CONTENT.indicators.find(function (i) {
          return i.id === rule.targetIndicatorId;
        });
        const targetShort = targetInd
          ? targetInd.name.split(" ")[0].toUpperCase()
          : rule.targetIndicatorId.toUpperCase();

        return (
          '<details class="event-alert-card ' +
          cardCls +
          '">' +
          '<summary class="event-alert-summary">' +
          "<span>" +
          '<span class="' +
          badgeCls +
          '">' +
          symbol +
          " " +
          formatSigned(rule.delta) +
          " " +
          escapeHtml(targetShort) +
          "</span>" +
          escapeHtml(rule.name.toUpperCase()) +
          "</span>" +
          '<span class="quiet-meta">[Why?]</span>' +
          "</summary>" +
          '<p class="event-alert-why"><strong>' +
          escapeHtml(rule.conditionSummary) +
          ":</strong> " +
          escapeHtml(rule.justification) +
          "</p>" +
          "</details>"
        );
      })
      .join("");

    // 4. Full 4-Rules List Inside Collapsed Drawer
    document.getElementById("triggered-count-badge").textContent =
      evalResult.triggeredRules.length +
      " / " +
      evalResult.interactions.length +
      " active";

    document.getElementById("interactions-monitor-list").innerHTML =
      evalResult.interactions
        .map(function (entry) {
          const rule = entry.rule;
          const isTriggered = entry.triggered;
          const isBonus = rule.delta > 0;
          const cardCls = isTriggered
            ? isBonus
              ? "triggered-bonus"
              : "triggered-penalty"
            : "";
          const badgeCls = isTriggered
            ? isBonus
              ? "status-bonus"
              : "status-penalty"
            : "status-standby";
          const badgeText = isTriggered ? "Active" : "Standby";
          const targetInd = CONTENT.indicators.find(function (i) {
            return i.id === rule.targetIndicatorId;
          });
          const targetShort = targetInd
            ? targetInd.name.split(" ")[0]
            : rule.targetIndicatorId;
          const deltaColor = isBonus ? "color:#2b6332" : "color:#a83322";

          return (
            '<div class="interaction-item ' +
            cardCls +
            '">' +
            '<div class="int-row-top">' +
            '<div class="int-name">' +
            '<span class="int-status-badge ' +
            badgeCls +
            '">' +
            badgeText +
            "</span>" +
            escapeHtml(rule.name) +
            "</div>" +
            '<div class="int-right-actions">' +
            '<span class="int-delta" style="' +
            deltaColor +
            '">' +
            formatSigned(rule.delta) +
            " " +
            escapeHtml(targetShort) +
            "</span>" +
            '<button type="button" class="demo-rule-btn" data-demo-rule="' +
            escapeHtml(rule.id) +
            '">Test</button>' +
            "</div>" +
            "</div>" +
            '<div class="int-condition">' +
            escapeHtml(rule.conditionSummary) +
            "</div>" +
            '<p class="int-just">' +
            escapeHtml(rule.justification) +
            "</p>" +
            "</div>"
          );
        })
        .join("");

    // 5. Secondary Radar & Comparison
    document.getElementById("radar-mean-hint").textContent =
      "AVG " + evalResult.averageScore + "/100";

    document.getElementById("sim-radar-container").innerHTML = buildRadarSvg(
      evalResult.indicators,
      { size: 200 }
    );

    const highest = evalResult.indicators.slice().sort(function (a, b) {
      return b.score - a.score;
    })[0];
    const lowest = evalResult.indicators.slice().sort(function (a, b) {
      return a.score - b.score;
    })[0];

    document.getElementById("radar-summary-stats").innerHTML =
      "<div><strong>AVG:</strong> " +
      evalResult.averageScore +
      "/100</div>" +
      "<div><strong>PEAK:</strong> " +
      escapeHtml(highest.indicator.name) +
      " (" +
      highest.score +
      ")</div>" +
      "<div><strong>WEAKEST:</strong> " +
      escapeHtml(lowest.indicator.name) +
      " (" +
      lowest.score +
      ")</div>";

    renderComparisonTable(evalResult);
  }

  function renderFormulaInspector(inspected) {
    const ind = inspected.indicator;
    const sliderOffsetPts = inspected.baseSum - inspected.baseline;
    const eqString =
      "50 (base) " +
      (sliderOffsetPts >= 0 ? "+ " : "- ") +
      Math.abs(sliderOffsetPts).toFixed(1) +
      " (levers) " +
      (inspected.interactionSum !== 0
        ? (inspected.interactionSum > 0 ? "+ " : "- ") +
          Math.abs(inspected.interactionSum) +
          " (rules) "
        : "") +
      "= " +
      inspected.score +
      " / 100";

    const contribHtml = inspected.contributions
      .map(function (c) {
        const cls =
          c.points > 0.05
            ? "contrib-pos"
            : c.points < -0.05
            ? "contrib-neg"
            : "contrib-zero";
        return (
          '<div class="contrib-item">' +
          '<span class="contrib-name">' +
          escapeHtml(c.code + " " + c.name) +
          " [" +
          c.sliderVal +
          "]</span>" +
          '<span class="contrib-val ' +
          cls +
          '">' +
          formatSigned(c.points, 1) +
          "</span>" +
          "</div>"
        );
      })
      .join("");

    const activeInteractionItems = inspected.activeRules
      .map(function (ar) {
        const cls = ar.rule.delta > 0 ? "contrib-pos" : "contrib-neg";
        return (
          '<div class="contrib-item">' +
          '<span class="contrib-name">Rule: ' +
          escapeHtml(ar.rule.name) +
          "</span>" +
          '<span class="contrib-val ' +
          cls +
          '">' +
          formatSigned(ar.rule.delta, 1) +
          "</span>" +
          "</div>"
        );
      })
      .join("");

    document.getElementById("formula-inspector-card").innerHTML =
      '<div class="inspector-top">' +
      '<span class="inspector-kicker">MATH TRACE · ' +
      escapeHtml(ind.name.toUpperCase()) +
      "</span>" +
      '<button type="button" class="inspector-close-btn" id="close-inspector-btn">[x] Hide</button>' +
      "</div>" +
      '<p class="inspector-desc">' +
      escapeHtml(ind.description) +
      " (" +
      escapeHtml(ind.pillarTag) +
      ")</p>" +
      '<div class="inspector-equation">' +
      eqString +
      "</div>" +
      '<div class="inspector-breakdown-grid">' +
      contribHtml +
      activeInteractionItems +
      "</div>";
  }

  // --------------------------------------------------------------------------
  // SIDE-BY-SIDE COMPARISON TABLE
  // --------------------------------------------------------------------------
  function renderComparisonTable(currentEval) {
    document.getElementById("saved-count").textContent = String(
      state.savedSnapshots.length
    );
    document
      .getElementById("compare-mode-presets")
      .classList.toggle("active", state.compareMode === "presets");
    document
      .getElementById("compare-mode-saved")
      .classList.toggle("active", state.compareMode === "saved");

    const columns = [
      {
        title: "Current",
        values: state.values,
        evalResult: currentEval
      }
    ];

    if (state.compareMode === "presets") {
      CONTENT.presets.forEach(function (p) {
        columns.push({
          title: p.name,
          values: p.values,
          evalResult: evaluatePolicy(p.values)
        });
      });
    } else {
      state.savedSnapshots.forEach(function (snap) {
        columns.push({
          title: snap.name,
          values: snap.values,
          evalResult: evaluatePolicy(snap.values)
        });
      });
    }

    const headerCells = columns
      .map(function (col) {
        return '<th class="num-cell">' + escapeHtml(col.title) + "</th>";
      })
      .join("");

    const indicatorRows = CONTENT.indicators
      .map(function (ind) {
        const cells = columns
          .map(function (col) {
            const score = col.evalResult.byId[ind.id].score;
            return '<td class="num-cell"><strong>' + score + "</strong></td>";
          })
          .join("");
        return "<tr><td><strong>" + escapeHtml(ind.name) + "</strong></td>" + cells + "</tr>";
      })
      .join("");

    const variableRows = CONTENT.decisionVariables
      .map(function (v) {
        const cells = columns
          .map(function (col) {
            return '<td class="num-cell">' + Number(col.values[v.id] ?? 50) + "</td>";
          })
          .join("");
        return (
          "<tr><td>" +
          escapeHtml(v.code + " " + v.name) +
          "</td>" +
          cells +
          "</tr>"
        );
      })
      .join("");

    const emptyNotice =
      state.compareMode === "saved" && state.savedSnapshots.length === 0
        ? '<p class="quiet-disclaimer" style="padding:0.65rem 0.85rem;margin:0;">No saved runs yet. Click <strong>Save</strong> above to record up to 3 custom policies.</p>'
        : "";

    document.getElementById("comparison-table-container").innerHTML =
      '<table class="data-table">' +
      "<thead><tr><th>Metric / Lever</th>" +
      headerCells +
      "</tr></thead>" +
      "<tbody>" +
      '<tr class="table-group-divider"><td colspan="' +
      (columns.length + 1) +
      '">Outcomes (0–100)</td></tr>' +
      indicatorRows +
      '<tr class="table-group-divider"><td colspan="' +
      (columns.length + 1) +
      '">Policy Levers (0–100)</td></tr>' +
      variableRows +
      "</tbody></table>" +
      emptyNotice;
  }

  // --------------------------------------------------------------------------
  // TRANSPARENCY DOCUMENTATION TABLES
  // --------------------------------------------------------------------------
  function renderTransparencyTables() {
    const indHeaders = CONTENT.indicators
      .map(function (ind) {
        return '<th class="num-cell">' + escapeHtml(ind.name.split(" ")[0]) + "</th>";
      })
      .join("");

    const weightRows = CONTENT.decisionVariables
      .map(function (v) {
        const cells = CONTENT.indicators
          .map(function (ind) {
            const w = Number((ind.weights && ind.weights[v.id]) || 0);
            const style =
              w > 0
                ? "color:#2b6332;font-weight:700;"
                : w < 0
                ? "color:#a83322;font-weight:700;"
                : "color:#5c5a52;";
            return (
              '<td class="num-cell" style="' +
              style +
              '">' +
              (w > 0 ? "+" + w : String(w)) +
              "</td>"
            );
          })
          .join("");
        return (
          "<tr><td><strong>" +
          escapeHtml(v.code + " · " + v.name) +
          "</strong></td>" +
          cells +
          "</tr>"
        );
      })
      .join("");

    document.getElementById("weight-matrix-table-wrap").innerHTML =
      '<table class="data-table">' +
      "<thead><tr><th>Policy Lever (Max Shift at 100 vs 50)</th>" +
      indHeaders +
      "</tr></thead>" +
      "<tbody>" +
      weightRows +
      "</tbody></table>";

    const intRows = CONTENT.interactions
      .map(function (rule) {
        const targetInd = CONTENT.indicators.find(function (i) {
          return i.id === rule.targetIndicatorId;
        });
        const targetName = targetInd ? targetInd.name.split(" ")[0] : rule.targetIndicatorId;
        const deltaStr =
          (rule.delta > 0 ? "+" : "") + rule.delta + " " + targetName;
        return (
          "<tr>" +
          "<td><strong>" +
          escapeHtml(rule.name) +
          "</strong></td>" +
          "<td><code>" +
          escapeHtml(rule.pairLabel) +
          "</code></td>" +
          "<td><code>" +
          escapeHtml(rule.conditionSummary) +
          "</code></td>" +
          "<td><strong>" +
          escapeHtml(deltaStr) +
          "</strong></td>" +
          "<td>" +
          escapeHtml(rule.justification) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    document.getElementById("interactions-doc-table-wrap").innerHTML =
      '<table class="data-table">' +
      "<thead><tr>" +
      "<th>Rule</th>" +
      "<th>Variable Pair</th>" +
      "<th>Trigger</th>" +
      "<th>Effect</th>" +
      "<th>Justification</th>" +
      "</tr></thead>" +
      "<tbody>" +
      intRows +
      "</tbody></table>";
  }

  // --------------------------------------------------------------------------
  // NAVIGATION & INTERACTIONS
  // --------------------------------------------------------------------------
  function switchTab(tabId, skipScroll) {
    const validTabs = ["overview", "scenario", "simulator", "model", "evidence"];
    if (validTabs.indexOf(tabId) === -1) return;

    state.activeTab = tabId;

    document.querySelectorAll(".nav-tab").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });

    if (state.fullPageMode) {
      const targetPanel = document.getElementById("panel-" + tabId);
      if (targetPanel && !skipScroll) {
        targetPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    document.querySelectorAll(".tab-panel").forEach(function (panel) {
      panel.classList.toggle(
        "active",
        panel.getAttribute("data-section") === tabId
      );
    });

    if (!skipScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function applyPreset(presetId) {
    const preset = CONTENT.presets.find(function (p) {
      return p.id === presetId;
    });
    if (!preset) return;
    state.activePresetId = preset.id;
    state.values = Object.assign({}, preset.values);
    renderSimulatorDashboard();
  }

  function bindEvents() {
    document.querySelectorAll(".nav-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchTab(btn.getAttribute("data-tab"));
      });
    });

    document.addEventListener("click", function (e) {
      const targetTabEl = e.target.closest("[data-tab-target]");
      if (targetTabEl) {
        e.preventDefault();
        const dest = targetTabEl.getAttribute("data-tab-target");
        if (targetTabEl.classList.contains("console-jump-btn")) {
          applyPreset(state.heroPresetId);
        }
        switchTab(dest);
        return;
      }

      const heroPresetBtn = e.target.closest("[data-hero-preset]");
      if (heroPresetBtn) {
        state.heroPresetId = heroPresetBtn.getAttribute("data-hero-preset");
        renderHeroPreview();
        return;
      }

      const stakeholderJump = e.target.closest(".stakeholder-preset-jump");
      if (stakeholderJump) {
        applyPreset(stakeholderJump.getAttribute("data-preset-id"));
        switchTab("simulator");
        return;
      }

      const simPresetBtn = e.target.closest("[data-sim-preset]");
      if (simPresetBtn) {
        applyPreset(simPresetBtn.getAttribute("data-sim-preset"));
        return;
      }

      const varHelpBtn = e.target.closest("[data-toggle-var-help]");
      if (varHelpBtn) {
        const vid = varHelpBtn.getAttribute("data-toggle-var-help");
        state.openVarHelp[vid] = !state.openVarHelp[vid];
        syncSliderControlsUi();
        return;
      }

      const quickOptBtn = e.target.closest(".quick-opt-btn");
      if (quickOptBtn) {
        const varId = quickOptBtn.getAttribute("data-var-id");
        const val = Number(quickOptBtn.getAttribute("data-quick-val"));
        state.values[varId] = clamp(val, 0, 100);
        state.activePresetId = null;
        renderSimulatorDashboard();
        return;
      }

      if (e.target.id === "close-inspector-btn") {
        state.inspectedIndicatorId = null;
        renderSimulatorDashboard();
        return;
      }

      const selectIndCard = e.target.closest("[data-select-indicator]");
      if (selectIndCard) {
        const clickedId = selectIndCard.getAttribute("data-select-indicator");
        state.inspectedIndicatorId =
          state.inspectedIndicatorId === clickedId ? null : clickedId;
        renderSimulatorDashboard();
        return;
      }

      const demoRuleBtn = e.target.closest("[data-demo-rule]");
      if (demoRuleBtn) {
        const ruleId = demoRuleBtn.getAttribute("data-demo-rule");
        const foundRule = CONTENT.interactions.find(function (r) {
          return r.id === ruleId;
        });
        if (foundRule && foundRule.demoValues) {
          state.values = Object.assign({}, foundRule.demoValues);
          state.activePresetId = null;
          state.inspectedIndicatorId = foundRule.targetIndicatorId;
          renderSimulatorDashboard();
        }
      }
    });

    document
      .getElementById("decision-variables-container")
      .addEventListener("input", function (e) {
        if (e.target && e.target.classList.contains("policy-slider")) {
          const varId = e.target.getAttribute("data-var-id");
          state.values[varId] = clamp(Number(e.target.value), 0, 100);
          state.activePresetId = null;
          renderSimulatorDashboard();
        }
      });

    document
      .getElementById("reset-neutral-btn")
      .addEventListener("click", function () {
        CONTENT.decisionVariables.forEach(function (v) {
          state.values[v.id] = 50;
        });
        state.activePresetId = null;
        renderSimulatorDashboard();
      });

    const fullPageBtn = document.getElementById("toggle-all-sections");
    fullPageBtn.addEventListener("click", function () {
      state.fullPageMode = !state.fullPageMode;
      document.body.classList.toggle("full-page-mode", state.fullPageMode);
      fullPageBtn.classList.toggle("active-toggle", state.fullPageMode);
      fullPageBtn.textContent = state.fullPageMode ? "Tabs" : "Full Page";
      if (!state.fullPageMode) {
        switchTab(state.activeTab, true);
      }
    });

    document
      .getElementById("compare-mode-presets")
      .addEventListener("click", function () {
        state.compareMode = "presets";
        renderSimulatorDashboard();
      });

    document
      .getElementById("compare-mode-saved")
      .addEventListener("click", function () {
        state.compareMode = "saved";
        renderSimulatorDashboard();
      });

    document
      .getElementById("save-snapshot-btn")
      .addEventListener("click", function () {
        const inputEl = document.getElementById("snapshot-name-input");
        const activePreset = CONTENT.presets.find(function (p) {
          return p.id === state.activePresetId;
        });
        const defaultName = activePreset
          ? activePreset.name
          : "Run #" + (state.savedSnapshots.length + 1);
        const name = (inputEl.value || "").trim() || defaultName;

        const nextList = state.savedSnapshots.slice();
        if (nextList.length >= 3) {
          nextList.shift();
        }
        nextList.push({
          name: name,
          values: Object.assign({}, state.values)
        });
        state.savedSnapshots = nextList;
        state.compareMode = "saved";
        inputEl.value = "";
        persistSavedSnapshots();
        renderSimulatorDashboard();
      });

    document
      .getElementById("clear-snapshots-btn")
      .addEventListener("click", function () {
        state.savedSnapshots = [];
        persistSavedSnapshots();
        renderSimulatorDashboard();
      });

    const toggleEvBtn = document.getElementById("toggle-all-evidence");
    toggleEvBtn.addEventListener("click", function () {
      state.allEvidenceOpen = !state.allEvidenceOpen;
      document.querySelectorAll(".evidence-item-drawer").forEach(function (el) {
        el.open = state.allEvidenceOpen;
      });
      toggleEvBtn.textContent = state.allEvidenceOpen ? "Collapse All" : "Expand All";
    });
  }

  // --------------------------------------------------------------------------
  // INITIALIZE
  // --------------------------------------------------------------------------
  renderStaticSections();
  renderSimulatorDashboard();
  bindEvents();

  const initialHash = (window.location.hash || "").replace("#", "").trim();
  if (initialHash) {
    switchTab(initialHash, true);
  }
})();
