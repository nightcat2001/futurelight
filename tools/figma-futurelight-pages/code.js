var W = 390;
var H = 844;
var GAP = 72;
var COLS = 4;

var C = {
  ink: { r: 0.08, g: 0.09, b: 0.11 },
  muted: { r: 0.36, g: 0.40, b: 0.46 },
  line: { r: 0.84, g: 0.87, b: 0.90 },
  paper: { r: 0.98, g: 0.98, b: 0.95 },
  white: { r: 1, g: 1, b: 1 },
  mint: { r: 0.62, g: 0.84, b: 0.70 },
  sky: { r: 0.54, g: 0.72, b: 0.92 },
  honey: { r: 0.96, g: 0.75, b: 0.30 },
  coral: { r: 0.91, g: 0.45, b: 0.38 },
  lilac: { r: 0.66, g: 0.60, b: 0.86 },
  night: { r: 0.10, g: 0.12, b: 0.20 },
  dim: { r: 0.18, g: 0.20, b: 0.31 },
  softBlue: { r: 0.90, g: 0.96, b: 1 },
  softMint: { r: 0.91, g: 0.98, b: 0.92 },
  softHoney: { r: 1, g: 0.95, b: 0.80 },
  softCoral: { r: 1, g: 0.90, b: 0.86 },
  softLilac: { r: 0.93, g: 0.91, b: 1 }
};

function fill(color) { return [{ type: "SOLID", color: color }]; }

function rect(parent, x, y, w, h, color, radius, stroke) {
  var n = figma.createRectangle();
  n.x = x; n.y = y; n.resize(w, h);
  n.fills = fill(color);
  n.cornerRadius = radius || 0;
  if (stroke) { n.strokes = fill(stroke); n.strokeWeight = 1; }
  parent.appendChild(n);
  return n;
}

function circle(parent, x, y, d, color, stroke) {
  var n = figma.createEllipse();
  n.x = x; n.y = y; n.resize(d, d);
  n.fills = fill(color);
  if (stroke) { n.strokes = fill(stroke); n.strokeWeight = 1; }
  parent.appendChild(n);
  return n;
}

function text(parent, value, x, y, size, color, width, weight) {
  var n = figma.createText();
  n.characters = value || "";
  n.x = x; n.y = y; n.fontSize = size;
  n.fontName = { family: "Inter", style: weight || "Regular" };
  n.fills = fill(color || C.ink);
  n.resize(width || 300, size * 1.45);
  n.textAutoResize = "HEIGHT";
  parent.appendChild(n);
  return n;
}

function button(parent, x, y, w, label, color) {
  rect(parent, x, y, w, 54, color || C.honey, 12);
  text(parent, label, x + 18, y + 17, 15, C.ink, w - 36, "Medium");
}

function chip(parent, x, y, label, color) {
  var w = Math.max(64, label.length * 7 + 24);
  rect(parent, x, y, w, 28, color || C.softBlue, 14, C.line);
  text(parent, label, x + 12, y + 8, 10, C.ink, w - 24, "Medium");
  return w;
}

function phoneFrame(name) {
  var f = figma.createFrame();
  f.name = name;
  f.resize(W, H);
  f.fills = fill(C.paper);
  return f;
}

function parentTop(f, title, childName) {
  rect(f, 0, 0, W, 88, C.white, 0, C.line);
  circle(f, 22, 42, 32, C.mint, C.line);
  text(f, title, 70, 39, 18, C.ink, 205, "Medium");
  rect(f, 292, 38, 74, 28, C.softHoney, 14, C.line);
  text(f, childName || "Parent", 306, 47, 10, C.ink, 52, "Medium");
}

function bottomNav(f, active) {
  rect(f, 0, 764, W, 80, C.white, 0, C.line);
  var items = [["Home", "Home"], ["Story", "Stories"], ["Task", "Tasks"], ["Parent", "Parent"]];
  for (var i = 0; i < items.length; i++) {
    var x = 32 + i * 96;
    circle(f, x, 780, 30, items[i][0] === active ? C.mint : C.paper, C.line);
    text(f, items[i][0], x - 9, 816, 10, C.muted, 58, "Medium");
  }
}

function safetyFooter(f, copy) {
  rect(f, 24, 716, 342, 34, C.white, 8, C.line);
  text(f, copy, 38, 729, 9, C.muted, 312, "Medium");
}

function storyScene(f, x, y, w, h, night) {
  rect(f, x, y, w, h, night ? C.dim : C.softBlue, 18, C.line);
  circle(f, x + 36, y + 38, 72, night ? C.lilac : C.honey, C.line);
  rect(f, x + 98, y + 92, 118, 90, night ? C.night : C.softMint, 16, C.line);
  circle(f, x + 238, y + 74, 78, night ? C.softLilac : C.mint, C.line);
  text(f, night ? "slow moon scene" : "illustrated story scene", x + 32, y + h - 42, 16, night ? C.white : C.ink, w - 64, "Medium");
}

