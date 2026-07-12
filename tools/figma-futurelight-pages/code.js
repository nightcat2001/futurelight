var W = 390;
var H = 844;
var GAP = 64;
var COLS = 4;

var C = {
  ink: { r: 0.09, g: 0.10, b: 0.13 },
  muted: { r: 0.38, g: 0.42, b: 0.48 },
  line: { r: 0.85, g: 0.88, b: 0.90 },
  paper: { r: 0.98, g: 0.98, b: 0.96 },
  white: { r: 1, g: 1, b: 1 },
  mint: { r: 0.67, g: 0.86, b: 0.76 },
  sky: { r: 0.58, g: 0.75, b: 0.92 },
  coral: { r: 0.93, g: 0.55, b: 0.47 },
  honey: { r: 0.96, g: 0.78, b: 0.34 },
  lilac: { r: 0.69, g: 0.64, b: 0.88 },
  night: { r: 0.13, g: 0.16, b: 0.26 },
  softBlue: { r: 0.91, g: 0.96, b: 1 },
  softMint: { r: 0.92, g: 0.98, b: 0.93 },
  softHoney: { r: 1, g: 0.96, b: 0.84 },
  softCoral: { r: 1, g: 0.91, b: 0.89 },
  softLilac: { r: 0.94, g: 0.92, b: 1 },
  danger: { r: 0.86, g: 0.22, b: 0.20 }
};

function fill(color) {
  return [{ type: "SOLID", color: color }];
}

function rect(parent, x, y, w, h, color, radius, stroke) {
  var n = figma.createRectangle();
  n.x = x;
  n.y = y;
  n.resize(w, h);
  n.fills = fill(color);
  n.cornerRadius = radius || 0;
  if (stroke) {
    n.strokes = fill(stroke);
    n.strokeWeight = 1;
  }
  parent.appendChild(n);
  return n;
}

function circle(parent, x, y, d, color, stroke) {
  var n = figma.createEllipse();
  n.x = x;
  n.y = y;
  n.resize(d, d);
  n.fills = fill(color);
  if (stroke) {
    n.strokes = fill(stroke);
    n.strokeWeight = 1;
  }
  parent.appendChild(n);
  return n;
}

function text(parent, value, x, y, size, color, width, weight) {
  var n = figma.createText();
  n.characters = value || "";
  n.x = x;
  n.y = y;
  n.fontSize = size;
  n.fontName = { family: "Inter", style: weight || "Regular" };
  n.fills = fill(color || C.ink);
  n.resize(width || Math.min(W - x - 24, Math.max(40, n.characters.length * size * 0.56)), size * 1.45);
  n.textAutoResize = "HEIGHT";
  parent.appendChild(n);
  return n;
}

function button(parent, x, y, w, label, color) {
  rect(parent, x, y, w, 52, color || C.honey, 8);
  text(parent, label, x + 18, y + 15, 15, C.ink, w - 36, "Medium");
}

function field(parent, x, y, w, label, value) {
  text(parent, label, x, y, 11, C.muted, w, "Medium");
  rect(parent, x, y + 18, w, 48, C.white, 8, C.line);
  text(parent, value || "", x + 14, y + 33, 14, C.ink, w - 28);
}

function pill(parent, x, y, label, color) {
  var w = Math.max(58, label.length * 8 + 24);
  rect(parent, x, y, w, 28, color || C.softBlue, 14, C.line);
  text(parent, label, x + 12, y + 7, 11, C.ink, w - 24, "Medium");
  return w;
}

function top(parent, spec) {
  rect(parent, 0, 0, W, 86, C.white, 0);
  circle(parent, 22, 42, 28, spec.accent || C.sky, C.line);
  text(parent, spec.title, 64, 42, 18, C.ink, 230, "Medium");
  text(parent, spec.audience || "parent", 302, 47, 10, C.muted, 66, "Medium");
}

function bottom(parent, active) {
  rect(parent, 0, 764, W, 80, C.white, 0, C.line);
  var labels = ["Home", "Story", "Task", "Parent"];
  for (var i = 0; i < labels.length; i++) {
    var x = 32 + i * 96;
    circle(parent, x, 780, 30, labels[i] === active ? C.mint : C.paper, C.line);
    text(parent, labels[i], x - 8, 814, 10, C.muted, 54);
  }
}

function stateCopy(spec) {
  if (spec.layout === "form") return "input validation / loading submit / field error";
  if (spec.layout === "list") return "loaded list / empty result / network retry";
  if (spec.layout === "player") return "play / pause / buffer / complete";
  if (spec.layout === "settings") return "saved / unsaved / parent gate / error";
  if (spec.layout === "childActivity") return "choice / success / try again / done";
  if (spec.layout === "system") return spec.state || "system recovery";
  return "ready / loading / success / recovery";
}

function motionCopy(spec) {
  if (spec.layout === "player" || spec.section === "Bedtime") return "gentle fade, no sudden movement, reduced-motion fallback";
  if (spec.layout === "childActivity") return "tap feedback, soft reward, no flashing";
  if (spec.layout === "form" || spec.layout === "settings") return "instant field feedback, parent-gate modal transition";
  return "shared-element card transition, 180ms ease-out";
}

function a11yCopy(spec) {
  if (spec.audience === "child") return "large targets, voice/image first, no reading required, contrast, non-color cues, focus order, reduced-motion fallback, audio alternative";
  if (spec.audience === "legal") return "parent-readable text, screen-reader headings, large touch targets, contrast, non-color cues, focus order, reduced-motion fallback, audio alternative";
  return "44px+ large targets, labels, contrast, non-color cues, focus order, reduced-motion fallback, audio alternative";
}

function ageBandFor(spec) {
  if (spec.audience === "child") {
    if (/Bedtime|Sleepy|Moon|White Noise/i.test(spec.title + " " + spec.heading)) return "0-6 with parent bedtime control";
    if (/Language|Focus|Q&A|Activity|Task|Complete/i.test(spec.title + " " + spec.heading)) return "3-6 visual-first child interaction";
    return "0-6 visual-first child playback";
  }
  if (spec.audience === "parent child") return "0-6 child with parent-assisted flow";
  if (spec.audience === "parent") return "parent or caregiver";
  if (spec.audience === "legal") return "parent or legal guardian";
  return "system state for parent or child flow";
}

