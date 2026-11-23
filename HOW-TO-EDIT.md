# node_pool — Static Website & Editing Guide (IS 201)

## 1. How to Open the Website Locally
Double-click **`index.html`** in Finder / File Explorer to open it directly in Chrome, Safari, Edge, or Firefox. No local server, build step, or internet connection is required for the simulator engine to run.

## 2. How to Edit Any Text, Weight, Rule, or Citation
All website copy, decision variables, stakeholder presets, linear weights, variable interaction rules, and literature placeholders live inside **one plain file**:

- **`content.js`** — Open this in **TextEdit**, **Notepad**, or **VS Code**.

### Quick Map of `content.js`:
1. **`meta`** — Group name (`node_pool`), course label (`IS 201`), and footer disclaimer.
2. **`hero`** — Eyebrow, headline, subtext, disclaimer tag, and quick specs.
3. **`scenario`** — Context paragraphs, 4-step pipeline, and 4 stakeholder descriptions.
4. **`presets`** — Quick-start slider values (`0–100`) and rationales for the 4 stakeholder doctrines.
5. **`decisionVariables`** — Names, descriptions, `0`/`100` endpoint labels, and quick-select buttons for the 5 faders.
6. **`indicators`** — The 5 consequence indicators (`baseline: 50`) and their linear point `weights` for each slider.
7. **`interactions`** — The 4 conditional variable interaction rules, each pairing two distinct decision variables (`>`, `<`, `>=`, `<=`), point `delta`, and `justification`.
8. **`modelAndEthics`** — Formula explanation, 3 core trade-offs, 6 IS 201 course concepts, and stated assumptions/limitations.
9. **`evidence`** — Your 5 literature/regulatory placeholder cards ready for verified citations.

> **Auto-Sync:** Whenever you edit a weight or interaction rule in `content.js`, **both** the live simulator desk **and** the documentation tables in *Model & Ethics* update automatically when you refresh the browser.