var pageSpecs = [
  {
    pageId: "FL-HF-01", title: "First Launch", route: "/first-launch", section: "Core 12", audience: "parent", ageBand: "parent or caregiver",
    businessGoal: "Convert first open into trusted child setup without overwhelming the parent.",
    userGoal: "Understand the app in 3 seconds and start child setup.",
    userPain: "Parent does not trust vague child apps or unclear AI promises.",
    journey: "download -> first launch -> parent setup", uxFlow: "open app -> read value -> see privacy reassurance -> set up child", taskFlow: "parent reads one promise, checks trust strip, taps setup",
    iaRole: "entry point", layout: "first-launch-immersive", layoutFamily: "first-run product orientation", visualDesignLevel: "high-fidelity-ui", actualUIScreen: "immersive welcome with product art, trust strip, and setup CTA",
    navigationModel: "no bottom nav; single forward setup path", appChrome: "brand top mark and parent trust strip", components: ["brand mark", "immersive story art", "trust strip", "setup CTA", "privacy note"],
    componentTree: ["Frame", "BrandHeader", "StoryWorldHero", "TrustStrip", "PrimaryCTA", "PrivacyNote"], primaryCTA: "Set up my child", secondaryCTA: "I already have an account",
    copywriting: "Stories, growth, and bedtime for ages 0-6. Parent managed. No child account.",
    illustration: "warm parent-child story world with friendly book, moon, and animal shapes", states: { default: "welcome", loading: "brand splash", empty: "not applicable: entry screen", error: "retry app initialization", success: "go to login or child setup", disabled: "setup disabled while booting", offline: "offline message with saved mode unavailable" },
    interaction: "Parent presses setup or login; no child-facing interaction yet.", animation: "book opens with 180ms fade; reduced-motion uses static art.", accessibility: "large target, contrast, non-color cues, focus order, reduced-motion fallback, audio alternative not required.",
    responsive: "H5 and Android safe-area layout with reachable setup button.", childSafety: "No child account, no ads, no unsafe imagery.", productFit: "0-6 parent-managed story and growth product.",
    visualHierarchy: "hero art first, setup CTA second, trust proof third", roleSeparation: "parent reads and decides; child is not addressed directly.", designReviewEvidence: "Core screen spec requires professional UI review before expansion.",
    acceptanceCriteria: ["Parent can identify next action in 3 seconds", "Privacy reassurance visible", "No child login path"], testCases: ["FL-HF-01-happy", "FL-HF-01-a11y", "FL-HF-01-offline"]
  },
  {
    pageId: "FL-HF-02", title: "Parent Login", route: "/login", section: "Core 12", audience: "parent", ageBand: "parent or caregiver",
    businessGoal: "Authenticate the adult account that owns consent and child data.",
    userGoal: "Log in or recover access without child data exposure.",
    userPain: "Parent needs security and recovery clarity.", journey: "first launch -> parent login -> child profile", uxFlow: "enter credentials -> validate -> recover or continue", taskFlow: "input email and password, submit, handle loading or field errors",
    iaRole: "auth gateway", layout: "secure-parent-form", layoutFamily: "parent authentication", visualDesignLevel: "high-fidelity-ui", actualUIScreen: "secure login form with recovery and privacy explanation",
    navigationModel: "back to welcome, forward to child profile", appChrome: "minimal auth header", components: ["auth header", "email field", "password field", "security note", "login CTA", "recovery link"],
    componentTree: ["Frame", "AuthHeader", "FormStack", "InlineValidation", "PrimaryCTA", "RecoveryLink"], primaryCTA: "Log in", secondaryCTA: "Forgot password",
    copywriting: "Parent login controls child profiles, consent, privacy, and progress.",
    illustration: "small lock and parent profile symbol, not a child illustration", states: { default: "empty form", loading: "logging in", empty: "missing required fields", error: "invalid credentials", success: "open active child profile", disabled: "button disabled until valid fields", offline: "network unavailable, retry" },
    interaction: "Parent inputs credentials; fields validate inline; recovery stays available.", animation: "field error slides 120ms; reduced-motion shows instant text.", accessibility: "large targets, labels, contrast, non-color cues, focus order, reduced-motion fallback, audio alternative not required.",
    responsive: "Keyboard-safe H5 and Android layout.", childSafety: "Child cannot log in or recover parent account.", productFit: "Parent-managed 0-6 product security boundary.",
    visualHierarchy: "form first, recovery second, privacy note third", roleSeparation: "adult-only controls; no child task.", designReviewEvidence: "Core auth screen requires security and UX review.",
    acceptanceCriteria: ["Invalid login preserves email", "Recovery link visible", "Child data hidden before auth"], testCases: ["FL-HF-02-invalid", "FL-HF-02-success", "FL-HF-02-offline"]
  },
  {
    pageId: "FL-HF-03", title: "Create Child", route: "/children/new", section: "Core 12", audience: "parent", ageBand: "parent or caregiver",
    businessGoal: "Create the child profile needed for safe recommendations.",
    userGoal: "Set up a child profile quickly while understanding parent ownership.",
    userPain: "Parent worries child data setup is too much or unsafe.", journey: "login -> create child -> age selection", uxFlow: "enter name -> choose avatar -> preview profile -> continue", taskFlow: "fill child nickname, choose avatar, review preview, tap continue",
    iaRole: "profile setup", layout: "profile-builder", layoutFamily: "parent setup form", visualDesignLevel: "high-fidelity-ui", actualUIScreen: "profile preview plus parent-controlled fields",
    navigationModel: "back to login, forward to age", appChrome: "parent setup top bar", components: ["profile preview", "nickname field", "avatar selector", "parent ownership note", "continue CTA"],
    componentTree: ["Frame", "SetupHeader", "ProfilePreviewCard", "FieldGroup", "AvatarPicker", "OwnershipNote", "PrimaryCTA"], primaryCTA: "Continue to age", secondaryCTA: "Skip avatar",
    copywriting: "Children use parent-managed profiles. The child never creates an account.",
    illustration: "safe avatar choices: sun, moon, star, leaf", states: { default: "blank profile", loading: "saving child", empty: "missing nickname", error: "save failed", success: "profile created", disabled: "CTA disabled until nickname valid", offline: "profile saved locally pending sync" },
    interaction: "Parent edits fields and sees profile preview update.", animation: "avatar selection uses soft scale feedback; reduced-motion uses border change.", accessibility: "large targets, labels, contrast, non-color cues, focus order, reduced-motion fallback, audio alternative not required.",
    responsive: "Form remains visible above keyboard on H5 and Android.", childSafety: "No independent child identity, no public profile.", productFit: "Parent-managed personalization for 0-6 recommendations.",
    visualHierarchy: "profile preview, fields, parent note, CTA", roleSeparation: "parent enters data; child only later sees avatar.", designReviewEvidence: "Core setup screen requires child privacy review.",
    acceptanceCriteria: ["Child cannot create account", "Avatar has non-color selected state", "Offline save has recovery"], testCases: ["FL-HF-03-create", "FL-HF-03-empty", "FL-HF-03-offline"]
  },
  {
    pageId: "FL-HF-04", title: "Age Selection", route: "/children/age", section: "Core 12", audience: "parent", ageBand: "parent or caregiver",
    businessGoal: "Collect age band to adjust content complexity and UI.",
    userGoal: "Choose the correct age band and understand the design impact.",
    userPain: "Parent needs assurance that a 2-year-old and 6-year-old get different experiences.", journey: "create child -> choose age -> recommendation", uxFlow: "compare age bands -> select one -> confirm", taskFlow: "read age cards, select age, review effects, continue",
    iaRole: "developmental decision", layout: "age-band-panels", layoutFamily: "age-band decision", visualDesignLevel: "high-fidelity-ui", actualUIScreen: "three distinct developmental cards with selected state",
    navigationModel: "back to profile, forward to recommendation", appChrome: "setup progress indicator", components: ["progress stepper", "0-2 card", "3-4 card", "5-6 card", "effects summary", "confirm CTA"],
    componentTree: ["Frame", "ProgressHeader", "AgeBandGrid", "SelectedState", "ImpactSummary", "PrimaryCTA"], primaryCTA: "Use this age band", secondaryCTA: "Back",
    copywriting: "Age changes story length, reading load, choices, and pacing.",
    illustration: "three developmental panels: picture-only, picture choices, short recall", states: { default: "no age selected", loading: "saving age", empty: "age required", error: "save failed", success: "age saved", disabled: "CTA disabled until selected", offline: "age stored locally pending sync" },
    interaction: "Parent selects one age band; selected card changes shape, text, and border.", animation: "selected card lifts 120ms; reduced-motion uses static highlight.", accessibility: "large targets, labels, contrast, non-color cues, focus order, reduced-motion fallback, audio alternative not required.",
    responsive: "Cards stack on short screens and remain thumb reachable.", childSafety: "Age rules prevent reading-heavy UI for toddlers.", productFit: "Developmentally appropriate 0-6 product behavior.",
    visualHierarchy: "age cards first, impact summary second, CTA third", roleSeparation: "parent chooses age; child is not asked to self-classify.", designReviewEvidence: "Core developmental decision requires child education review.",
    acceptanceCriteria: ["0-2 states no reading", "Selected age has non-color cue", "Recommendation receives age band"], testCases: ["FL-HF-04-select", "FL-HF-04-disabled", "FL-HF-04-a11y"]
  },
  {
    pageId: "FL-HF-05", title: "AI Story Recommendation", route: "/recommendation", section: "Core 12", audience: "parent", ageBand: "parent or caregiver",
    businessGoal: "Build trust in the first AI story choice.",
    userGoal: "See why this story fits the child and decide to play.",
    userPain: "Parent distrusts unexplained AI recommendations.", journey: "age selection -> recommendation -> player", uxFlow: "review story -> read reasons -> choose play or change", taskFlow: "scan cover, read age-fit reasons, tap play",
    iaRole: "recommendation explanation", layout: "trustworthy-recommendation", layoutFamily: "recommendation explanation", visualDesignLevel: "high-fidelity-ui", actualUIScreen: "story cover, reason panel, learning tags, parent controls",
    navigationModel: "back to age, forward to player, alternate story path", appChrome: "parent top bar with child context", components: ["story cover", "age fit reason", "learning tags", "duration", "play CTA", "change story"],
    componentTree: ["Frame", "ParentTopBar", "StoryCover", "ReasonPanel", "LearningTags", "DurationBadge", "PrimaryCTA", "SecondaryAction"], primaryCTA: "Play story", secondaryCTA: "Choose another",
    copywriting: "Recommended because Mia is 3-4, likes animals, and benefits from repeated color words.",
    illustration: "large story cover showing friendly fox and color objects", states: { default: "recommendation loaded", loading: "finding story", empty: "no safe story match", error: "recommendation failed", success: "player opens", disabled: "play disabled while loading", offline: "show downloaded fallback" },
    interaction: "Parent opens reason details or changes story before child playback.", animation: "cover-to-player shared transition; reduced-motion uses fade.", accessibility: "large targets, labels, contrast, non-color cues, focus order, reduced-motion fallback, audio alternative for story preview.",
    responsive: "Cover and reason panel resize without hiding CTA.", childSafety: "Only age-safe story appears; parent can change choice.", productFit: "Transparent AI recommendation for 0-6 story product.",
    visualHierarchy: "cover, reason, play CTA, alternate action", roleSeparation: "parent evaluates AI; child does not see black-box rationale.", designReviewEvidence: "Core AI screen requires PM trust review.",
    acceptanceCriteria: ["Reason is visible", "Alternative story path exists", "Offline fallback defined"], testCases: ["FL-HF-05-reason", "FL-HF-05-empty", "FL-HF-05-play"]
  },
  {
    pageId: "FL-HF-06", title: "Child Story Player", route: "/player", section: "Core 12", audience: "child", ageBand: "0-6 child with parent nearby",
    businessGoal: "Deliver the core story experience safely and clearly.",
    userGoal: "Play or pause the story through large visual controls.",
    userPain: "Young child cannot read small controls or understand dense playback UI.", journey: "recommendation -> story playback -> completion", uxFlow: "see scene -> hear narration -> tap large controls -> finish", taskFlow: "child uses play/pause, parent can exit, app handles buffer and complete",
    iaRole: "core child playback", layout: "immersive-child-player", layoutFamily: "child playback", visualDesignLevel: "high-fidelity-ui", actualUIScreen: "full-screen story scene with oversized controls",
    navigationModel: "full-screen mode with parent exit", appChrome: "minimal child-safe chrome", components: ["story scene", "progress dots", "large play control", "parent exit", "voice cue", "buffer state"],
    componentTree: ["Frame", "StoryScene", "ProgressDots", "PrimaryPlayControl", "ParentExit", "VoiceCue", "BufferOverlay"], primaryCTA: "Play or pause", secondaryCTA: "Parent exit",
    copywriting: "Picture and voice first. No reading needed.",
    illustration: "full-screen fox story scene with one clear focal object", states: { default: "ready to play", loading: "buffering story", empty: "story unavailable", error: "playback failed", success: "story complete", disabled: "controls disabled during buffer", offline: "cached playback only" },
    interaction: "Child taps one oversized control; parent exit requires adult hold.", animation: "page turns softly; reduced-motion uses static page changes.", accessibility: "large targets, labels, contrast, non-color cues, focus order, reduced-motion fallback, audio alternative through captions for parent.",
    responsive: "Full-screen Android and H5 safe-area controls.", childSafety: "No reading requirement, no external links, no autoplay chain.", productFit: "Core child story playback for ages 0-6.",
    visualHierarchy: "scene first, play control second, parent exit small but reachable", roleSeparation: "child controls playback; parent controls exit.", designReviewEvidence: "Core child screen requires child safety and motion review.",
    acceptanceCriteria: ["Play target is large", "No reading required", "Parent exit exists", "Buffer state visible"], testCases: ["FL-HF-06-play", "FL-HF-06-buffer", "FL-HF-06-complete"]
  },
  {
    pageId: "FL-HF-07", title: "Story Complete", route: "/story-complete", section: "Core 12", audience: "child", ageBand: "0-6 child with parent nearby",
    businessGoal: "End the story without addictive loops and hand off to learning.",
    userGoal: "Know the story ended and choose one gentle next step.",
    userPain: "Child can be overstimulated by reward walls or endless recommendations.", journey: "player -> completion -> parent prompt", uxFlow: "see calm completion -> receive one prompt -> parent continues", taskFlow: "child sees completion, taps visual prompt, parent confirms next",
    iaRole: "safe session ending", layout: "calm-child-completion", layoutFamily: "child completion", visualDesignLevel: "high-fidelity-ui", actualUIScreen: "gentle completion scene with one visual prompt",
    navigationModel: "no autoplay; parent-mediated next step", appChrome: "child completion with parent handoff", components: ["calm celebration", "one visual prompt", "parent handoff", "done action"],
    componentTree: ["Frame", "CompletionIllustration", "SinglePrompt", "ParentHandoff", "DoneCTA"], primaryCTA: "Ask together", secondaryCTA: "Done",
    copywriting: "All done. Ask together: what color did fox find?",
    illustration: "soft star and fox waving, no flashing reward", states: { default: "complete", loading: "saving progress", empty: "no prompt available", error: "save failed", success: "progress saved", disabled: "CTA disabled while saving", offline: "save locally" },
    interaction: "Child sees prompt; parent continues conversation; autoplay is absent.", animation: "single soft star fade; reduced-motion static star.", accessibility: "large targets, labels, contrast, non-color cues, focus order, reduced-motion fallback, audio alternative for prompt.",
    responsive: "Single prompt remains centered on H5 and Android.", childSafety: "No addictive streak, no endless autoplay, no punishment.", productFit: "Story-to-growth transition for 0-6 child product.",
    visualHierarchy: "completion signal, prompt, parent action", roleSeparation: "child sees visual cue; parent leads question.", designReviewEvidence: "Core completion screen requires behavior safety review.",
    acceptanceCriteria: ["No autoplay", "One prompt only", "Progress save error handled"], testCases: ["FL-HF-07-save", "FL-HF-07-offline", "FL-HF-07-no-autoplay"]
  },
  {
    pageId: "FL-HF-08", title: "Next Recommendation", route: "/next-recommendation", section: "Core 12", audience: "parent", ageBand: "parent or caregiver",
    businessGoal: "Let the parent control continuation after a child session.",
    userGoal: "Choose stop, save, or play next with clear reasoning.",
    userPain: "Parent needs control over session length and bedtime boundaries.", journey: "story complete -> next recommendation -> stop or continue", uxFlow: "review next option -> save, play, or stop", taskFlow: "read reason, choose save for later or play next",
    iaRole: "post-session parent decision", layout: "parent-next-decision", layoutFamily: "parent decision after child session", visualDesignLevel: "high-fidelity-ui", actualUIScreen: "parent decision screen with one recommendation and stop guardrail",
    navigationModel: "parent-controlled branch", appChrome: "parent top bar", components: ["next story card", "reason", "save CTA", "play secondary", "stop option", "bedtime guardrail"],
    componentTree: ["Frame", "ParentTopBar", "NextStoryCard", "ReasonSummary", "PrimaryCTA", "SecondaryCTA", "StopOption", "GuardrailNote"], primaryCTA: "Save for later", secondaryCTA: "Play next",
    copywriting: "One next story is available. Autoplay stays off by default.",
    illustration: "next story cover smaller than decision controls", states: { default: "next option loaded", loading: "loading next option", empty: "no next option", error: "recommendation failed", success: "saved for later", disabled: "CTA disabled while saving", offline: "save local preference" },
    interaction: "Parent chooses save, play, or stop; child does not trigger continuation.", animation: "story card slides from completion; reduced-motion uses static card.", accessibility: "large targets, labels, contrast, non-color cues, focus order, reduced-motion fallback, audio alternative not required.",
    responsive: "Decision buttons remain bottom reachable.", childSafety: "No child-facing autoplay or manipulative loop.", productFit: "Parent-managed continuation for story product.",
    visualHierarchy: "decision buttons before recommendation details", roleSeparation: "parent owns continuation.", designReviewEvidence: "Core continuation screen requires PM and child safety review.",
    acceptanceCriteria: ["Autoplay off", "Stop option visible", "Save success shown"], testCases: ["FL-HF-08-save", "FL-HF-08-stop", "FL-HF-08-error"]
  },
  {
    pageId: "FL-HF-09", title: "Daily Task", route: "/daily-task", section: "Core 12", audience: "parent", ageBand: "parent or caregiver",
    businessGoal: "Convert story completion into a short growth activity.",
    userGoal: "Start a low-effort parent-led activity.",
    userPain: "Parent wants useful follow-up without preparing materials.", journey: "next action -> daily task -> shared interaction", uxFlow: "read task -> understand accepted responses -> start", taskFlow: "parent checks duration, reads script, starts with child",
    iaRole: "parent task launcher", layout: "parent-led-task", layoutFamily: "parent-led task", visualDesignLevel: "high-fidelity-ui", actualUIScreen: "task card with script, time, accepted responses, start CTA",
    navigationModel: "from home or story completion to task", appChrome: "parent task top bar", components: ["time badge", "task script", "accepted responses", "skill tag", "start CTA", "skip action"],
    componentTree: ["Frame", "ParentTopBar", "TaskSummary", "ScriptPanel", "ResponseGuide", "SkillTag", "PrimaryCTA", "SkipAction"], primaryCTA: "Start with child", secondaryCTA: "Skip today",
    copywriting: "Ask: Which face is sleepy? Accept pointing, sound, or speech.",
    illustration: "two soft face cards and parent prompt sheet", states: { default: "not started", loading: "starting task", empty: "no task today", error: "task failed", success: "task started", disabled: "CTA disabled if task unavailable", offline: "show downloaded task" },
    interaction: "Parent starts task and can skip without penalty.", animation: "script panel expands gently; reduced-motion opens instantly.", accessibility: "large targets, labels, contrast, non-color cues, focus order, reduced-motion fallback, audio alternative for prompt.",
    responsive: "Script remains readable with CTA fixed near thumb zone.", childSafety: "No scoring pressure; accepts nonverbal response.", productFit: "Daily parent-led growth task for 0-6.",
    visualHierarchy: "time and script, response guide, start CTA", roleSeparation: "parent reads script; child responds later.", designReviewEvidence: "Core growth task requires UX and child education review.",
    acceptanceCriteria: ["Accepted responses visible", "Skip is non-punitive", "Offline task path exists"], testCases: ["FL-HF-09-start", "FL-HF-09-skip", "FL-HF-09-empty"]
  },
  {
    pageId: "FL-HF-10", title: "Parent Child Interaction", route: "/together", section: "Core 12", audience: "parent child", ageBand: "0-6 child with parent-assisted flow",
    businessGoal: "Guide a shared learning moment after story or task.",
    userGoal: "Parent reads one prompt while child answers visually.",
    userPain: "Mixed parent-child screens often confuse who should act.", journey: "daily task -> interaction -> completion", uxFlow: "parent script -> child visual response -> parent confirm", taskFlow: "parent reads, child taps, parent marks done",
    iaRole: "shared activity", layout: "split-role-interaction", layoutFamily: "shared interaction", visualDesignLevel: "high-fidelity-ui", actualUIScreen: "parent script zone and child tap zone separated",
    navigationModel: "shared screen with parent confirmation", appChrome: "dual-role label", components: ["parent script", "child visual choices", "voice cue", "parent confirmation", "try again"],
    componentTree: ["Frame", "RoleBanner", "ParentScriptPanel", "ChildChoiceGrid", "VoiceCue", "ParentConfirmBar"], primaryCTA: "Mark done", secondaryCTA: "Try again",
    copywriting: "Parent: Ask which one is sleepy. Child: tap the sleepy bear.",
    illustration: "three large emotion cards with clear face differences", states: { default: "waiting for child tap", loading: "saving response", empty: "choices unavailable", error: "save failed", success: "done", disabled: "confirm disabled until response", offline: "save local response" },
    interaction: "Child taps large picture; parent confirms completion.", animation: "selected card gives soft feedback; reduced-motion uses border and sound.", accessibility: "large targets, labels, contrast, non-color cues, focus order, reduced-motion fallback, audio alternative for prompt.",
    responsive: "Child tap zone occupies center; parent confirm stays bottom.", childSafety: "No wrong-answer shaming; parent can accept pointing.", productFit: "Parent-child growth interaction for 0-6.",
    visualHierarchy: "role banner, child choices, parent confirm", roleSeparation: "parent reads and confirms; child taps pictures.", designReviewEvidence: "Core shared screen requires role-separation review.",
    acceptanceCriteria: ["Child and parent roles visible", "Confirm disabled until response", "No negative feedback"], testCases: ["FL-HF-10-tap", "FL-HF-10-confirm", "FL-HF-10-error"]
  },
  {
    pageId: "FL-HF-11", title: "Parent Center", route: "/parent", section: "Core 12", audience: "parent", ageBand: "parent or caregiver",
    businessGoal: "Centralize adult controls for trust, privacy, progress, and limits.",
    userGoal: "Manage child profile, progress, privacy, and support from one place.",
    userPain: "Parent needs control without searching across child-facing screens.", journey: "home -> parent center -> settings or report", uxFlow: "review child summary -> choose control area -> manage", taskFlow: "switch child, review progress, open privacy or limits",
    iaRole: "adult control hub", layout: "parent-dashboard", layoutFamily: "parent dashboard", visualDesignLevel: "high-fidelity-ui", actualUIScreen: "parent dashboard with progress, controls, privacy, and support",
    navigationModel: "bottom nav parent tab plus settings routes", appChrome: "full parent app chrome", components: ["child switcher", "progress card", "privacy card", "limits card", "support entry", "bottom nav"],
    componentTree: ["Frame", "ParentTopBar", "ChildSwitcher", "ProgressSummary", "ControlGrid", "PrivacyAction", "SupportEntry", "BottomNav"], primaryCTA: "Review progress", secondaryCTA: "Privacy settings",
    copywriting: "Parent controls child profiles, privacy, time limits, and support.",
    illustration: "data-light dashboard with child avatar and control cards", states: { default: "dashboard loaded", loading: "loading parent data", empty: "no child profile", error: "dashboard failed", success: "control opened", disabled: "restricted action disabled", offline: "show cached profile and retry" },
    interaction: "Parent switches child, opens controls, and reviews progress.", animation: "cards respond on press; reduced-motion uses static pressed state.", accessibility: "large targets, labels, contrast, non-color cues, focus order, reduced-motion fallback, audio alternative not required.",
    responsive: "Dense but readable H5/Android parent dashboard.", childSafety: "Adult controls not shown in child player.", productFit: "Parent-managed growth and privacy center.",
    visualHierarchy: "child context, progress, controls, support", roleSeparation: "adult-only dashboard.", designReviewEvidence: "Core parent center requires privacy and IA review.",
    acceptanceCriteria: ["Privacy entry visible", "Child switcher separated", "Offline cached mode defined"], testCases: ["FL-HF-11-open", "FL-HF-11-switch", "FL-HF-11-offline"]
  },
  {
    pageId: "FL-HF-12", title: "Bedtime Mode", route: "/bedtime", section: "Core 12", audience: "parent child", ageBand: "0-6 child with parent bedtime control",
    businessGoal: "Support low-stimulation bedtime story playback with parent control.",
    userGoal: "Start one calm story and stop safely after it ends.",
    userPain: "Bedtime apps can overstimulate children or continue endlessly.", journey: "home -> bedtime -> bedtime player -> stop", uxFlow: "parent enters bedtime -> chooses calm story -> plays one story -> stops", taskFlow: "set timer and sound, start story, end without autoplay",
    iaRole: "bedtime environment", layout: "dim-bedtime-environment", layoutFamily: "bedtime environment", visualDesignLevel: "high-fidelity-ui", actualUIScreen: "dim bedtime screen with timer, sound, and one-story guardrail",
    navigationModel: "bedtime mode with parent exit", appChrome: "dim top bar and timer controls", components: ["dim story cover", "timer", "sound control", "one-story guardrail", "start CTA", "parent exit"],
    componentTree: ["Frame", "DimHeader", "CalmStoryCover", "TimerControl", "SoundControl", "Guardrail", "PrimaryCTA", "ParentExit"], primaryCTA: "Start bedtime story", secondaryCTA: "Exit bedtime",
    copywriting: "One calm story. Soft sound. No autoplay after bedtime.",
    illustration: "moon, soft blanket, and low-contrast story scene", states: { default: "bedtime ready", loading: "loading calm story", empty: "no downloaded bedtime story", error: "story failed", success: "bedtime story started", disabled: "start disabled while loading", offline: "downloaded bedtime stories only" },
    interaction: "Parent starts bedtime story, adjusts timer and sound, exits when needed.", animation: "slow fade and dim transition; reduced-motion uses instant dim.", accessibility: "large targets, labels, contrast, non-color cues, focus order, reduced-motion fallback, audio alternative through parent captions.",
    responsive: "Controls remain reachable in dim H5 and Android safe area.", childSafety: "Low stimulation, no autoplay chain, parent exit available.", productFit: "Bedtime story mode for 0-6 parent-child use.",
    visualHierarchy: "calm story, timer/sound, start CTA, guardrail", roleSeparation: "parent controls bedtime; child receives calm playback.", designReviewEvidence: "Core bedtime screen requires motion and child safety review.",
    acceptanceCriteria: ["No autoplay after story", "Reduced-motion fallback", "Offline bedtime fallback"], testCases: ["FL-HF-12-start", "FL-HF-12-timer", "FL-HF-12-offline"]
  }
];

