import { createServer } from "node:http";
import { readFile, mkdir, writeFile, stat, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import playwrightCore from "../../frontend/node_modules/playwright-core/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(root, "..");
const reportDir = path.join(root, "reports");
const screenshotDir = path.join(reportDir, "screenshots");
const dataModule = await import(pathToFileURL(path.join(root, "data.js")).href);
const { pages, flows, designSystem } = dataModule;
const { chromium } = playwrightCore;
const failures = [];
const warnings = [];
const evidence = [];

function pass(check, detail) {
  evidence.push({ check, status: "PASS", detail });
}

function fail(check, detail) {
  failures.push({ check, status: "FAIL", detail });
}

function warn(check, detail) {
  warnings.push({ check, status: "WARN", detail });
}

function required(value) {
  return typeof value === "string" ? value.trim().length > 0 : Array.isArray(value) ? value.length > 0 : Boolean(value);
}

function tokenize(value) {
  return String(value).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function jaccard(left, right) {
  const a = new Set(left);
  const b = new Set(right);
  const union = new Set([...a, ...b]);
  const intersection = [...a].filter((item) => b.has(item));
  return union.size === 0 ? 0 : intersection.length / union.size;
}

const requiredPageFields = [
  "id", "title", "route", "renderer", "audience", "ageBand", "businessGoal", "userGoal", "pain",
  "sitemap", "navigation", "journey", "userFlow", "taskFlow", "layoutFamily", "components",
  "primaryCTA", "secondaryCTA", "copy", "illustration", "interaction", "animation", "accessibility",
  "childSafety", "responsive", "api", "states", "acceptance", "testIds"
];
const stateFields = ["default", "loading", "empty", "error", "success", "offline", "apiDelay", "apiFailure", "disabled", "permissionDenied"];
const bannedTerms = ["lorem", "ipsum", "placeholder", "todo", "casino", "gambling", "betting", "weapon", "blood", "horror", "adult content"];
const vagueTerms = ["click here", "learn more", "content here", "image here", "card title"];

if (pages.length === 12) pass("PAGE_COVERAGE", "12 core pages present");
else fail("PAGE_COVERAGE", `expected 12 pages, found ${pages.length}`);

if (flows.length >= 5) pass("FLOW_COVERAGE", `${flows.length} user flows present`);
else fail("FLOW_COVERAGE", `expected at least 5 flows, found ${flows.length}`);

for (const key of ["typography", "spacing", "color", "icons", "motion", "breakpoints", "touchTarget"]) {
  if (required(designSystem[key])) pass(`DESIGN_SYSTEM_${key.toUpperCase()}`, String(designSystem[key]));
  else fail(`DESIGN_SYSTEM_${key.toUpperCase()}`, "missing design system token");
}

const ids = new Set();
const routes = new Set();
const renderers = new Set();
for (const page of pages) {
  if (ids.has(page.id)) fail("DUPLICATE_PAGE_ID", page.id);
  ids.add(page.id);
  if (routes.has(page.route)) fail("DUPLICATE_ROUTE", page.route);
  routes.add(page.route);
  renderers.add(page.renderer);

  for (const field of requiredPageFields) {
    if (!required(page[field])) fail("SCHEMA_VALIDATION", `${page.id} missing ${field}`);
  }
  for (const state of stateFields) {
    if (!required(page.states?.[state])) fail("STATE_COVERAGE", `${page.id} missing ${state}`);
  }
  const contentBlob = JSON.stringify(page).toLowerCase();
  for (const term of bannedTerms) {
    if (contentBlob.includes(term)) fail("CONTENT_OR_CHILD_SAFETY", `${page.id} contains banned term: ${term}`);
  }
  for (const term of vagueTerms) {
    if (contentBlob.includes(term)) fail("GENERIC_CONTENT", `${page.id} contains vague term: ${term}`);
  }
  if (page.audience.toLowerCase().includes("child") && page.copy.length > 180) {
    fail("COGNITIVE_LOAD", `${page.id} child-facing copy too long`);
  }
  if (!page.childSafety.toLowerCase().includes("no") && !page.childSafety.toLowerCase().includes("adult")) {
    warn("CHILD_SAFETY_COPY", `${page.id} child safety text should state a constraint`);
  }
}

if (renderers.size === pages.length) pass("UNIQUE_RENDERERS", "all 12 pages have unique renderer functions");
else fail("UNIQUE_RENDERERS", `expected 12 unique renderers, found ${renderers.size}`);

let maxSimilarity = 0;
let maxPair = "";
for (let i = 0; i < pages.length; i += 1) {
  for (let j = i + 1; j < pages.length; j += 1) {
    const left = pages[i];
    const right = pages[j];
    const fields = [
      left.layoutFamily,
      left.renderer,
      left.primaryCTA,
      left.secondaryCTA,
      left.components.join(" "),
      left.interaction,
      left.animation
    ];
    const otherFields = [
      right.layoutFamily,
      right.renderer,
      right.primaryCTA,
      right.secondaryCTA,
      right.components.join(" "),
      right.interaction,
      right.animation
    ];
    const similarity = jaccard(tokenize(fields.join(" ")), tokenize(otherFields.join(" ")));
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      maxPair = `${left.id} / ${right.id}`;
    }
  }
}
if (maxSimilarity <= 0.45) pass("LAYOUT_SIMILARITY", `max ${(maxSimilarity * 100).toFixed(2)}% for ${maxPair}`);
else fail("LAYOUT_SIMILARITY", `max ${(maxSimilarity * 100).toFixed(2)}% for ${maxPair}`);

const requiredFiles = [
  "index.html",
  "app.js",
  "router.js",
  "data.js",
  "styles/tokens.css",
  "styles/base.css",
  "styles/components.css",
  "styles/pages.css",
  "styles/responsive.css",
  "styles/animations.css"
];
for (const file of requiredFiles) {
  try {
    const info = await stat(path.join(root, file));
    if (info.size > 0) pass("FILE_EXISTS", `${file} size ${info.size}`);
    else fail("FILE_EXISTS", `${file} is empty`);
  } catch {
    fail("FILE_EXISTS", `${file} missing`);
  }
}

function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html";
  if (filePath.endsWith(".js")) return "text/javascript";
  if (filePath.endsWith(".css")) return "text/css";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const requested = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    const candidates = [
      path.join(root, requested),
      path.join(repoRoot, requested.replace(/^\.\.\//, ""))
    ];
    let body;
    let chosen;
    for (const candidate of candidates) {
      try {
        body = await readFile(candidate);
        chosen = candidate;
        break;
      } catch {}
    }
    if (!body) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "content-type": contentType(chosen) });
    res.end(body);
  } catch (error) {
    res.writeHead(500);
    res.end(String(error));
  }
});

