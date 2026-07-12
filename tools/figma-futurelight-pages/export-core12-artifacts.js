const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const outDir = path.join(root, "output", "core12-ui");
const pngDir = path.join(outDir, "png");
const svgDir = path.join(outDir, "svg");
fs.mkdirSync(pngDir, { recursive: true });
fs.mkdirSync(svgDir, { recursive: true });

const code = fs.readFileSync(path.join(__dirname, "code.js"), "utf8");
const end = code.indexOf("function renderFrame");
if (end < 0) throw new Error("Cannot find renderFrame boundary");
const specs = Function(`${code.slice(0, end)}\nreturn pageSpecs;`)();

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cssClass(page) {
  return page.layout.replace(/[^a-z0-9]+/g, "-");
}

function screenHtml(page) {
  const cls = cssClass(page);
  const isChild = page.audience === "child" || page.audience === "parent child";
  const dark = page.pageId === "FL-HF-12";
  return `
    <article class="phone ${cls} ${dark ? "dark" : ""}" data-page-id="${esc(page.pageId)}">
      <div class="meta">${esc(page.pageId)} · ${esc(page.layoutFamily)}</div>
      <section class="ui ${cls}">
        ${renderBody(page)}
      </section>
      <aside class="qa">
        <b>${esc(page.title)}</b>
        <span>${esc(page.audience)} · ${esc(page.ageBand)}</span>
        <span>${isChild ? "visual/audio/action first" : "parent-controlled flow"}</span>
      </aside>
    </article>`;
}

function top(title, tag = "Mia") {
  return `<div class="topbar"><div class="avatar"></div><strong>${esc(title)}</strong><span>${esc(tag)}</span></div>`;
}

function cta(label, secondary) {
  return `<div class="cta-row"><button class="primary">${esc(label)}</button>${secondary ? `<button class="secondary">${esc(secondary)}</button>` : ""}</div>`;
}

function storyArt(label = "illustrated story scene") {
  return `<div class="story-art"><div class="sun"></div><div class="hill"></div><div class="character"></div><b>${esc(label)}</b></div>`;
}