pageSpecs = pageSpecs.map(function (page) {
  page.subtitle = page.subtitle || page.copywriting;
  page.businessGoal = page.businessGoal + " Success is measurable by role-correct task completion.";
  page.userGoal = page.userGoal + " The next step must stay clear, safe, and recoverable.";
  page.userPain = page.userPain + " The screen must reduce cognitive load and avoid confusion.";
  page.interaction = page.interaction + " The role owner can tap, press, select, confirm, retry, exit, or advance through explicit controls.";
  return page;
});

function renderFirstLaunch(f, spec) {
  rect(f, 0, 0, W, H, C.softMint, 0);
  text(f, "FutureLight", 28, 56, 24, C.ink, 260, "Medium");
  storyScene(f, 24, 108, 342, 300, false);
  text(f, "Stories fit your child", 28, 448, 30, C.ink, 322, "Medium");
  text(f, "Parent-managed stories, growth prompts, and bedtime mode for ages 0-6.", 28, 494, 15, C.muted, 320);
  rect(f, 28, 568, 334, 74, C.white, 14, C.line);
  text(f, "No child account · No ads · Parent controls data", 46, 598, 13, C.ink, 292, "Medium");
  button(f, 28, 668, 334, spec.primaryCTA, C.honey);
}

function renderLogin(f, spec) {
  rect(f, 0, 0, W, H, C.paper, 0);
  text(f, "Parent login", 28, 76, 30, C.ink, 280, "Medium");
  text(f, "Adult account controls consent, privacy, and child profiles.", 28, 122, 14, C.muted, 320);
  rect(f, 28, 190, 334, 62, C.white, 12, C.line); text(f, "Email", 46, 214, 12, C.muted, 270); text(f, "parent@example.com", 46, 235, 14, C.ink, 270);
  rect(f, 28, 270, 334, 62, C.white, 12, C.line); text(f, "Password", 46, 294, 12, C.muted, 270); text(f, "••••••••", 46, 315, 14, C.ink, 270);
  rect(f, 28, 370, 334, 88, C.softBlue, 14, C.line); text(f, "Parent-only boundary", 46, 400, 16, C.ink, 280, "Medium"); text(f, "Child profiles stay hidden until adult login succeeds.", 46, 426, 12, C.muted, 280);
  button(f, 28, 548, 334, spec.primaryCTA, C.honey);
  text(f, "Forgot password", 139, 628, 13, C.muted, 150, "Medium");
}