function journeyFor(spec) {
  if (spec.section === "First Run / Account") return "first open -> parent login or signup -> consent -> child setup -> age and interest setup -> first recommendation";
  if (spec.section === "Home / Daily") return "returning session -> one recommended story or task -> bedtime or together-time entry";
  if (spec.section === "Stories") return "browse or accept recommendation -> preview -> play -> pause or complete -> next safe action";
  if (spec.section === "Growth / Interaction") return "story or daily task -> parent-guided prompt -> child visual response -> parent confirms";
  if (spec.section === "Bedtime") return "evening entry -> calm recommendation -> dim playback -> end without child-facing autoplay";
  if (spec.section === "Child Profile / Progress") return "parent reviews profile and progress -> adjusts age, interests, or history filters";
  if (spec.section === "Parent Center") return "parent manages controls, privacy, limits, profile switching, and account settings";
  if (spec.section === "System States") return "interruption -> clear state explanation -> recovery action without losing child progress";
  return "parent support or legal review -> resolve concern -> return to safe product flow";
}

function taskFor(spec) {
  var primary = spec.primary || spec.danger || "Return safely";
  if (spec.layout === "form") return "Read purpose -> enter parent-controlled fields -> validate input -> submit -> handle loading, field error, retry, or success";
  if (spec.layout === "chooser") return "Review concrete options -> select one option -> confirm with " + primary + " -> save preference";
  if (spec.layout === "list") return "Scan filters -> choose item -> open detail or recover from empty result";
  if (spec.layout === "player") return "Orient to story image -> use large play controls -> pause, buffer, resume, or complete";
  if (spec.layout === "childActivity") return "See one prompt -> tap large picture choice -> receive gentle feedback -> repeat or continue";
  if (spec.layout === "settings") return "Review setting rows -> change parent-controlled option -> confirm saved or recover from error";
  if (spec.layout === "legal") return "Read parent-facing section summary -> confirm understanding -> return to parent flow";
  if (spec.layout === "system") return "Understand state -> choose recovery CTA -> retry, go home, or use cached safe content";
  if (spec.layout === "splash") return "Load product identity -> show calm progress -> move into welcome flow";
  return "Understand recommendation -> press " + primary + " -> continue to the next product step";
}

function componentListFor(spec) {
  var components = ["top context label", "main task area", "next-step control", "quality strip"];
  if (spec.layout !== "splash" && spec.layout !== "player") components.push("bottom navigation");
  if (spec.fields) components.push("validated form fields");
  if (spec.choices) components.push("picture-first choice cards");
  if (spec.cards) components.push("summary cards");
  if (spec.items) components.push("scannable list rows");
  if (spec.bullets) components.push("evidence bullet list");
  if (spec.rows) components.push("settings rows and toggles");
  if (spec.sections) components.push("parent-readable content sections");
  if (spec.stats) components.push("progress stat tiles");
  if (spec.layout === "player") components.push("large player controls");
  if (spec.layout === "childActivity") components.push("large child tap targets");
  return components;
}

function stateModelFor(spec) {
  return {
    default: spec.heading || spec.title,
    loading: stateCopy(spec).split("/")[0].trim(),
    empty: spec.layout === "list" ? "No matching safe content, show recovery CTA" : "No optional content, keep primary path visible",
    error: "Clear parent-readable reason with retry or safe exit",
    success: spec.primary || spec.danger || "Recovered",
    disabled: "Disable CTA until required parent-controlled input is valid",
    offline: spec.section === "Stories" || spec.section === "Bedtime" ? "Offer saved stories only" : "Explain connection issue and preserve progress"
  };
}

function interactionFor(spec) {
  if (spec.layout === "childActivity") return "Child taps one large visual choice; parent can repeat or continue; feedback is immediate, gentle, and non-punitive.";
  if (spec.layout === "player") return "Large play, pause, previous, and next controls; buffer state preserves page; parent can exit without losing progress.";
  if (spec.layout === "settings") return "Parent toggles settings, destructive choices open parent gate, saved state is confirmed inline.";
  if (spec.layout === "form") return "Parent inputs are validated inline; submit shows loading; errors keep entered values and explain recovery.";
  if (spec.layout === "chooser") return "One option is selected at a time; selected state is visible with shape and text, not only color.";
  if (spec.layout === "list") return "Filters update list, rows open details, empty results offer reset.";
  return "Next-step control advances one clear step; back and safe exit remain available.";
}

function productFitFor(spec) {
  return "Supports 0-6 story, learning, parent-child, bedtime, or parent-managed growth by keeping child actions visual-first and parent controls explicit.";
}

function enrichPageSpec(spec, index) {
  var copy = {};
  for (var key in spec) copy[key] = spec[key];
  copy.pageId = "FL-" + String(index + 1).padStart(3, "0");
  copy.route = "/" + copy.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  copy.ageBand = ageBandFor(copy);
  copy.businessGoal = copy.businessGoal || "Move the " + copy.audience + " through " + copy.title + " in the " + copy.section + " flow with trust, clarity, and measurable completion.";
  copy.userGoal = copy.userGoal || "Understand " + (copy.heading || copy.title) + " and complete the next safe action without confusion.";
  copy.userPain = copy.userPain || "Parents need fast confidence and children need visual-first guidance with low cognitive load.";
  copy.journey = journeyFor(copy);
  copy.uxFlow = copy.uxFlow || journeyFor(copy);
  copy.taskFlow = copy.taskFlow || taskFor(copy);
  copy.iaRole = copy.iaRole || copy.section + " / " + copy.layout + " / " + copy.audience;
  copy.components = copy.components || componentListFor(copy);
  copy.primaryCTA = copy.primary || copy.danger || (copy.layout === "splash" ? "Auto continue to welcome" : "Return from " + copy.title);
  copy.secondaryCTA = copy.secondary || (copy.layout === "player" ? "Pause or exit" : "Back");
  copy.copywriting = copy.copywriting || [copy.heading || copy.title, copy.subtitle || "", copy.primaryCTA].join(" | ");
  copy.illustration = copy.illustration || (copy.hero || copy.state || copy.title) + " visual, rounded child-safe shapes, no unsafe imagery";
  copy.states = copy.states || stateModelFor(copy);
  copy.interaction = copy.interaction || interactionFor(copy);
  copy.animation = copy.animation || motionCopy(copy);
  copy.accessibility = copy.accessibility || a11yCopy(copy) + ", focus order, reduced-motion fallback, audio alternative where narration exists";
  copy.childSafety = copy.childSafety || "No unsafe imagery; child-facing action stays visual/audio/tap-first; parent gates protect consent, deletion, privacy, and account controls.";
  copy.responsive = copy.responsive || "390x844 mobile frame, safe-area aware, one-hand reachable next-step control, H5 and Android compatible.";
  copy.productFit = copy.productFit || productFitFor(copy);
  copy.acceptanceCriteria = copy.acceptanceCriteria || [
    "Target user understands the next action within 3 seconds",
    "Loading, empty, error, success, disabled, offline, and permission cases have a defined recovery",
    "Child-facing portions do not require reading and use large tap targets",
    "Parent-only controls are not exposed as child tasks"
  ];
  copy.testCases = copy.testCases || [
    copy.pageId + "-happy-path",
    copy.pageId + "-error-recovery",
    copy.pageId + "-accessibility",
    copy.pageId + "-child-safety"
  ];
  return copy;
}

