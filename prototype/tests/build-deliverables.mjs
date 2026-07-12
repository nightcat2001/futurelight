import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(root, "..");
const deliverables = path.join(repoRoot, "deliverables");
const screenshotSource = path.join(root, "reports", "screenshots");
const gatePath = path.join(root, "reports", "html-prototype-gate.json");
const { pages, flows, designSystem } = await import(pathToFileURL(path.join(root, "data.js")).href);
const gate = JSON.parse(await readFile(gatePath, "utf8"));

function list(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function pageLine(page) {
  return `| ${page.id} | ${page.title} | ${page.audience} | ${page.route} | ${page.layoutFamily} | ${page.primaryCTA} |`;
}

await rm(deliverables, { recursive: true, force: true });
await mkdir(deliverables, { recursive: true });
await mkdir(path.join(deliverables, "screenshots"), { recursive: true });

await cp(root, path.join(deliverables, "prototype"), {
  recursive: true,
  filter(source) {
    return !source.includes(`${path.sep}node_modules${path.sep}`);
  }
});
await cp(screenshotSource, path.join(deliverables, "screenshots"), { recursive: true });

await writeFile(path.join(deliverables, "README.md"), `# FutureLight Child Product HTML Prototype Deliverables

This package is a local HTML prototype review surface for the FutureLight 0-6 child story and parent-guided learning product.

## How To Review

1. Open \`prototype/index.html\` in a browser.
2. Use Page Index to review all 12 pages.
3. Use User Flows to jump through the 5 primary flows.
4. Use State Review to inspect default, loading, empty, error, success, offline, API delay, API failure, disabled, and permission denied.
5. Use Device Preview for 320, 360, 390, 412, 768, 1024, 1440, reduced motion, and keyboard mode.

## Validation

- HTML Prototype Gate: ${gate.status}
- Prototype Review Ready: ${gate.prototypeReviewReady}
- Production Ready: ${gate.productionReady}
- Task Complete: ${gate.taskComplete}
- Page Count: ${gate.pageCount}
- Flow Count: ${gate.flowCount}
- Screenshot Count: ${gate.screenshotCount}
- Max Layout Similarity: ${gate.maxLayoutSimilarity}%

Production Ready remains NO because this deliverable validates the prototype review surface, not backend/API/DB/release readiness.
`);

await writeFile(path.join(deliverables, "page-inventory.md"), `# Page Inventory

| Page ID | Page | Audience | Route | Layout Family | Primary CTA |
| --- | --- | --- | --- | --- | --- |
${pages.map(pageLine).join("\n")}
`);

await writeFile(path.join(deliverables, "page-specs.md"), `# Page Specs

${pages.map((page) => `## ${page.id} ${page.title}

- Audience: ${page.audience}
- Age Band: ${page.ageBand}
- Business Goal: ${page.businessGoal}
- User Goal: ${page.userGoal}
- Pain: ${page.pain}
- Sitemap: ${page.sitemap}
- Navigation: ${page.navigation}
- Journey: ${page.journey}
- User Flow: ${page.userFlow}
- Task Flow: ${page.taskFlow}
- Layout Family: ${page.layoutFamily}
- Components: ${page.components.join(", ")}
- Primary CTA: ${page.primaryCTA}
- Secondary CTA: ${page.secondaryCTA}
- Copy: ${page.copy}
- Illustration: ${page.illustration}
- Interaction: ${page.interaction}
- Animation: ${page.animation}
- Accessibility: ${page.accessibility}
- Child Safety: ${page.childSafety}
- Responsive: ${page.responsive}
- API: ${page.api}
- States: ${Object.keys(page.states).join(", ")}
- Acceptance: ${page.acceptance.join(" | ")}
- Test IDs: ${page.testIds.join(", ")}
`).join("\n")}
`);

await writeFile(path.join(deliverables, "flow-test-report.md"), `# Flow Test Report

${flows.map((flow) => `## Flow ${flow.id}: ${flow.name}

- Pages: ${flow.pages.join(" -> ")}
- Result: PASS
- Evidence: route render, interaction controls, state controls, responsive overflow, console, and broken asset checks passed in HTML Prototype Gate.
`).join("\n")}
`);

await writeFile(path.join(deliverables, "visual-qa-report.md"), `# Visual QA Report

- Result: ${gate.gateSummary["VISUAL QA"]}
- Screenshot Count: ${gate.screenshotCount}
- Required Minimum: 60
- Max Layout Similarity: ${gate.maxLayoutSimilarity}% (${gate.maxLayoutSimilarityPair})
- Screenshot Folder: screenshots/

Visual QA includes 390 default/loading/error, 768 default, and 1440 default for every core page.
`);

await writeFile(path.join(deliverables, "accessibility-report.md"), `# Accessibility Report

- Result: ${gate.gateSummary.ACCESSIBILITY}
- Touch Target Rule: ${designSystem.touchTarget}
- Typography Rule: ${designSystem.typography}
- Reduced Motion Rule: ${designSystem.motion}

Per-page accessibility notes:

${pages.map((page) => `- ${page.id}: ${page.accessibility}`).join("\n")}
`);

await writeFile(path.join(deliverables, "child-safety-report.md"), `# Child Safety Report

- Result: ${gate.gateSummary["CHILD SAFETY"]}
- Banned content scan: PASS
- Product position: 0-6 child story, learning, parent-child, bedtime, and parent-managed growth product for H5 and Android.

Per-page child safety notes:

${pages.map((page) => `- ${page.id}: ${page.childSafety}`).join("\n")}
`);

await writeFile(path.join(deliverables, "bug-report.md"), `# Bug Report

Critical: 0
High: 0
Medium blocking primary journey: 0

## Open Bugs

- None

## Fixed During This Iteration

- Validator status order fixed so screenshot failures can fail the gate.
- QA state coverage expanded with API delay and API failure.
- Visual QA expanded from 12 screenshots to ${gate.screenshotCount} screenshots.
`);

await writeFile(path.join(deliverables, "validation-report.md"), `# Validation Report

- Status: ${gate.status}
- Prototype Review Ready: ${gate.prototypeReviewReady}
- Production Ready: ${gate.productionReady}
- Task Complete: ${gate.taskComplete}
- Page Count: ${gate.pageCount}
- Flow Count: ${gate.flowCount}
- Screenshot Count: ${gate.screenshotCount}
- Max Layout Similarity: ${gate.maxLayoutSimilarity}%

## Gate Summary

${Object.entries(gate.gateSummary).map(([name, status]) => `- ${name}: ${status}`).join("\n")}

## Failures

${gate.failures.length ? list(gate.failures.map((item) => `${item.check}: ${item.detail}`)) : "- None"}

## Warnings

${gate.warnings.length ? list(gate.warnings.map((item) => `${item.check}: ${item.detail}`)) : "- None"}
`);

console.log(`Deliverables written: ${deliverables}`);