function renderCreateChild(f, spec) {
  parentTop(f, "Create child", "Step 1");
  rect(f, 28, 124, 334, 150, C.white, 18, C.line);
  circle(f, 52, 154, 92, C.softHoney, C.line); text(f, "Mia", 174, 175, 30, C.ink, 120, "Medium"); text(f, "Preview child profile", 174, 214, 13, C.muted, 160);
  rect(f, 28, 318, 334, 58, C.white, 12, C.line); text(f, "Nickname shown in app", 46, 342, 12, C.muted, 270); text(f, "Mimi", 46, 363, 14, C.ink, 270);
  text(f, "Choose avatar", 28, 426, 16, C.ink, 250, "Medium");
  for (var i = 0; i < 4; i++) circle(f, 32 + i * 78, 458, 58, [C.honey, C.lilac, C.mint, C.sky][i], C.line);
  rect(f, 28, 552, 334, 70, C.softBlue, 14, C.line); text(f, "Children do not create accounts. Parent owns privacy and profile controls.", 46, 582, 13, C.ink, 290);
  button(f, 28, 668, 334, spec.primaryCTA, C.honey);
}

function renderAge(f, spec) {
  parentTop(f, "Age band", "Step 2");
  text(f, "Age changes UI complexity", 28, 122, 25, C.ink, 320, "Medium");
  var cards = [["0-2", "Pictures + sound", C.softBlue], ["3-4", "Simple choices", C.softMint], ["5-6", "Short recall", C.softHoney]];
  for (var i = 0; i < cards.length; i++) {
    rect(f, 28, 180 + i * 116, 334, 92, cards[i][2], 16, i === 1 ? C.ink : C.line);
    text(f, cards[i][0], 50, 214 + i * 116, 25, C.ink, 76, "Medium");
    text(f, cards[i][1], 140, 219 + i * 116, 16, C.ink, 170, "Medium");
    text(f, i === 1 ? "Selected for Mia" : "Available", 140, 245 + i * 116, 11, C.muted, 170);
  }
  button(f, 28, 668, 334, spec.primaryCTA, C.honey);
}