function qualityStrip(f, spec) {
  var y = 704;
  rect(f, 24, y, 342, 46, C.white, 8, C.line);
  text(f, "CTA: " + (spec.primary || "Continue"), 38, y + 8, 10, C.ink, 144, "Medium");
  text(f, "State: " + stateCopy(spec), 188, y + 8, 10, C.muted, 160);
  text(f, "Motion: " + motionCopy(spec), 38, y + 25, 9, C.muted, 146);
  text(f, "A11y: " + a11yCopy(spec), 188, y + 25, 9, C.muted, 160);
}

function art(parent, x, y, w, h, color, label) {
  rect(parent, x, y, w, h, color || C.softBlue, 8, C.line);
  circle(parent, x + 22, y + 22, 58, C.white, C.line);
  circle(parent, x + 42, y + 42, 18, C.honey);
  circle(parent, x + 72, y + 44, 14, C.coral);
  text(parent, label || "Story image", x + 104, y + 32, 18, C.ink, w - 124, "Medium");
}

function headerBlock(parent, spec) {
  text(parent, spec.heading || spec.title, 24, 112, 26, C.ink, 330, "Medium");
  text(parent, spec.subtitle || "", 24, 150, 13, C.muted, 330);
}

function bullets(parent, items, x, y) {
  for (var i = 0; i < (items || []).length; i++) {
    circle(parent, x, y + i * 34 + 3, 10, [C.mint, C.sky, C.honey, C.coral][i % 4]);
    text(parent, items[i], x + 18, y + i * 34, 13, C.ink, 292);
  }
}

function renderSplash(f, spec) {
  rect(f, 0, 0, W, H, spec.bg || C.softBlue);
  circle(f, 135, 180, 120, C.white, C.line);
  text(f, "FutureLight", 82, 330, 36, C.ink, 250, "Medium");
  text(f, spec.subtitle, 72, 382, 16, C.muted, 260);
  rect(f, 126, 690, 138, 8, C.white, 4);
  rect(f, 126, 690, 84, 8, C.honey, 4);
}

function renderForm(f, spec) {
  headerBlock(f, spec);
  for (var i = 0; i < spec.fields.length; i++) field(f, 24, 206 + i * 86, 342, spec.fields[i][0], spec.fields[i][1]);
  if (spec.note) {
    rect(f, 24, 206 + spec.fields.length * 86, 342, 70, C.softBlue, 8, C.line);
    text(f, spec.note, 42, 226 + spec.fields.length * 86, 13, C.muted, 300);
  }
  button(f, 24, 650, 342, spec.primary, spec.accent || C.honey);
  if (spec.secondary) text(f, spec.secondary, 24, 716, 13, C.muted, 342);
}

function renderConsent(f, spec) {
  headerBlock(f, spec);
  bullets(f, spec.bullets, 28, 220);
  rect(f, 24, 420, 342, 120, C.white, 8, C.line);
  text(f, "Parent control", 44, 446, 18, C.ink, 280, "Medium");
  text(f, "You can export, delete, or revoke consent from Parent Center.", 44, 480, 13, C.muted, 285);
  button(f, 24, 618, 342, spec.primary, C.honey);
  text(f, "Required before recommendations use child age or interests.", 24, 690, 12, C.muted, 342);
}

function renderChooser(f, spec) {
  headerBlock(f, spec);
  var y = 218;
  for (var i = 0; i < spec.choices.length; i++) {
    rect(f, 24, y + i * 78, 342, 62, i === spec.selected ? C.softMint : C.white, 8, C.line);
    circle(f, 42, y + i * 78 + 17, 28, [C.mint, C.sky, C.honey, C.lilac][i % 4], C.line);
    text(f, spec.choices[i][0], 84, y + i * 78 + 14, 16, C.ink, 210, "Medium");
    text(f, spec.choices[i][1], 84, y + i * 78 + 38, 11, C.muted, 240);
  }
  button(f, 24, 660, 342, spec.primary, spec.accent || C.honey);
}

function renderHome(f, spec) {
  headerBlock(f, spec);
  art(f, 24, 205, 342, 168, spec.accent || C.softMint, spec.hero || "Today's story");
  button(f, 44, 296, 150, spec.primary || "Start", C.honey);
  var cards = spec.cards || [];
  for (var i = 0; i < cards.length; i++) {
    rect(f, 24 + (i % 2) * 176, 408 + Math.floor(i / 2) * 126, 166, 106, C.white, 8, C.line);
    text(f, cards[i][0], 44 + (i % 2) * 176, 432 + Math.floor(i / 2) * 126, 15, C.ink, 126, "Medium");
    text(f, cards[i][1], 44 + (i % 2) * 176, 462 + Math.floor(i / 2) * 126, 11, C.muted, 126);
  }
}

function renderList(f, spec) {
  headerBlock(f, spec);
  var y = 202;
  if (spec.filters) {
    var x = 24;
    for (var k = 0; k < spec.filters.length; k++) x += pill(f, x, y, spec.filters[k], [C.softMint, C.softBlue, C.softHoney][k % 3]) + 8;
    y += 54;
  }
  for (var i = 0; i < spec.items.length; i++) {
    rect(f, 24, y + i * 104, 342, 88, C.white, 8, C.line);
    circle(f, 42, y + i * 104 + 18, 52, [C.mint, C.sky, C.honey, C.coral][i % 4], C.line);
    text(f, spec.items[i][0], 112, y + i * 104 + 16, 16, C.ink, 190, "Medium");
    text(f, spec.items[i][1], 112, y + i * 104 + 44, 12, C.muted, 210);
  }
}

function renderPlayer(f, spec) {
  rect(f, 0, 0, W, H, spec.dark ? C.night : C.paper);
  var ink = spec.dark ? C.white : C.ink;
  var muted = spec.dark ? { r: 0.78, g: 0.82, b: 0.88 } : C.muted;
  text(f, spec.title, 24, 52, 20, ink, 260, "Medium");
  text(f, spec.subtitle, 24, 86, 13, muted, 300);
  art(f, 24, 140, 342, 360, spec.dark ? { r: 0.23, g: 0.28, b: 0.42 } : spec.accent || C.softBlue, spec.hero);
  rect(f, 44, 535, 302, 8, spec.dark ? { r: 0.38, g: 0.43, b: 0.55 } : C.line, 4);
  rect(f, 44, 535, 138, 8, C.honey, 4);
  circle(f, 78, 590, 58, C.white, C.line);
  circle(f, 166, 575, 88, C.honey, C.line);
  circle(f, 280, 590, 58, C.white, C.line);
  text(f, "Pause", 186, 610, 14, C.ink, 60, "Medium");
  text(f, spec.primary, 24, 695, 15, ink, 342, "Medium");
}