function renderBody(p) {
  switch (p.pageId) {
    case "FL-HF-01":
      return `<div class="brand">FutureLight</div>${storyArt("parent-child story world")}<h1>Stories fit your child</h1><p>Parent-managed stories, growth prompts, and bedtime mode for ages 0-6.</p><div class="trust">No child account · No ads · Parent controls data</div>${cta(p.primaryCTA, p.secondaryCTA)}`;
    case "FL-HF-02":
      return `<h1>Parent login</h1><p>Adult account controls consent, privacy, and child profiles.</p><label>Email<input value="parent@example.com" /></label><label>Password<input value="••••••••" /></label><div class="notice">Child profiles stay hidden until adult login succeeds.</div>${cta(p.primaryCTA, p.secondaryCTA)}`;
    case "FL-HF-03":
      return `${top("Create child", "Step 1")}<div class="profile-preview"><div class="big-avatar"></div><div><h2>Mia</h2><p>Preview child profile</p></div></div><label>Nickname shown in app<input value="Mimi" /></label><div class="avatar-row"><i></i><i></i><i></i><i></i></div><div class="notice">Children do not create accounts. Parent owns privacy and profile controls.</div>${cta(p.primaryCTA)}`;
    case "FL-HF-04":
      return `${top("Age band", "Step 2")}<h1>Age changes UI complexity</h1><div class="age-card"><b>0-2</b><span>Pictures + sound · no reading</span></div><div class="age-card selected"><b>3-4</b><span>Simple choices · selected for Mia</span></div><div class="age-card"><b>5-6</b><span>Short recall · guided words</span></div>${cta(p.primaryCTA)}`;
    case "FL-HF-05":
      return `${top("Recommended", "Mia")}${storyArt("Little Fox Finds Colors")}<h1>Why this story?</h1><p>Age 3-4 · animal interest · repeated color words · 4 minutes.</p><div class="tags"><span>Color words</span><span>Low load</span><span>Parent prompt</span></div>${cta(p.primaryCTA, "Change")}`;
    case "FL-HF-06":
      return `${storyArt("full-screen fox scene")}<div class="parent-exit">Exit parent</div><div class="progress"><i></i><i></i><i></i><i></i><i></i></div><button class="play">Pause</button><p>Picture and voice first. No reading needed.</p>`;
    case "FL-HF-07":
      return `<div class="celebrate"></div><h1>All done</h1><p>Ask together: what color did fox find?</p><div class="notice">No autoplay next. Parent chooses what happens now.</div>${cta(p.primaryCTA, p.secondaryCTA)}`;
    case "FL-HF-08":
      return `${top("Next step", "Parent")}<h1>Continue, stop, or save</h1><div class="next-card"><div></div><b>Bear Shares a Blanket</b><span>Same skill, calmer setting</span></div><div class="notice">Autoplay is off. Saving is the recommended parent action.</div>${cta(p.primaryCTA, p.secondaryCTA)}`;
    case "FL-HF-09":
      return `${top("Daily task", "Mia")}<div class="task-stats"><b>2 min</b><b>No prep</b></div><div class="script"><small>Parent script</small><h2>Ask: Which face is sleepy?</h2><p>Accept pointing, sound, or speech.</p></div><div class="notice">No scoring pressure.</div>${cta(p.primaryCTA, p.secondaryCTA)}`;
    case "FL-HF-10":
      return `<div class="role parent">Parent reads: Which bear is sleepy?</div><h2>Child taps</h2><div class="choice-grid"><button>Happy</button><button class="selected">Sleepy</button><button>Sad</button></div><div class="notice">Parent confirms after child points or taps.</div>${cta(p.primaryCTA, p.secondaryCTA)}`;
    case "FL-HF-11":
      return `${top("Parent Center", "Mia")}<div class="profile-summary"><h2>Mia · age 3-4</h2><p>12 stories · 5 tasks · consent active</p></div><div class="control-grid"><button>Progress</button><button>Privacy</button><button>Limits</button><button>Support</button></div>${cta(p.primaryCTA, p.secondaryCTA)}<nav>Home · Story · Task · Parent</nav>`;
    case "FL-HF-12":
      return `<h1>Bedtime mode</h1>${storyArt("slow moon scene")}<div class="bedtime-controls">Timer 10 min · Rain low · One story only</div><div class="notice">No autoplay after bedtime.</div>${cta(p.primaryCTA, p.secondaryCTA)}`;
    default:
      return `<h1>${esc(p.title)}</h1>${cta(p.primaryCTA)}`;
  }
}

function svgFor(page) {
  const body = `<foreignObject x="0" y="0" width="390" height="844"><div xmlns="http://www.w3.org/1999/xhtml" class="svg-wrap">${renderBody(page)}</div></foreignObject>`;
  return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844"><style>${baseCss()}</style>${body}</svg>`;
}