function renderRecommendation(f, spec) {
  parentTop(f, "Recommended", "Mia");
  storyScene(f, 24, 118, 342, 250, false);
  text(f, "Little Fox Finds Colors", 28, 402, 25, C.ink, 320, "Medium");
  rect(f, 28, 450, 334, 132, C.white, 16, C.line);
  text(f, "Why this story", 46, 480, 16, C.ink, 260, "Medium");
  text(f, "Age 3-4 · animal interest · repeated color words · 4 minutes", 46, 510, 13, C.muted, 270);
  chip(f, 46, 544, "Color words", C.softHoney); chip(f, 160, 544, "Low load", C.softMint);
  button(f, 28, 646, 220, spec.primaryCTA, C.honey); button(f, 260, 646, 102, "Change", C.white);
}

function renderPlayer(f, spec) {
  rect(f, 0, 0, W, H, C.paper, 0);
  storyScene(f, 0, 0, W, 560, false);
  rect(f, 18, 34, 86, 34, C.white, 17, C.line); text(f, "Exit parent", 32, 55, 10, C.ink, 70, "Medium");
  for (var i = 0; i < 8; i++) rect(f, 74 + i * 24, 596, 18, 6, i < 3 ? C.honey : C.line, 3);
  circle(f, 150, 630, 90, C.honey, C.line); text(f, "Pause", 171, 682, 15, C.ink, 80, "Medium");
  text(f, "Picture and voice first. No reading needed.", 38, 752, 14, C.muted, 310, "Medium");
}