function renderChildActivity(f, spec) {
  headerBlock(f, spec);
  var labels = spec.choices || ["Look", "Tap", "Hear"];
  for (var i = 0; i < labels.length; i++) {
    rect(f, 24 + i * 118, 222, 104, 136, [C.mint, C.sky, C.honey][i % 3], 8, C.line);
    circle(f, 50 + i * 118, 248, 52, C.white, C.line);
    text(f, labels[i], 42 + i * 118, 318, 14, C.ink, 80, "Medium");
  }
  rect(f, 24, 400, 342, 190, C.white, 8, C.line);
  text(f, spec.prompt || "What did you see?", 48, 430, 22, C.ink, 285, "Medium");
  text(f, spec.feedback || "Big visual feedback. No reading required.", 48, 476, 14, C.muted, 285);
  button(f, 48, 524, 128, "Again", C.mint);
  button(f, 190, 524, 128, "Next", C.honey);
}

function renderReport(f, spec) {
  headerBlock(f, spec);
  var stats = spec.stats || [["Stories", "12"], ["Tasks", "5"], ["Streak", "3d"]];
  for (var i = 0; i < stats.length; i++) {
    rect(f, 24 + i * 114, 208, 104, 92, C.white, 8, C.line);
    text(f, stats[i][1], 50 + i * 114, 228, 26, C.ink, 70, "Medium");
    text(f, stats[i][0], 44 + i * 114, 266, 12, C.muted, 70);
  }
  rect(f, 24, 332, 342, 190, C.white, 8, C.line);
  text(f, "Recent signals", 44, 356, 18, C.ink, 250, "Medium");
  bullets(f, spec.bullets, 48, 398);
  button(f, 24, 630, 342, spec.primary || "View details", C.honey);
}

function renderSettings(f, spec) {
  headerBlock(f, spec);
  var y = 206;
  for (var i = 0; i < spec.rows.length; i++) {
    rect(f, 24, y + i * 76, 342, 58, C.white, 8, C.line);
    text(f, spec.rows[i][0], 44, y + i * 76 + 14, 15, C.ink, 220, "Medium");
    text(f, spec.rows[i][1], 44, y + i * 76 + 38, 11, C.muted, 220);
    rect(f, 306, y + i * 76 + 18, 40, 22, i % 2 === 0 ? C.mint : C.line, 11);
    circle(f, i % 2 === 0 ? 324 : 310, y + i * 76 + 21, 16, C.white, C.line);
  }
  if (spec.danger) button(f, 24, 680, 342, spec.danger, C.softCoral);
}

function renderSystem(f, spec) {
  headerBlock(f, spec);
  circle(f, 142, 232, 106, spec.accent || C.sky, C.line);
  text(f, spec.state || "State", 96, 370, 26, C.ink, 200, "Medium");
  text(f, spec.recovery || "Give the parent a clear next action.", 54, 414, 14, C.muted, 280);
  button(f, 54, 520, 282, spec.primary || "Try again", spec.accent || C.honey);
}

function renderLegal(f, spec) {
  headerBlock(f, spec);
  var y = 220;
  for (var i = 0; i < spec.sections.length; i++) {
    text(f, spec.sections[i][0], 24, y, 16, C.ink, 300, "Medium");
    text(f, spec.sections[i][1], 24, y + 28, 12, C.muted, 326);
    y += 92;
  }
  button(f, 24, 700, 342, spec.primary || "Back to Parent Center", C.honey);
}