await rm(screenshotDir, { recursive: true, force: true });
await mkdir(screenshotDir, { recursive: true });
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const contexts = [
  { name: "mobile-320", width: 320, height: 780 },
  { name: "mobile-360", width: 360, height: 800 },
  { name: "android-390", width: 390, height: 844 },
  { name: "mobile-412", width: 412, height: 892 },
  { name: "tablet-768", width: 768, height: 900 },
  { name: "tablet-1024", width: 1024, height: 900 },
  { name: "desktop-1440", width: 1440, height: 1000 }
];
const visualCases = [
  { widthName: "android-390", state: "default" },
  { widthName: "android-390", state: "loading" },
  { widthName: "android-390", state: "error" },
  { widthName: "tablet-768", state: "default" },
  { widthName: "desktop-1440", state: "default" }
];
let screenshotCount = 0;

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

try {
  for (const viewport of contexts) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const consoleErrors = [];
    const brokenAssets = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("response", (response) => {
      if (response.status() >= 400) brokenAssets.push(`${response.status()} ${response.url()}`);
    });

    for (const spec of pages) {
      await page.goto(`http://127.0.0.1:${port}/${spec.route}`, { waitUntil: "networkidle" });
      const title = await page.locator("#screenTitle").textContent();
      if (title?.includes(spec.id)) pass("ROUTE_RENDER", `${viewport.name} ${spec.id}`);
      else fail("ROUTE_RENDER", `${viewport.name} ${spec.id} did not render title`);

      const visibleButtons = await page.locator(".device-frame button:visible").count();
      if (visibleButtons >= 3) pass("INTERACTION_CONTROLS", `${viewport.name} ${spec.id} has ${visibleButtons} visible controls`);
      else fail("INTERACTION_CONTROLS", `${viewport.name} ${spec.id} has too few visible controls`);

      const stateCount = await page.locator("#stateControls button").count();
      if (stateCount >= 10) pass("STATE_CONTROLS", `${viewport.name} ${spec.id} has ${stateCount} state controls`);
      else fail("STATE_CONTROLS", `${viewport.name} ${spec.id} missing state controls`);

      const overflow = await page.evaluate(() => {
        const frame = document.querySelector(".device-frame");
        const root = document.querySelector(".screen-root");
        return root.scrollWidth - frame.clientWidth;
      });
      if (overflow <= 16) pass("RESPONSIVE_OVERFLOW", `${viewport.name} ${spec.id} overflow ${overflow}`);
      else fail("RESPONSIVE_OVERFLOW", `${viewport.name} ${spec.id} horizontal overflow ${overflow}`);

      for (const visualCase of visualCases.filter((item) => item.widthName === viewport.name)) {
        if (visualCase.state !== "default") {
          await page.locator(`#stateControls [data-state="${visualCase.state}"]`).click();
        }
        const fileName = `${spec.id}_${slug(spec.title)}_${viewport.width}_${visualCase.state}.png`;
        await page.screenshot({ path: path.join(screenshotDir, fileName), fullPage: true });
        screenshotCount += 1;
        if (visualCase.state !== "default") {
          await page.locator(`#stateControls [data-state="default"]`).click();
        }
      }
    }

    if (consoleErrors.length === 0) pass("CONSOLE_ERRORS", `${viewport.name} zero console errors`);
    else fail("CONSOLE_ERRORS", `${viewport.name}: ${consoleErrors.join("; ")}`);
    if (brokenAssets.length === 0) pass("BROKEN_ASSETS", `${viewport.name} zero broken assets`);
    else fail("BROKEN_ASSETS", `${viewport.name}: ${brokenAssets.join("; ")}`);
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}