function renderComplete(f, spec) {
  rect(f, 0, 0, W, H, C.softLilac, 0);
  circle(f, 120, 120, 150, C.white, C.line); text(f, "All done", 95, 330, 34, C.ink, 220, "Medium");
  text(f, "Ask together: what color did fox find?", 54, 386, 18, C.ink, 280, "Medium");
  rect(f, 54, 470, 282, 110, C.white, 18, C.line);
  text(f, "No autoplay next", 84, 510, 18, C.ink, 220, "Medium"); text(f, "Parent chooses what happens now.", 84, 540, 13, C.muted, 220);
  button(f, 54, 650, 282, spec.primaryCTA, C.honey);
}

function renderNext(f, spec) {
  parentTop(f, "Next step", "Parent");
  text(f, "Continue, stop, or save", 28, 124, 26, C.ink, 320, "Medium");
  rect(f, 28, 186, 334, 180, C.white, 18, C.line);
  circle(f, 48, 214, 86, C.softBlue, C.line); text(f, "Bear Shares a Blanket", 158, 230, 20, C.ink, 170, "Medium"); text(f, "Same skill, calmer setting", 158, 284, 13, C.muted, 170);
  rect(f, 28, 408, 334, 88, C.softHoney, 16, C.line); text(f, "Autoplay is off", 50, 440, 18, C.ink, 260, "Medium"); text(f, "Saving is the recommended parent action.", 50, 470, 13, C.muted, 260);
  button(f, 28, 590, 334, spec.primaryCTA, C.honey); text(f, "Play next", 160, 674, 14, C.muted, 100, "Medium");
}