var pageSpecs = [
  { title: "Splash", section: "First Run / Account", audience: "system", layout: "splash", subtitle: "Stories, growth, and bedtime in one calm place.", bg: C.softBlue },
  { title: "Welcome", section: "First Run / Account", audience: "parent", layout: "home", heading: "Stories fit your child", subtitle: "Quick start, clear age fit, no child account.", hero: "Warm story preview", primary: "Set up my child", cards: [["0-6 age fit", "Recommendations change by age band"], ["Parent guided", "Controls stay with the adult"], ["Bedtime ready", "Low stimulation playback"], ["Daily growth", "Tiny repeatable habits"]] },
  { title: "Value Intro", section: "First Run / Account", audience: "parent", layout: "report", heading: "What FutureLight does", subtitle: "Three product promises before signup.", stats: [["1", "Story"], ["1", "Task"], ["1", "Moment"]], bullets: ["Find an age-safe story", "Play with large visuals and voice", "End with one parent-child prompt"], primary: "Continue" },
  { title: "Login", section: "First Run / Account", audience: "parent", layout: "form", heading: "Welcome back", subtitle: "Parent login controls child data and settings.", fields: [["Email", "parent@example.com"], ["Password", "********"]], primary: "Log in", secondary: "Forgot password / Create account" },
  { title: "Register", section: "First Run / Account", audience: "parent", layout: "form", heading: "Create parent account", subtitle: "Children never create their own accounts.", fields: [["Email", "parent@example.com"], ["Password", "Minimum 8 characters"], ["Region", "US / UK / DE / TW / Other"]], primary: "Create account", secondary: "Already have an account" },
  { title: "Forgot Password", section: "First Run / Account", audience: "parent", layout: "form", heading: "Reset password", subtitle: "Send a secure recovery code to the parent email.", fields: [["Email", "parent@example.com"]], note: "Recovery never exposes child profile data.", primary: "Send code" },
  { title: "Verification Code", section: "First Run / Account", audience: "parent", layout: "form", heading: "Enter verification code", subtitle: "Use the 6-digit code from email.", fields: [["Code", "123 456"], ["New password", "********"]], primary: "Reset password", secondary: "Resend code in 30s" },
  { title: "Privacy Consent", section: "First Run / Account", audience: "parent", layout: "consent", heading: "Parent consent required", subtitle: "We need permission before using age, interests, or learning history.", bullets: ["Child profile stays parent-managed", "No ads or child-directed tracking", "Delete or export data anytime"], primary: "I agree and continue" },
  { title: "Create Child", section: "First Run / Account", audience: "parent", layout: "form", heading: "Create child profile", subtitle: "One profile unlocks age-fit recommendations.", fields: [["Child name", "Mia"], ["Nickname shown in app", "Mimi"], ["Avatar", "Sun / Moon / Star"]], primary: "Next: age" },
  { title: "Child Age", section: "First Run / Account", audience: "parent", layout: "chooser", heading: "How old is your child?", subtitle: "This changes text, choices, pacing, and story length.", choices: [["0-2", "Parent-led, pictures and sound"], ["3-4", "Simple choices and repetition"], ["5-6", "Short words and guided recall"]], selected: 1, primary: "Use this age band" },
  { title: "Child Interests", section: "First Run / Account", audience: "parent child", layout: "chooser", heading: "Pick interests", subtitle: "Pictures first, text second.", choices: [["Animals", "Friendly characters"], ["Vehicles", "Movement and sounds"], ["Bedtime", "Calm stories"], ["Feelings", "Emotion practice"]], selected: 0, primary: "Get recommendations" },
  { title: "Initial AI Recommendation", section: "First Run / Account", audience: "parent", layout: "home", heading: "Start with this story", subtitle: "Recommended for age 3-4 because it uses repeated animal words.", hero: "Little Fox Finds Colors", primary: "Play story", cards: [["Why this", "Short, visual, repeated words"], ["After story", "One parent-child question"], ["Duration", "4 minutes"], ["Skill", "Color recognition"]] },

  { title: "Home", section: "Home / Daily", audience: "parent child", layout: "home", heading: "Good evening, Mia", subtitle: "One clear action first, secondary actions below.", hero: "Tonight's story", primary: "Start story", cards: [["Daily task", "Name 2 feelings"], ["Bedtime", "Dim mode ready"], ["Progress", "3 day streak"], ["Parent tip", "Ask one open question"]] },
  { title: "Today Story", section: "Home / Daily", audience: "parent child", layout: "home", heading: "Today's story", subtitle: "Age-fit story with one clear play path.", hero: "Bear Shares a Blanket", primary: "Play now", cards: [["Age fit", "3-4 years"], ["Words", "warm, share, sleepy"], ["Mode", "Normal / Bedtime"], ["Next", "Emotion question"]] },
  { title: "Today Growth Task", section: "Home / Daily", audience: "parent", layout: "report", heading: "Today's growth task", subtitle: "Small task, clear reason, no pressure.", stats: [["3m", "Time"], ["1", "Prompt"], ["0", "Prep"]], bullets: ["Ask: What made bear happy?", "Let child point or answer", "Mark done only after parent confirms"], primary: "Start task" },
  { title: "Bedtime Entry", section: "Home / Daily", audience: "parent", layout: "home", heading: "Sleep mode", subtitle: "Low contrast, low motion, no surprise sounds.", hero: "Moonlight story shelf", primary: "Start bedtime", cards: [["Voice", "Soft narration"], ["Motion", "Reduced"], ["Timer", "10 min"], ["After", "No autoplay by default"]] },
  { title: "Parent Child Entry", section: "Home / Daily", audience: "parent", layout: "home", heading: "Together time", subtitle: "Shared activity after a story.", hero: "Talk and point together", primary: "Pick activity", cards: [["Conversation", "Open prompt"], ["Movement", "Tiny action"], ["Drawing", "Point and name"], ["Feeling", "Name emotion"]] },
  { title: "Recently Played", section: "Home / Daily", audience: "parent", layout: "list", heading: "Recently played", subtitle: "Resume without making the parent search.", filters: ["Today", "This week"], items: [["Bear Shares a Blanket", "Paused at 2:14"], ["Little Fox Finds Colors", "Completed yesterday"], ["Moon Train", "Bedtime favorite"]] },
  { title: "Favorites", section: "Home / Daily", audience: "parent", layout: "list", heading: "Favorites", subtitle: "Saved stories for fast replay.", filters: ["All", "Bedtime", "Animals"], items: [["Moon Train", "Sleep story"], ["Happy Turtle", "Emotion story"], ["Color Picnic", "Color words"], ["Tiny Boat", "Calm adventure"]] },

  { title: "Story List", section: "Stories", audience: "parent child", layout: "list", heading: "Story library", subtitle: "Browse with parent filters and child-friendly covers.", filters: ["Age 3-4", "Animals", "4-6 min"], items: [["Little Fox Finds Colors", "Color words"], ["Bear Shares a Blanket", "Kindness"], ["Moon Train", "Bedtime"], ["Tiny Boat", "Problem solving"]] },
  { title: "Story Category", section: "Stories", audience: "parent child", layout: "chooser", heading: "Choose a story world", subtitle: "Concrete images before text.", choices: [["Animals", "Fox, bear, turtle"], ["Bedtime", "Moon, stars, quiet"], ["Feelings", "Happy, sad, calm"], ["Daily life", "Brush, share, clean"]], selected: 0, primary: "Show stories" },
  { title: "Story Detail", section: "Stories", audience: "parent", layout: "home", heading: "Little Fox Finds Colors", subtitle: "Preview before child playback.", hero: "Fox and color cards", primary: "Play story", cards: [["Age", "3-4"], ["Duration", "4 min"], ["Skills", "Colors, turn taking"], ["After", "Point to red object"]] },
  { title: "AI Story Recommendation", section: "Stories", audience: "parent", layout: "report", heading: "Why this story?", subtitle: "Explain recommendation instead of black-box AI.", stats: [["3-4", "Age"], ["4m", "Length"], ["Low", "Load"]], bullets: ["Matches animal interest", "Uses 3 repeated color words", "Ends with parent-child prompt"], primary: "Accept recommendation" },
  { title: "Age Matched Stories", section: "Stories", audience: "parent", layout: "list", heading: "Age matched stories", subtitle: "Only show stories that fit this child.", filters: ["3-4", "Short", "Visual"], items: [["Color Picnic", "3 repeated words"], ["Bear Blanket", "Kindness and warmth"], ["Duck Says Hello", "Simple greeting"], ["Sleepy Star", "Bedtime slow pace"]] },
  { title: "Story Search", section: "Stories", audience: "parent", layout: "form", heading: "Search stories", subtitle: "Parent search with age-safe results.", fields: [["Search", "colors, animals, bedtime"], ["Age filter", "3-4 years"], ["Length", "Under 6 minutes"]], primary: "Search" },
  { title: "Story Player", section: "Stories", audience: "child", layout: "player", title: "Little Fox Finds Colors", subtitle: "Story page 2 of 8 with clear visual focus.", hero: "Fox holds a red apple", primary: "Large controls, no reading required.", accent: C.softHoney },
  { title: "Story Paused", section: "Stories", audience: "child", layout: "player", title: "Paused", subtitle: "Parent can resume or exit.", hero: "Story image dimmed", primary: "Resume / Restart / Exit to parent", accent: C.softBlue },
  { title: "Story Complete", section: "Stories", audience: "child", layout: "childActivity", heading: "All done", subtitle: "Immediate positive feedback.", prompt: "You listened to the whole story.", feedback: "Reward is visual and gentle, not addictive.", choices: ["Star", "Smile", "Next"] },
  { title: "Next Story", section: "Stories", audience: "parent child", layout: "home", heading: "Next recommended", subtitle: "One next option, not endless autoplay.", hero: "Bear Shares a Blanket", primary: "Play next", cards: [["Reason", "Same skill, new setting"], ["Parent choice", "Skip allowed"], ["Autoplay", "Off by default"], ["Bedtime", "Stop after one"]] },
  { title: "Favorite Saved", section: "Stories", audience: "parent child", layout: "system", heading: "Saved", subtitle: "Story added to favorites.", state: "Favorite saved", recovery: "Find it later from Home or Favorites.", primary: "Back to story", accent: C.mint },
  { title: "No Stories Empty", section: "Stories", audience: "system", layout: "system", heading: "No stories found", subtitle: "Empty state with recovery.", state: "No matching stories", recovery: "Clear filters or choose a broader age range.", primary: "Clear filters", accent: C.sky },

  { title: "Daily Tasks", section: "Growth / Interaction", audience: "parent", layout: "list", heading: "Daily tasks", subtitle: "Short, parent-confirmed growth activities.", filters: ["3 min", "Parent-led"], items: [["Name one feeling", "Emotion recognition"], ["Find something red", "Color recall"], ["Say thank you", "Social habit"], ["Choose bedtime item", "Routine practice"]] },
  { title: "Task Detail", section: "Growth / Interaction", audience: "parent", layout: "report", heading: "Name one feeling", subtitle: "Parent guide before starting.", stats: [["2m", "Time"], ["0", "Prep"], ["1", "Question"]], bullets: ["Show two face cards", "Ask: Which face is sleepy?", "Accept pointing, gesture, or speech"], primary: "Start with child" },
  { title: "Task Complete", section: "Growth / Interaction", audience: "parent child", layout: "childActivity", heading: "Task complete", subtitle: "Child sees reward; parent sees next tip.", prompt: "You found the sleepy face.", feedback: "Parent can mark note after child leaves.", choices: ["Star", "Again", "Done"] },
  { title: "Parent Child Interaction", section: "Growth / Interaction", audience: "parent child", layout: "home", heading: "Talk together", subtitle: "A shared moment after the story.", hero: "Parent and child prompt", primary: "Start prompt", cards: [["Ask", "What did fox find?"], ["Point", "Choose a color"], ["Repeat", "Say it together"], ["Done", "Save moment"]] },
  { title: "Parent Prompt Guide", section: "Growth / Interaction", audience: "parent", layout: "legal", heading: "Prompt guide", subtitle: "Make the parent confident in 10 seconds.", sections: [["Say this", "What color did fox find first?"], ["If child points", "Accept pointing as a correct response."], ["If child is tired", "Stop and save for tomorrow."]], primary: "Start prompt" },
  { title: "Post Story Q&A", section: "Growth / Interaction", audience: "child", layout: "childActivity", heading: "What did fox see?", subtitle: "Picture choices, no reading.", prompt: "Tap the red thing.", feedback: "Use color, shape, and voice feedback.", choices: ["Apple", "Moon", "Boat"] },
  { title: "Emotion Activity", section: "Growth / Interaction", audience: "child", layout: "childActivity", heading: "How does bear feel?", subtitle: "Large face cards.", prompt: "Tap sleepy bear.", feedback: "Accept selection with gentle confirmation.", choices: ["Happy", "Sleepy", "Sad"] },
  { title: "Habit Activity", section: "Growth / Interaction", audience: "child", layout: "childActivity", heading: "Bedtime order", subtitle: "Concrete routine sequence.", prompt: "What comes before sleep?", feedback: "Brush, story, sleep. One step at a time.", choices: ["Brush", "Run", "Snack"] },
  { title: "Language Practice", section: "Growth / Interaction", audience: "child", layout: "childActivity", heading: "Say red", subtitle: "Voice optional, parent can assist.", prompt: "Listen, then say or tap.", feedback: "No penalty for silence.", choices: ["Listen", "Say", "Tap"] },
  { title: "Focus Task", section: "Growth / Interaction", audience: "child", layout: "childActivity", heading: "Find the star", subtitle: "Short attention task.", prompt: "Tap the star.", feedback: "One target, no clutter.", choices: ["Star", "Cloud", "Moon"] },

  { title: "Bedtime Home", section: "Bedtime", audience: "parent child", layout: "home", heading: "Bedtime mode", subtitle: "Dim visuals, slow transitions, no autoplay chain.", hero: "Moon shelf", primary: "Start calm story", cards: [["Brightness", "Dim"], ["Sound", "Soft"], ["Motion", "Reduced"], ["Stop", "After one story"]] },
  { title: "Bedtime Recommendation", section: "Bedtime", audience: "parent", layout: "list", heading: "Bedtime stories", subtitle: "Only low-stimulation choices.", filters: ["Calm", "Under 8 min", "No quiz"], items: [["Sleepy Star", "Soft voice"], ["Moon Train", "Slow pace"], ["Blanket Bear", "Warm ending"]] },
  { title: "White Noise", section: "Bedtime", audience: "parent", layout: "settings", heading: "Background sound", subtitle: "Parent controls volume and timer.", rows: [["Rain", "Soft loop, 15 min"], ["Ocean", "Low bass, 20 min"], ["Auto stop", "End after story"], ["Remember setting", "This child only"]] },
  { title: "Bedtime Player", section: "Bedtime", audience: "child", layout: "player", dark: true, title: "Sleepy Star", subtitle: "Dim mode active", hero: "Star floats slowly", primary: "Soft controls and reduced motion." },
  { title: "Bedtime Complete", section: "Bedtime", audience: "child", layout: "system", heading: "Good night", subtitle: "No more recommendations shown to child.", state: "Story ended", recovery: "Screen stays calm. Parent can exit.", primary: "Done", accent: C.lilac },
  { title: "Tomorrow Recommendation", section: "Bedtime", audience: "parent", layout: "home", heading: "Tomorrow idea", subtitle: "Parent sees preview after bedtime flow.", hero: "Morning story preview", primary: "Save for tomorrow", cards: [["Skill", "Feelings"], ["Length", "5 min"], ["Why", "Builds on tonight"], ["Reminder", "Optional"]] },

  { title: "Child Profile", section: "Child Profile / Progress", audience: "parent", layout: "report", heading: "Mia profile", subtitle: "Parent-managed child data.", stats: [["3-4", "Age"], ["12", "Stories"], ["5", "Tasks"]], bullets: ["Interests: animals, bedtime", "Variant: American English", "Consent active"], primary: "Edit profile" },
  { title: "Edit Child", section: "Child Profile / Progress", audience: "parent", layout: "form", heading: "Edit child profile", subtitle: "Changes affect recommendations.", fields: [["Display name", "Mia"], ["Avatar", "Sun"], ["Interests", "Animals, bedtime"]], primary: "Save changes" },
  { title: "Update Age", section: "Child Profile / Progress", audience: "parent", layout: "chooser", heading: "Update age band", subtitle: "Age changes content complexity.", choices: [["0-2", "Parent-led only"], ["3-4", "Picture choices"], ["5-6", "Short recall prompts"]], selected: 1, primary: "Update age" },
  { title: "Growth Report", section: "Child Profile / Progress", audience: "parent", layout: "report", heading: "Growth report", subtitle: "Signals, not grades.", stats: [["18", "Minutes"], ["4", "Skills"], ["3", "Days"]], bullets: ["Color recall improved", "Bedtime completion stable", "Emotion prompts need repetition"], primary: "View history" },
  { title: "Story History", section: "Child Profile / Progress", audience: "parent", layout: "list", heading: "Story history", subtitle: "Playback records for parent review.", filters: ["This week", "Completed"], items: [["Little Fox Finds Colors", "Completed 2 times"], ["Moon Train", "Bedtime, 3 times"], ["Bear Blanket", "Paused once"]] },
  { title: "Task History", section: "Child Profile / Progress", audience: "parent", layout: "list", heading: "Task history", subtitle: "Parent-confirmed tasks only.", filters: ["Done", "Skipped"], items: [["Name one feeling", "Done today"], ["Find something red", "Done yesterday"], ["Bedtime order", "Skipped"]] },
  { title: "Interest Preferences", section: "Child Profile / Progress", audience: "parent", layout: "chooser", heading: "Interests", subtitle: "Tune recommendations without overwhelming child.", choices: [["Animals", "High interest"], ["Vehicles", "Medium interest"], ["Feelings", "Learning priority"], ["Bedtime", "Evening only"]], selected: 0, primary: "Save interests" },

  { title: "Parent Center", section: "Parent Center", audience: "parent", layout: "home", heading: "Parent Center", subtitle: "Settings, privacy, reports, and child controls.", hero: "Parent dashboard", primary: "Review child progress", cards: [["Children", "2 profiles"], ["Privacy", "Consent active"], ["Limits", "20 min/day"], ["Support", "1 open request"]] },
  { title: "Content Management", section: "Parent Center", audience: "parent", layout: "settings", heading: "Content controls", subtitle: "Control what child can access.", rows: [["Bedtime only after 8pm", "Enabled"], ["Hide scary stories", "Always enabled"], ["Allow replay", "Enabled"], ["Require parent for search", "Enabled"]] },
  { title: "Play Time Limit", section: "Parent Center", audience: "parent", layout: "settings", heading: "Play time limit", subtitle: "Protect attention and sleep.", rows: [["Daily limit", "20 minutes"], ["Bedtime cutoff", "8:30 PM"], ["Break reminder", "Every 10 minutes"], ["Parent override", "Password required"]] },
  { title: "Age Rating Settings", section: "Parent Center", audience: "parent", layout: "chooser", heading: "Age level", subtitle: "Choose maximum content complexity.", choices: [["2 years", "Pictures and sound"], ["3-4 years", "Simple choices"], ["5-6 years", "Short text optional"]], selected: 1, primary: "Save age level" },
  { title: "Recommendation Settings", section: "Parent Center", audience: "parent", layout: "settings", heading: "Recommendations", subtitle: "Transparent controls for AI suggestions.", rows: [["Use story history", "Enabled"], ["Use interests", "Enabled"], ["Autoplay next", "Disabled"], ["Explain why", "Always show"]] },
  { title: "Switch Child", section: "Parent Center", audience: "parent", layout: "chooser", heading: "Switch child", subtitle: "Profiles stay separated.", choices: [["Mia", "Age 3-4, animals"], ["Leo", "Age 5-6, vehicles"]], selected: 0, primary: "Use selected child" },
  { title: "Notification Settings", section: "Parent Center", audience: "parent", layout: "settings", heading: "Notifications", subtitle: "Parent-facing reminders only.", rows: [["Daily task reminder", "6:30 PM"], ["Weekly report", "Sunday"], ["Product tips", "Off"], ["Support replies", "On"]] },
  { title: "Privacy Settings", section: "Parent Center", audience: "parent", layout: "settings", heading: "Privacy", subtitle: "Export, consent, and deletion controls.", rows: [["Parental consent", "Granted"], ["Data export", "Available"], ["Delete child profile", "Parent gate"], ["Personalization", "Enabled"]], danger: "Delete child data" },
  { title: "Account Settings", section: "Parent Center", audience: "parent", layout: "settings", heading: "Account", subtitle: "Adult account controls.", rows: [["Email", "parent@example.com"], ["Password", "Change"], ["Region", "US"], ["Delete account", "Parent gate"]], danger: "Delete parent account" },

  { title: "Loading", section: "System States", audience: "system", layout: "system", heading: "Loading story", subtitle: "Keep orientation while content loads.", state: "Preparing story", recovery: "Skeleton blocks reserve final layout.", primary: "Loading...", accent: C.sky },
  { title: "Skeleton Loading", section: "System States", audience: "system", layout: "system", heading: "Loading content", subtitle: "Avoid layout shift.", state: "Skeleton state", recovery: "Cards match final content size.", primary: "Wait", accent: C.line },
  { title: "Network Error", section: "System States", audience: "system", layout: "system", heading: "Connection problem", subtitle: "Do not blame the parent.", state: "Offline or unstable", recovery: "Retry, use cached favorites, or go home.", primary: "Try again", accent: C.coral },
  { title: "Permission Denied", section: "System States", audience: "system", layout: "system", heading: "Parent action needed", subtitle: "Permission issue with next step.", state: "Access blocked", recovery: "Ask parent to sign in or grant consent.", primary: "Go to Parent Center", accent: C.honey },
  { title: "Not Found", section: "System States", audience: "system", layout: "system", heading: "Content not found", subtitle: "The story may be unavailable.", state: "Missing story", recovery: "Return to library with safe fallback.", primary: "Back to stories", accent: C.sky },
  { title: "Server Error", section: "System States", audience: "system", layout: "system", heading: "Something failed", subtitle: "Clear recovery path.", state: "Service error", recovery: "Retry and preserve child progress locally.", primary: "Retry", accent: C.coral },
  { title: "Offline Mode", section: "System States", audience: "system", layout: "system", heading: "Offline mode", subtitle: "Use downloaded favorites only.", state: "Offline", recovery: "Show what still works.", primary: "Open saved stories", accent: C.mint },
  { title: "Update Prompt", section: "System States", audience: "system", layout: "system", heading: "Update available", subtitle: "Parent sees update message.", state: "Update ready", recovery: "Child flow is not interrupted mid-story.", primary: "Update later", accent: C.lilac },

  { title: "Help Center", section: "Support / Legal", audience: "parent", layout: "list", heading: "Help Center", subtitle: "Parent support entry.", filters: ["Account", "Privacy", "Stories"], items: [["Reset password", "Account help"], ["Manage consent", "Privacy help"], ["Story unavailable", "Content help"], ["Contact support", "Send a request"]] },
  { title: "FAQ", section: "Support / Legal", audience: "parent", layout: "legal", heading: "Parent FAQ", subtitle: "Short parent answers.", sections: [["Can my child log in?", "No. Children use parent-managed profiles."], ["Do you use ads?", "No child-directed ads or ad tracking."], ["Can I delete data?", "Yes, from Privacy Settings."]], primary: "Contact support" },
  { title: "Contact Support", section: "Support / Legal", audience: "parent", layout: "form", heading: "Contact support", subtitle: "Structured support request.", fields: [["Topic", "Privacy / Story / Account"], ["Message", "Describe the issue"], ["Reply email", "parent@example.com"]], primary: "Send request" },
  { title: "Terms", section: "Support / Legal", audience: "legal", layout: "legal", heading: "Terms of use", subtitle: "Parent-readable legal page.", sections: [["Use of service", "Parent account controls access."], ["Content", "Stories are educational support, not therapy."], ["Account duties", "Parent keeps credentials secure."]], primary: "I understand" },
  { title: "Privacy Policy", section: "Support / Legal", audience: "legal", layout: "legal", heading: "Privacy Policy", subtitle: "Readable privacy summary.", sections: [["Data collected", "Parent account, child profile, learning progress."], ["Purpose", "Age-fit stories, progress, consent, support."], ["Controls", "Export, revoke, delete."]], primary: "Back to privacy" },
  { title: "Child Data Protection", section: "Support / Legal", audience: "legal", layout: "legal", heading: "Child data protection", subtitle: "Explain child safeguards.", sections: [["Parent managed", "Children do not create independent accounts."], ["Minimized data", "Only age band, interests, and learning signals needed."], ["No selling", "No sale of child data."]], primary: "Back" },
  { title: "Delete Account", section: "Support / Legal", audience: "parent", layout: "settings", heading: "Delete account", subtitle: "Destructive action behind parent gate.", rows: [["Export first", "Recommended"], ["Delete children", "Permanent"], ["Delete account", "Permanent"], ["Confirm password", "Required"]], danger: "Permanently delete" },
  { title: "Export Data", section: "Support / Legal", audience: "parent", layout: "report", heading: "Export data", subtitle: "Parent receives a downloadable package.", stats: [["JSON", "Format"], ["24h", "Ready"], ["All", "Profiles"]], bullets: ["Parent account summary", "Child profile and progress", "Consent and support records"], primary: "Request export" }
];

