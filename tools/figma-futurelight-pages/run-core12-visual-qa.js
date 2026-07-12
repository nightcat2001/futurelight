const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const outDir = path.join(root, "output", "core12-ui");
const manifestPath = path.join(outDir, "manifest.json");
const validationPath = path.join(__dirname, "validation-report.json");

const failures = [];
const checks = [];

function check(name, condition, detail) {
  checks.push({ name, status: condition ? "PASS" : "FAIL", detail });
  if (!condition) failures.push(`${name}: ${detail}`);
}

function fileSize(file) {
  return fs.existsSync(file) ? fs.statSync(file).size : 0;
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const validation = JSON.parse(fs.readFileSync(validationPath, "utf8"));
const pages = manifest.pages || [];

check("DATA_SCHEMA_VALIDATION", validation.gates.schema === true, "validator schema gate must pass");
check("PAGE_SPEC_VALIDATION", pages.length === 12, `expected 12 pages, found ${pages.length}`);
check("STRUCTURAL_DIFFERENTIATION", validation.maxLayoutSimilarity <= validation.maxAllowedLayoutSimilarity, `max ${validation.maxLayoutSimilarity}% <= ${validation.maxAllowedLayoutSimilarity}%`);
check("UNIQUE_RENDERERS", Object.values(validation.rendererCounts || {}).every((count) => count === 1), "each core screen must use a unique renderer family");
check("CONTENT_SAFETY", validation.gates.childSafety === true && validation.gates.content === true, "content and child safety gates must pass");
check("STATIC_VISUAL_REVIEW", fs.existsSync(path.join(outDir, "index.html")) && fs.existsSync(path.join(outDir, "prototype.html")), "gallery and prototype HTML must exist");
check("PROTOTYPE_FLOW_REVIEW", (manifest.prototypeFlows || []).length === 5, `expected 5 flows, found ${(manifest.prototypeFlows || []).length}`);
check("FIGMA_CANVAS_REVIEW", false, "BLOCKED_EXTERNAL: Figma canvas must be reviewed after manual/plugin import");
check("UX_REVIEW", validation.gates.uxReview === true, "UX review gate must pass");
check("UI_REVIEW", validation.gates.layout === true && validation.gates.component === true, "layout and component gates must pass");
check("PRODUCTION_READY", false, "NO: Figma canvas review is blocked external");
check("TASK_COMPLETE", false, "NO: Figma canvas review is blocked external");

for (const page of pages) {
  const svg = path.join(outDir, page.artifactSvg);
  const png = path.join(outDir, page.artifactPng);
  check(`${page.pageId}_SVG_EXISTS`, fileSize(svg) > 3000, `${page.artifactSvg} size ${fileSize(svg)}`);
  check(`${page.pageId}_PNG_EXISTS`, fileSize(png) > 20000, `${page.artifactPng} size ${fileSize(png)}`);
  check(`${page.pageId}_COMPONENT_TREE`, Array.isArray(page.componentTree) && page.componentTree.length >= 5, "component tree has at least 5 nodes");
  check(`${page.pageId}_CTA`, typeof page.primaryCTA === "string" && page.primaryCTA.length >= 5, `primary CTA: ${page.primaryCTA}`);
}

const report = {
  status: failures.length ? "FAIL" : "PASS",
  generatedAt: new Date().toISOString(),
  figmaCanvasReview: "BLOCKED_EXTERNAL",
  productionReady: false,
  taskComplete: false,
  pages: pages.length,
  prototypeFlows: (manifest.prototypeFlows || []).length,
  checks,
  failures
};

fs.writeFileSync(path.join(outDir, "visual-qa-report.json"), JSON.stringify(report, null, 2), "utf8");

const md = [
  "# FutureLight Core 12 Visual QA",
  "",
  `Status: ${report.status}`,
  "",
  "| Check | Status | Detail |",
  "| --- | --- | --- |",
  ...checks.map((item) => `| ${item.name} | ${item.status} | ${String(item.detail).replace(/\|/g, "/")} |`),
  "",
  "## Gate Summary",
  "",
  "- FIGMA_CANVAS_REVIEW: BLOCKED_EXTERNAL",
  "- PRODUCTION_READY: NO",
  "- TASK_COMPLETE: NO"
].join("\n");
fs.writeFileSync(path.join(outDir, "visual-qa-report.md"), md, "utf8");

if (failures.some((failure) => !failure.includes("FIGMA_CANVAS_REVIEW") && !failure.includes("PRODUCTION_READY") && !failure.includes("TASK_COMPLETE"))) {
  console.error(`STATIC VISUAL QA: FAIL\n${failures.join("\n")}`);
  process.exit(1);
}

console.log("STATIC VISUAL QA: PASS_WITH_EXTERNAL_FIGMA_BLOCKER");
console.log(`Report: ${path.join(outDir, "visual-qa-report.md")}`);