function renderDailyTask(f, spec) {
  parentTop(f, "Daily task", "Mia");
  rect(f, 28, 122, 124, 84, C.softMint, 16, C.line); text(f, "2 min", 58, 162, 26, C.ink, 80, "Medium");
  rect(f, 172, 122, 190, 84, C.softBlue, 16, C.line); text(f, "No prep", 214, 162, 24, C.ink, 120, "Medium");
  rect(f, 28, 250, 334, 190, C.white, 18, C.line); text(f, "Parent script", 50, 286, 18, C.ink, 260, "Medium"); text(f, "Ask: Which face is sleepy?", 50, 326, 20, C.ink, 280, "Medium"); text(f, "Accept pointing, sound, or speech.", 50, 372, 13, C.muted, 280);
  rect(f, 28, 476, 334, 86, C.softHoney, 16, C.line); text(f, "No scoring pressure", 50, 510, 17, C.ink, 260, "Medium");
  button(f, 28, 650, 334, spec.primaryCTA, C.honey);
}

function renderTogether(f, spec) {
  rect(f, 0, 0, W, H, C.paper, 0);
  rect(f, 0, 0, W, 132, C.white, 0, C.line); text(f, "Parent reads", 28, 48, 18, C.ink, 180, "Medium"); text(f, "Which bear is sleepy?", 28, 88, 22, C.ink, 300, "Medium");
  text(f, "Child taps", 28, 174, 18, C.ink, 200, "Medium");
  for (var i = 0; i < 3; i++) { rect(f, 28 + i * 116, 220, 100, 156, [C.softHoney, C.softBlue, C.softMint][i], 18, C.line); circle(f, 52 + i * 116, 250, 52, C.white, C.line); text(f, ["Happy", "Sleepy", "Sad"][i], 48 + i * 116, 340, 14, C.ink, 74, "Medium"); }
  rect(f, 28, 456, 334, 94, C.white, 16, C.line); text(f, "Parent confirms after child points or taps.", 50, 494, 15, C.muted, 280);
  button(f, 28, 650, 334, spec.primaryCTA, C.honey);
}