pageSpecs = pageSpecs.map(enrichPageSpec);

function renderFrame(spec, index) {
  var f = figma.createFrame();
  f.name = (index + 1).toString().padStart(2, "0") + " - " + spec.title;
  f.resize(W, H);
  f.fills = fill(spec.dark ? C.night : C.paper);
  if (spec.layout !== "splash" && spec.layout !== "player") top(f, spec);
  if (spec.layout === "splash") renderSplash(f, spec);
  else if (spec.layout === "form") renderForm(f, spec);
  else if (spec.layout === "consent") renderConsent(f, spec);
  else if (spec.layout === "chooser") renderChooser(f, spec);
  else if (spec.layout === "home") renderHome(f, spec);
  else if (spec.layout === "list") renderList(f, spec);
  else if (spec.layout === "player") renderPlayer(f, spec);
  else if (spec.layout === "childActivity") renderChildActivity(f, spec);
  else if (spec.layout === "report") renderReport(f, spec);
  else if (spec.layout === "settings") renderSettings(f, spec);
  else if (spec.layout === "legal") renderLegal(f, spec);
  else renderSystem(f, spec);
  if (spec.layout !== "splash") qualityStrip(f, spec);
  if (spec.layout !== "splash" && spec.layout !== "player") bottom(f, spec.nav || "Home");
  text(f, spec.section, 24, 92, 11, C.muted, 240, "Medium");
  return f;
}

