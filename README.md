# node_pool — AI Credit Scoring Ethics Simulator (`IS 201`)

Interactive rule-based ethics simulator exploring how algorithmic credit evaluation affects thin-file and unbanked borrowers across **Equity & Social Justice**, **Technology Governance**, **Computing & Sustainability**, **Privacy & Data Protection**, and **Responsible Innovation**.

- **Live Production URL (`main`):** https://node-pool-is201.web.app
- **Firebase Project / Hosting Site:** `is201-ethics-credit-project` (`node-pool-is201`)

---

## Quick Edit Guide for `node_pool` Members

Almost everything on the site—copy, stakeholder presets, decision sliders, indicator weights, conditional rules, and citations—lives in a single file: **`content.js`** (see [`HOW-TO-EDIT.md`](./HOW-TO-EDIT.md) for details).

### Branch & Pull Request Workflow (`feature/*` → `staging` → `main`)

1. **Clone & pull latest `staging`:**
   ```bash
   git clone https://github.com/node-pool-is201/np-is201-credit-project.git
   cd np-is201-credit-project
   git checkout staging && git pull
   ```
2. **Create a feature branch:**
   ```bash
   git checkout -b feat/np-01-update-citations
   ```
3. **Edit `content.js` & run local validation:**
   ```bash
   node scripts/validate-project.js
   ```
4. **Push & open a Pull Request into `staging`:**
   - GitHub Actions automatically runs the **3-stage validation pipeline** (`Syntax` → `IS 201 Rubric Gate` → `Simulation Smoke Test`) and deploys a **live Firebase PR Preview URL** right in the PR comments.
   - Once **1 of 1 required approver** approves and all checks pass green, merge into `staging`.
5. **Promote `staging` → `main` for Production:**
   - Open a Pull Request from `staging` → `main`. Once approved and merged, GitHub Actions deploys directly to `https://node-pool-is201.web.app`.