function renderParentCenter(f, spec) {
  parentTop(f, "Parent Center", "Mia");
  rect(f, 24, 118, 342, 118, C.white, 18, C.line); text(f, "Mia · age 3-4", 48, 158, 22, C.ink, 260, "Medium"); text(f, "12 stories · 5 tasks · consent active", 48, 194, 13, C.muted, 260);
  var cards = [["Progress", C.softMint], ["Privacy", C.softBlue], ["Limits", C.softHoney], ["Support", C.softLilac]];
  for (var i = 0; i < 4; i++) { rect(f, 24 + (i % 2) * 176, 278 + Math.floor(i / 2) * 126, 166, 100, cards[i][1], 16, C.line); text(f, cards[i][0], 48 + (i % 2) * 176, 336 + Math.floor(i / 2) * 126, 18, C.ink, 120, "Medium"); }
  button(f, 24, 642, 342, spec.primaryCTA, C.honey);
  bottomNav(f, "Parent");
}

function renderBedtime(f, spec) {
  rect(f, 0, 0, W, H, C.night, 0);
  text(f, "Bedtime mode", 28, 62, 26, C.white, 260, "Medium");
  storyScene(f, 24, 124, 342, 260, true);
  rect(f, 28, 430, 334, 86, C.dim, 16, C.line); text(f, "Timer 10 min · Rain low · One story only", 50, 467, 16, C.white, 270, "Medium");
  rect(f, 28, 548, 334, 78, C.dim, 16, C.line); text(f, "No autoplay after bedtime.", 50, 582, 17, C.white, 260, "Medium");
  button(f, 28, 680, 334, spec.primaryCTA, C.honey);
}

function renderFrame(spec, index) {
  var f = phoneFrame(spec.pageId + " - " + spec.title);
  if (spec.pageId === "FL-HF-01") renderFirstLaunch(f, spec);
  else if (spec.pageId === "FL-HF-02") renderLogin(f, spec);
  else if (spec.pageId === "FL-HF-03") renderCreateChild(f, spec);
  else if (spec.pageId === "FL-HF-04") renderAge(f, spec);
  else if (spec.pageId === "FL-HF-05") renderRecommendation(f, spec);
  else if (spec.pageId === "FL-HF-06") renderPlayer(f, spec);
  else if (spec.pageId === "FL-HF-07") renderComplete(f, spec);
  else if (spec.pageId === "FL-HF-08") renderNext(f, spec);
  else if (spec.pageId === "FL-HF-09") renderDailyTask(f, spec);
  else if (spec.pageId === "FL-HF-10") renderTogether(f, spec);
  else if (spec.pageId === "FL-HF-11") renderParentCenter(f, spec);
  else renderBedtime(f, spec);
  text(f, spec.pageId, 24, 92, 11, spec.pageId === "FL-HF-12" ? C.white : C.muted, 120, "Medium");
  return f;
}

function makeFlowMap(page) {
  text(page, "Core 12 Product Flow", 0, 0, 34, C.ink, 520, "Medium");
  text(page, "Validated rebuild path. Do not expand to 79 screens until these pass visual review.", 0, 52, 16, C.muted, 760);
  for (var i = 0; i < pageSpecs.length; i++) {
    rect(page, 0, 112 + i * 42, 660, 30, i % 2 ? C.softBlue : C.softMint, 8, C.line);
    text(page, pageSpecs[i].pageId + " " + pageSpecs[i].title, 14, 132 + i * 42, 13, C.ink, 260, "Medium");
    text(page, pageSpecs[i].layoutFamily, 286, 132 + i * 42, 12, C.muted, 340);
  }
}

async function main() {
  try {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    var page = figma.currentPage;
    page.name = "FutureLight - Core 12 HF";
    while (page.children.length > 0) page.children[0].remove();
    makeFlowMap(page);
    var previewNodes = [];
    for (var i = 0; i < pageSpecs.length; i++) {
      var frame = renderFrame(pageSpecs[i], i);
      frame.x = (i % COLS) * (W + GAP);
      frame.y = 760 + Math.floor(i / COLS) * (H + GAP);
      page.appendChild(frame);
      previewNodes.push(frame);
    }
    figma.viewport.scrollAndZoomIntoView(previewNodes.slice(0, 4));
    figma.notify("FutureLight core 12 high-fidelity screens generated: " + pageSpecs.length);
    figma.closePlugin();
  } catch (err) {
    figma.notify("FutureLight core 12 failed: " + err.message);
    figma.closePlugin();
  }
}

main();