function makeSitemap(page) {
  text(page, "FutureLight Sitemap", 0, 0, 36, C.ink, 520, "Medium");
  text(page, "Single free-plan canvas. Each mobile frame has specific content, controls, and states.", 0, 54, 16, C.muted, 760);
  var y = 120;
  var current = "";
  for (var i = 0; i < pageSpecs.length; i++) {
    if (pageSpecs[i].section !== current) {
      current = pageSpecs[i].section;
      text(page, current, 0, y, 22, C.ink, 420, "Medium");
      y += 36;
    }
    rect(page, 0, y - 4, 700, 30, i % 2 === 0 ? C.softBlue : C.softMint, 6, C.line);
    text(page, (i + 1) + ". " + pageSpecs[i].title + " - " + pageSpecs[i].layout, 14, y, 13, C.ink, 460);
    text(page, pageSpecs[i].audience, 560, y, 12, C.muted, 120, "Medium");
    y += 38;
  }
}

function makeComponents(page) {
  var x = 780;
  text(page, "Design Tokens", x, 0, 32, C.ink, 340, "Medium");
  var sw = [["Mint", C.mint], ["Sky", C.sky], ["Honey", C.honey], ["Coral", C.coral], ["Lilac", C.lilac], ["Night", C.night]];
  for (var i = 0; i < sw.length; i++) {
    rect(page, x + (i % 3) * 118, 74 + Math.floor(i / 3) * 112, 94, 70, sw[i][1], 8, C.line);
    text(page, sw[i][0], x + (i % 3) * 118, 154 + Math.floor(i / 3) * 112, 13, C.ink, 90, "Medium");
  }
  text(page, "Renderer Types", x, 330, 24, C.ink, 320, "Medium");
  bullets(page, ["form", "chooser", "home", "list", "player", "childActivity", "report", "settings", "system", "legal"], x + 6, 376);
}

async function main() {
  try {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    var page = figma.currentPage;
    page.name = "FutureLight - Designed Screens";
    while (page.children.length > 0) page.children[0].remove();
    makeSitemap(page);
    makeComponents(page);
    var previewNodes = [];
    for (var i = 0; i < pageSpecs.length; i++) {
      var frame = renderFrame(pageSpecs[i], i);
      frame.x = (i % COLS) * (W + GAP);
      frame.y = 1280 + Math.floor(i / COLS) * (H + GAP);
      page.appendChild(frame);
      if (i < 4) previewNodes.push(frame);
    }
    figma.viewport.scrollAndZoomIntoView(previewNodes);
    figma.notify("FutureLight regenerated with page-specific content: " + pageSpecs.length + " screens.");
    figma.closePlugin();
  } catch (err) {
    figma.notify("FutureLight generator failed: " + err.message);
    figma.closePlugin();
  }
}

main();