function baseCss() {
  return `
*{box-sizing:border-box} body{margin:0;background:#f4f4f1;font-family:Inter,Arial,sans-serif;color:#151820}.gallery{display:grid;grid-template-columns:repeat(3,390px);gap:48px;padding:48px}.phone,.svg-wrap{width:390px;height:844px;background:#fbfaf3;border:1px solid #d7dde3;border-radius:28px;overflow:hidden;position:relative;padding:24px}.phone{box-shadow:0 24px 60px rgba(20,24,31,.14)}.meta{font-size:11px;color:#5c6470;margin-bottom:12px}.qa{position:absolute;left:18px;right:18px;bottom:14px;background:rgba(255,255,255,.92);border:1px solid #d7dde3;border-radius:12px;padding:10px;font-size:10px;display:grid;gap:3px}.ui{height:760px}.topbar{height:72px;margin:-24px -24px 24px;padding:28px 24px 0;background:#fff;border-bottom:1px solid #d7dde3;display:flex;align-items:center;gap:12px}.topbar .avatar{width:32px;height:32px;border-radius:50%;background:#9dd6b3}.topbar strong{font-size:18px;flex:1}.topbar span{background:#fff3ca;border:1px solid #d7dde3;border-radius:999px;padding:7px 12px;font-size:11px}h1{font-size:30px;line-height:1.08;margin:20px 0 12px}h2{font-size:22px;margin:10px 0}p{font-size:15px;line-height:1.42;color:#5c6470}.brand{font-size:24px;font-weight:800;margin:12px 0 18px}.story-art{height:260px;border-radius:22px;background:#e7f5ff;border:1px solid #d7dde3;position:relative;padding:190px 24px 0;overflow:hidden}.dark .story-art,.dim-bedtime-environment .story-art{background:#2f3652;color:#fff}.sun{width:86px;height:86px;border-radius:50%;background:#f4c44f;position:absolute;left:30px;top:30px}.hill{width:140px;height:90px;background:#eaf8ed;border-radius:24px;position:absolute;left:92px;top:96px}.character{width:82px;height:82px;border-radius:50%;background:#9dd6b3;position:absolute;right:42px;top:66px}.trust,.notice{border:1px solid #d7dde3;background:#fff;border-radius:16px;padding:18px;margin:20px 0;font-size:14px;color:#151820}.cta-row{position:absolute;left:24px;right:24px;bottom:70px;display:flex;gap:10px}.primary,.secondary{height:54px;border-radius:14px;border:1px solid #d7dde3;font-weight:800;font-size:15px}.primary{background:#f4c44f;flex:1}.secondary{background:#fff;min-width:104px}.phone label{display:block;font-size:12px;color:#5c6470;margin:20px 0}.phone input{width:100%;height:58px;border:1px solid #d7dde3;border-radius:14px;padding:0 16px;font-size:15px;background:#fff;margin-top:8px}.profile-preview{height:150px;background:#fff;border:1px solid #d7dde3;border-radius:20px;display:flex;align-items:center;gap:24px;padding:24px}.big-avatar{width:94px;height:94px;border-radius:50%;background:#fff3ca}.avatar-row{display:flex;gap:18px;margin:18px 0}.avatar-row i{width:58px;height:58px;border-radius:50%;background:#b0a3e0}.age-card{height:92px;border-radius:18px;border:1px solid #d7dde3;background:#fff;margin:14px 0;padding:24px;display:flex;gap:26px;align-items:center}.age-card b{font-size:26px}.age-card.selected{border:2px solid #151820;background:#eaf8ed}.tags span{display:inline-block;border-radius:999px;background:#fff3ca;border:1px solid #d7dde3;padding:9px 12px;margin:4px;font-size:12px}.parent-exit{position:absolute;top:34px;left:24px;background:#fff;border-radius:999px;padding:10px 14px;font-size:11px}.progress{display:flex;gap:8px;justify-content:center;margin:28px}.progress i{width:24px;height:7px;border-radius:999px;background:#d7dde3}.progress i:nth-child(-n+3){background:#f4c44f}.play{display:block;width:96px;height:96px;border-radius:50%;border:1px solid #d7dde3;background:#f4c44f;margin:0 auto;font-weight:800}.celebrate{width:170px;height:170px;border-radius:50%;background:#fff;margin:70px auto 24px}.next-card{height:178px;border-radius:20px;background:#fff;border:1px solid #d7dde3;padding:24px;display:grid;grid-template-columns:88px 1fr;gap:16px;align-items:center}.next-card div{width:88px;height:88px;border-radius:20px;background:#e7f5ff}.task-stats{display:grid;grid-template-columns:1fr 1fr;gap:18px}.task-stats b{background:#eaf8ed;border:1px solid #d7dde3;border-radius:18px;padding:28px;text-align:center;font-size:24px}.script{background:#fff;border:1px solid #d7dde3;border-radius:20px;padding:24px;margin:28px 0}.role{margin:-24px -24px 24px;padding:34px 24px;background:#fff;border-bottom:1px solid #d7dde3;font-size:22px;font-weight:800}.choice-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:34px 0}.choice-grid button{height:156px;border-radius:20px;border:1px solid #d7dde3;background:#e7f5ff;font-weight:800}.choice-grid .selected{background:#fff3ca;border:2px solid #151820}.profile-summary{background:#fff;border:1px solid #d7dde3;border-radius:20px;padding:24px}.control-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:28px 0}.control-grid button{height:100px;border-radius:18px;border:1px solid #d7dde3;background:#eaf8ed;font-weight:800}.phone nav{position:absolute;left:0;right:0;bottom:0;height:58px;background:#fff;border-top:1px solid #d7dde3;text-align:center;padding-top:22px;font-size:11px;color:#5c6470}.dim-bedtime-environment,.dark{background:#191e31;color:#fff}.dim-bedtime-environment p,.dark p{color:#c9d0df}.bedtime-controls{background:#2f3652;border:1px solid #525b78;border-radius:18px;padding:22px;margin:24px 0;color:#fff}
`;
}