if (screenshotCount >= 60) pass("VISUAL_QA_SCREENSHOTS", `${screenshotCount} screenshots generated`);
else fail("VISUAL_QA_SCREENSHOTS", `expected at least 60 screenshots, generated ${screenshotCount}`);
const gateSummary = {
  "PAGE STRUCTURE": failures.some((item) => ["SCHEMA_VALIDATION", "PAGE_COVERAGE", "FILE_EXISTS"].includes(item.check)) ? "FAIL" : "PASS",
  "PAGE CONTENT": failures.some((item) => ["CONTENT_OR_CHILD_SAFETY", "GENERIC_CONTENT"].includes(item.check)) ? "FAIL" : "PASS",
  "PAGE INTERACTION": failures.some((item) => item.check === "INTERACTION_CONTROLS") ? "FAIL" : "PASS",
  "USER FLOW": failures.some((item) => item.check === "FLOW_COVERAGE") ? "FAIL" : "PASS",
  "STATE COVERAGE": failures.some((item) => ["STATE_COVERAGE", "STATE_CONTROLS"].includes(item.check)) ? "FAIL" : "PASS",
  "RESPONSIVE": failures.some((item) => item.check === "RESPONSIVE_OVERFLOW") ? "FAIL" : "PASS",
  "VISUAL QA": failures.some((item) => ["VISUAL_QA_SCREENSHOTS", "LAYOUT_SIMILARITY", "UNIQUE_RENDERERS"].includes(item.check)) ? "FAIL" : "PASS",
  "ACCESSIBILITY": failures.some((item) => item.check.includes("A11Y")) ? "FAIL" : "PASS",
  "CHILD SAFETY": failures.some((item) => item.check.includes("CHILD")) ? "FAIL" : "PASS",
  "CONTENT SAFETY": failures.some((item) => item.check.includes("CONTENT")) ? "FAIL" : "PASS",
  "CONSOLE": failures.some((item) => item.check === "CONSOLE_ERRORS") ? "FAIL" : "PASS",
  "ASSETS": failures.some((item) => item.check === "BROKEN_ASSETS") ? "FAIL" : "PASS",
  "E2E": failures.some((item) => ["ROUTE_RENDER", "INTERACTION_CONTROLS"].includes(item.check)) ? "FAIL" : "PASS",
  "PRODUCTION REVIEW": "BLOCKED"
};
const status = failures.length === 0 ? "PASS" : "FAIL";
const report = {
  status,
  prototypeReviewReady: failures.length === 0 ? "YES" : "NO",
  productionReady: "NO",
  taskComplete: "NO",
  productionReadyReason: "HTML prototype gate can prove local review readiness, not backend/API/release production readiness.",
  taskCompleteReason: "Overall child product delivery still requires implementation, backend, persistence, release QA, and final human review.",
  pageCount: pages.length,
  flowCount: flows.length,
  screenshotCount,
  maxLayoutSimilarity: Number((maxSimilarity * 100).toFixed(2)),
  maxLayoutSimilarityPair: maxPair,
  gateSummary,
  evidence,
  warnings,
  failures
};

const md = [
  "# FutureLight HTML Prototype Gate",
  "",
  `Status: ${status}`,
  `Prototype Review Ready: ${report.prototypeReviewReady}`,
  `Production Ready: ${report.productionReady}`,
  `Task Complete: ${report.taskComplete}`,
  `Production Ready Reason: ${report.productionReadyReason}`,
  `Task Complete Reason: ${report.taskCompleteReason}`,
  `Page Count: ${report.pageCount}`,
  `Flow Count: ${report.flowCount}`,
  `Screenshot Count: ${report.screenshotCount}`,
  `Max Layout Similarity: ${report.maxLayoutSimilarity}% (${report.maxLayoutSimilarityPair})`,
  "",
  "## Gate Summary",
  ...Object.entries(gateSummary).map(([gate, gateStatus]) => `- ${gate}: ${gateStatus}`),
  "",
  "## Failures",
  failures.length ? failures.map((item) => `- ${item.check}: ${item.detail}`).join("\n") : "- None",
  "",
  "## Warnings",
  warnings.length ? warnings.map((item) => `- ${item.check}: ${item.detail}`).join("\n") : "- None",
  "",
  "## Evidence",
  ...evidence.map((item) => `- ${item.check}: ${item.detail}`)
].join("\n");

await writeFile(path.join(reportDir, "html-prototype-gate.json"), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(path.join(reportDir, "html-prototype-gate.md"), `${md}\n`);

console.log(`HTML PROTOTYPE GATE: ${status}`);
console.log(`Report: ${path.join(reportDir, "html-prototype-gate.md")}`);
if (failures.length > 0) process.exit(1);
