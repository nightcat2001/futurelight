const fs = require("fs");
const path = require("path");

const codePath = path.join(__dirname, "code.js");
const reportPath = path.join(__dirname, "validation-report.json");
const code = fs.readFileSync(codePath, "utf8");
const failures = [];
const warnings = [];
const MAX_ALLOWED_LAYOUT_SIMILARITY = 0.45;
const REQUIRED_CORE_HIGH_FIDELITY_PAGES = 12;
const EXPECTED_PAGE_COUNT = 12;

function fail(gate, message, pageId) {
  failures.push({ gate, message, pageId: pageId || null });
}

function warn(gate, message, pageId) {
  warnings.push({ gate, message, pageId: pageId || null });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function loadFinalPageSpecs() {
  const end = code.indexOf("function renderFrame");
  if (end < 0) throw new Error("Cannot find renderFrame boundary");
  const specProgram = `${code.slice(0, end)}\nreturn pageSpecs;`;
  return Function(specProgram)();
}

function asText(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(asText).join(" ");
  if (typeof value === "object") return Object.values(value).map(asText).join(" ");
  return String(value);
}

function hasNonEmpty(page, key) {
  if (!(key in page)) return false;
  const value = page[key];
  if (Array.isArray(value)) return value.length > 0 && value.every((item) => asText(item).trim().length > 0);
  if (typeof value === "object" && value !== null) return Object.keys(value).length > 0 && asText(value).trim().length > 0;
  return asText(value).trim().length > 0;
}

function unique(values) {
  return [...new Set(values)];
}

function tokens(value) {
  return unique(asText(value).toLowerCase().match(/[a-z0-9]+/g) || []);
}

function jaccard(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((item) => setB.has(item)).length;
  const union = new Set([...setA, ...setB]).size;
  return union ? intersection / union : 0;
}

function layoutSignature(page) {
  const componentTypes = [
    page.layout,
    page.audience,
    page.section,
    page.fields ? "fields" : "",
    page.choices ? `choices-${page.choices.length}` : "",
    page.cards ? `cards-${page.cards.length}` : "",
    page.items ? `items-${page.items.length}` : "",
    page.bullets ? `bullets-${page.bullets.length}` : "",
    page.rows ? `rows-${page.rows.length}` : "",
    page.sections ? `sections-${page.sections.length}` : "",
    page.stats ? `stats-${page.stats.length}` : "",
    page.dark ? "dark" : "light",
    page.danger ? "danger" : "",
    page.primaryCTA
  ];
  const semantic = tokens([
    page.title,
    page.heading,
    page.subtitle,
    page.fields,
    page.choices,
    page.cards,
    page.items,
    page.bullets,
    page.rows,
    page.sections,
    page.stats,
    page.prompt,
    page.feedback,
    page.hero,
    page.note,
    page.state,
    page.recovery,
    page.components,
    page.interaction,
    page.animation,
    page.illustration
  ]);
  return unique([...componentTypes.filter(Boolean), ...semantic]);
}

let pages = [];
try {
  pages = loadFinalPageSpecs();
} catch (error) {
  fail("Schema Validation", `Unable to load final pageSpecs: ${error.message}`);
}

const requiredFields = [
  "pageId",
  "title",
  "route",
  "section",
  "audience",
  "ageBand",
  "businessGoal",
  "userGoal",
  "userPain",
  "journey",
  "uxFlow",
  "taskFlow",
  "iaRole",
  "layout",
  "components",
  "primaryCTA",
  "secondaryCTA",
  "copywriting",
  "illustration",
  "states",
  "interaction",
  "animation",
  "accessibility",
  "responsive",
  "childSafety",
  "productFit",
  "acceptanceCriteria",
  "testCases",
  "layoutFamily",
  "visualDesignLevel",
  "actualUIScreen",
  "navigationModel",
  "appChrome",
  "componentTree",
  "visualHierarchy",
  "roleSeparation",
  "designReviewEvidence"
];

const requiredStateKeys = ["default", "loading", "empty", "error", "success", "disabled", "offline"];
const requiredSections = ["Core 12"];
const requiredAudiences = ["child", "parent", "parent child"];
const requiredLayouts = [
  "first-launch-immersive",
  "secure-parent-form",
  "profile-builder",
  "age-band-panels",
  "trustworthy-recommendation",
  "immersive-child-player",
  "calm-child-completion",
  "parent-next-decision",
  "parent-led-task",
  "split-role-interaction",
  "parent-dashboard",
  "dim-bedtime-environment"
];
const requiredCorePageIds = [
  "FL-HF-01",
  "FL-HF-02",
  "FL-HF-03",
  "FL-HF-04",
  "FL-HF-05",
  "FL-HF-06",
  "FL-HF-07",
  "FL-HF-08",
  "FL-HF-09",
  "FL-HF-10",
  "FL-HF-11",
  "FL-HF-12"
];

if (pages.length !== EXPECTED_PAGE_COUNT) fail("Page Coverage Validation", `Expected ${EXPECTED_PAGE_COUNT} core high-fidelity pages, found ${pages.length}`);
for (const pageId of requiredCorePageIds) {
  if (!pages.some((page) => page.pageId === pageId)) fail("Page Coverage Validation", `Missing core page: ${pageId}`);
}

if (fs.existsSync(path.join(__dirname, "futurelight-validated-79-screens.svg"))) {
  fail(
    "Output Artifact Validation",
    "Existing SVG poster output is not accepted as product UI or Figma delivery. Remove it and generate real app screens only."
  );
}

if (fs.existsSync(path.join(__dirname, "export-svg-preview.js"))) {
  fail(
    "Output Artifact Validation",
    "SVG poster exporter exists. Poster/catalog exports are forbidden as final UI output."
  );
}

for (const page of pages) {
  for (const field of requiredFields) {
    if (!hasNonEmpty(page, field)) fail("Schema Validation", `${page.title || "(missing title)"} missing or empty field: ${field}`, page.pageId);
  }
  for (const key of requiredStateKeys) {
    if (!page.states || !hasNonEmpty(page.states, key)) fail("State Coverage Validation", `${page.title} missing state: ${key}`, page.pageId);
  }
}

const sections = unique(pages.map((page) => page.section));
const audiences = unique(pages.map((page) => page.audience));
const layouts = unique(pages.map((page) => page.layout));
for (const section of requiredSections) if (!sections.includes(section)) fail("Coverage Validation", `Missing section: ${section}`);
for (const audience of requiredAudiences) if (!audiences.includes(audience)) fail("Coverage Validation", `Missing audience: ${audience}`);
for (const layout of requiredLayouts) if (!layouts.includes(layout)) fail("Coverage Validation", `Missing layout: ${layout}`);

const forbiddenTerms = [
  "Lorem ipsum",
  "Primary action",
  "TBD",
  "TODO",
  "dummy"
];
for (const page of pages) {
  const pageText = asText(page);
  for (const term of forbiddenTerms) {
    if (new RegExp(escapeRegExp(term), "i").test(pageText)) fail("Content Validation", `${page.title} contains forbidden term: ${term}`, page.pageId);
  }
  if ((page.heading || page.title).length < 5) fail("Content Validation", `${page.title} heading too weak`, page.pageId);
  if ((page.subtitle || "").length < 12) fail("Content Validation", `${page.title} subtitle too weak`, page.pageId);
  if (asText(page.copywriting).length < 30) fail("Content Validation", `${page.title} copywriting too thin`, page.pageId);
}

const titleCounts = new Map();
const ctaCounts = new Map();
const routeCounts = new Map();
const businessGoalCounts = new Map();
for (const page of pages) {
  titleCounts.set(page.title, (titleCounts.get(page.title) || 0) + 1);
  routeCounts.set(page.route, (routeCounts.get(page.route) || 0) + 1);
  ctaCounts.set(page.primaryCTA, (ctaCounts.get(page.primaryCTA) || 0) + 1);
  businessGoalCounts.set(page.businessGoal, (businessGoalCounts.get(page.businessGoal) || 0) + 1);
}
for (const [title, count] of titleCounts) if (count > 1) fail("Duplicate Detection", `Duplicate title: ${title}`);
for (const [route, count] of routeCounts) if (count > 1) fail("Duplicate Detection", `Duplicate route: ${route}`);
for (const [cta, count] of ctaCounts) if (count > 4) fail("Duplicate Detection", `CTA repeated too often (${count}): ${cta}`);
for (const [goal, count] of businessGoalCounts) if (count > 1) fail("Duplicate Detection", `Business goal duplicated (${count}): ${goal}`);

let maxLayoutSimilarity = 0;
let maxLayoutPair = [];
for (let i = 0; i < pages.length; i++) {
  for (let j = i + 1; j < pages.length; j++) {
    const similarity = jaccard(layoutSignature(pages[i]), layoutSignature(pages[j]));
    if (similarity > maxLayoutSimilarity) {
      maxLayoutSimilarity = similarity;
      maxLayoutPair = [pages[i], pages[j]];
    }
    if (similarity > MAX_ALLOWED_LAYOUT_SIMILARITY) {
      fail(
        "Layout Validation",
        `Layout similarity ${(similarity * 100).toFixed(1)}% exceeds ${(MAX_ALLOWED_LAYOUT_SIMILARITY * 100).toFixed(0)}%: ${pages[i].title} / ${pages[j].title}`,
        `${pages[i].pageId},${pages[j].pageId}`
      );
    }
  }
}

const highFidelityPages = pages.filter((page) => page.visualDesignLevel === "high-fidelity-ui");
if (highFidelityPages.length < REQUIRED_CORE_HIGH_FIDELITY_PAGES) {
  fail(
    "UI Review",
    `At least ${REQUIRED_CORE_HIGH_FIDELITY_PAGES} core pages must be high-fidelity UI before broad 79-page output. Found ${highFidelityPages.length}.`
  );
}

const rendererCounts = {};
for (const page of pages) rendererCounts[page.layout] = (rendererCounts[page.layout] || 0) + 1;
for (const [layout, count] of Object.entries(rendererCounts)) {
  if (count > 1) fail("Layout Validation", `Core 12 renderer reused (${count}): ${layout}`);
}

const accessibilitySignals = ["large", "contrast", "non-color", "reduced-motion", "focus", "audio"];
for (const page of pages) {
  const a11y = asText([page.accessibility, page.responsive]);
  for (const signal of accessibilitySignals) {
    if (!new RegExp(signal, "i").test(a11y)) fail("Accessibility Validation", `${page.title} missing accessibility signal: ${signal}`, page.pageId);
  }
}

const unsafeTerms = ["violence", "weapon", "blood", "horror", "adult content", "gambling", "casino", "betting"];
for (const page of pages) {
  const text = asText([page.title, page.heading, page.subtitle, page.copywriting, page.illustration, page.childSafety]);
  for (const term of unsafeTerms) {
    if (new RegExp(term, "i").test(text)) fail("Child Safety Validation", `${page.title} contains unsafe term: ${term}`, page.pageId);
  }
  if ((page.audience === "child" || page.audience === "parent child") && !/visual|audio|tap|picture|large|gentle|calm|no reading/i.test(asText(page))) {
    fail("Child Safety Validation", `${page.title} lacks child-appropriate visual/audio/tap guidance`, page.pageId);
  }
}

for (const page of pages) {
  if (!Array.isArray(page.components) || page.components.length < 4) fail("Component Validation", `${page.title} component list too thin`, page.pageId);
  if (!/parent|child|story|age|consent|privacy|bedtime|task|growth|support|account|recommendation|progress|data|export|delete|settings/i.test(asText(page))) {
    fail("Business Logic Validation", `${page.title} lacks product-positioning terms`, page.pageId);
  }
  if (!/tap|press|select|input|toggle|open|resume|retry|exit|confirm|advance|filter/i.test(page.interaction)) {
    fail("Interaction Validation", `${page.title} interaction is not operational`, page.pageId);
  }
  if (!/motion|fade|transition|feedback|reduced|gentle|ease|loading|buffer|parent-gate/i.test(page.animation)) {
    fail("Animation Validation", `${page.title} animation lacks purpose or reduced-motion detail`, page.pageId);
  }
  if (!/0-6|child|parent|story|learning|bedtime|growth/i.test(page.productFit)) {
    fail("Product Positioning Validation", `${page.title} productFit does not prove fit`, page.pageId);
  }
  if (!/understands|complete|safe|trust|clarity|measurable/i.test(page.businessGoal + " " + page.userGoal)) {
    fail("PM Review", `${page.title} goal is not measurable or clear`, page.pageId);
  }
  if (!/confusion|clear|visual|cognitive|safe|recover|one clear|next/i.test(asText([page.userGoal, page.userPain, page.taskFlow, page.interaction]))) {
    fail("UX Review", `${page.title} does not prove understandable first-use UX`, page.pageId);
  }
  if (page.visualDesignLevel !== "high-fidelity-ui") {
    fail("UI Review", `${page.title} is not marked high-fidelity-ui`, page.pageId);
  }
  if (/poster|catalog|wireframe|page spec card/i.test(asText([page.actualUIScreen, page.layoutFamily, page.visualHierarchy]))) {
    fail("UI Review", `${page.title} appears to be a catalog/poster/wireframe artifact`, page.pageId);
  }
}

const report = {
  status: failures.length ? "FAIL" : "PASS",
  productionReady: false,
  taskComplete: false,
  revokedPriorPass: true,
  generatedAt: new Date().toISOString(),
  pages: pages.length,
  sections,
  audiences,
  layouts,
  rendererCounts,
  maxLayoutSimilarity: Number((maxLayoutSimilarity * 100).toFixed(2)),
  maxAllowedLayoutSimilarity: Number((MAX_ALLOWED_LAYOUT_SIMILARITY * 100).toFixed(2)),
  maxLayoutSimilarityPair: maxLayoutPair.map((page) => `${page.pageId} ${page.title}`),
  gates: {
    schema: !failures.some((f) => f.gate === "Schema Validation"),
    content: !failures.some((f) => f.gate === "Content Validation"),
    coverage: !failures.some((f) => f.gate.includes("Coverage") || f.gate === "Page Coverage Validation"),
    duplicate: !failures.some((f) => f.gate === "Duplicate Detection"),
    layout: !failures.some((f) => f.gate === "Layout Validation"),
    accessibility: !failures.some((f) => f.gate === "Accessibility Validation"),
    childSafety: !failures.some((f) => f.gate === "Child Safety Validation"),
    component: !failures.some((f) => f.gate === "Component Validation"),
    businessLogic: !failures.some((f) => f.gate === "Business Logic Validation"),
    interaction: !failures.some((f) => f.gate === "Interaction Validation"),
    animation: !failures.some((f) => f.gate === "Animation Validation"),
    productPositioning: !failures.some((f) => f.gate === "Product Positioning Validation"),
    pmReview: !failures.some((f) => f.gate === "PM Review"),
    uxReview: !failures.some((f) => f.gate === "UX Review")
  },
  failures,
  warnings
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

if (failures.length > 0) {
  console.error("DESIGN VALIDATION: FAIL");
  for (const failure of failures.slice(0, 80)) console.error(`- [${failure.gate}] ${failure.message}`);
  if (failures.length > 80) console.error(`- ... ${failures.length - 80} more failures`);
  console.error(`Report: ${reportPath}`);
  process.exit(1);
}

console.log("DESIGN VALIDATION: PASS");
console.log(`Pages: ${pages.length}`);
console.log(`Max layout similarity: ${report.maxLayoutSimilarity}% (${report.maxLayoutSimilarityPair.join(" / ")})`);
console.log(`Renderer counts: ${JSON.stringify(rendererCounts)}`);
console.log(`Report: ${reportPath}`);