const cards = specs.map(screenHtml).join("\n");
const html = `<!doctype html><html><head><meta charset="utf-8"/><title>FutureLight Core 12 UI Review</title><style>${baseCss()}</style></head><body><main class="gallery">${cards}</main></body></html>`;
fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");

const flows = [
  ["Flow A: Onboarding", ["FL-HF-01", "FL-HF-02", "FL-HF-03", "FL-HF-04"]],
  ["Flow B: Recommendation To Playback", ["FL-HF-04", "FL-HF-05", "FL-HF-06", "FL-HF-07"]],
  ["Flow C: Post Story Action", ["FL-HF-07", "FL-HF-08", "FL-HF-09", "FL-HF-10"]],
  ["Flow D: Parent Control", ["FL-HF-11", "FL-HF-03", "FL-HF-04", "FL-HF-05"]],
  ["Flow E: Bedtime", ["FL-HF-12", "FL-HF-06", "FL-HF-07", "FL-HF-08"]]
];
const byId = new Map(specs.map((spec) => [spec.pageId, spec]));
const prototype = `<!doctype html><html><head><meta charset="utf-8"/><title>FutureLight Core 12 Prototype</title><style>${baseCss()} .flows{padding:42px;display:grid;gap:42px}.flow{display:grid;grid-template-columns:260px repeat(4,390px);gap:28px;align-items:start}.flow-title{font-size:24px;font-weight:800;position:sticky;left:0}.flow .phone{transform:scale(.88);transform-origin:top left;margin-right:-46px}</style></head><body><main class="flows">${flows.map(([name, ids]) => `<section class="flow"><div class="flow-title">${esc(name)}<p>${ids.join(" -> ")}</p></div>${ids.map((id) => screenHtml(byId.get(id))).join("")}</section>`).join("")}</main></body></html>`;
fs.writeFileSync(path.join(outDir, "prototype.html"), prototype, "utf8");

for (const spec of specs) {
  fs.writeFileSync(path.join(svgDir, `${spec.pageId}.svg`), svgFor(spec), "utf8");
}

const manifest = {
  status: "ready_for_static_visual_review",
  prototypeFlows: flows.map(([name, ids]) => ({ name, pageIds: ids })),
  pages: specs.map((spec) => ({
    pageId: spec.pageId,
    title: spec.title,
    layoutFamily: spec.layoutFamily,
    primaryCTA: spec.primaryCTA,
    componentTree: spec.componentTree,
    artifactSvg: path.join("svg", `${spec.pageId}.svg`),
    artifactPng: path.join("png", `${spec.pageId}.png`)
  }))
};
fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
console.log(outDir);
