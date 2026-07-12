import { designSystem, flows, pages } from "./data.js";
import { currentPage, goTo, nextPageId, previousPageId } from "./router.js";

const screenRoot = document.querySelector("#screenRoot");
const pageIndex = document.querySelector("#pageIndex");
const flowIndex = document.querySelector("#flowIndex");
const screenTitle = document.querySelector("#screenTitle");
const qaEvidence = document.querySelector("#qaEvidence");
const traceability = document.querySelector("#traceability");
const stateControls = document.querySelector("#stateControls");
const deviceFrame = document.querySelector("#deviceFrame");

let activeState = "default";

function html(strings, ...values) {
  return strings.map((part, index) => `${part}${values[index] ?? ""}`).join("");
}

function escapeText(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function stateBanner(page) {
  const stateText = page.states[activeState] || page.states.default;
  return html`<div class="state-banner" data-state="${activeState}">
    <strong>${escapeText(activeState)}</strong>
    <span>${escapeText(stateText)}</span>
  </div>`;
}

function topBar(page, mode = "parent") {
  return html`<header class="app-topbar ${mode}">
    <button class="icon-button" data-action="previous" aria-label="Previous screen">Back</button>
    <div>
      <span>${escapeText(page.id)}</span>
      <strong>${escapeText(page.title)}</strong>
    </div>
    <button class="icon-button" data-action="next" aria-label="Next screen">Next</button>
  </header>`;
}

function bottomNav(active) {
  return html`<nav class="bottom-nav" aria-label="Primary app navigation">
    ${["Home", "Story", "Task", "Parent"].map((item) => `
      <button class="${item === active ? "is-active" : ""}" aria-label="${item}">
        <span aria-hidden="true"></span>${item}
      </button>`).join("")}
  </nav>`;
}

function primaryActions(page) {
  return html`<div class="action-row">
    <button class="primary-action" data-action="next">${escapeText(page.primaryCTA)}</button>
    <button class="secondary-action">${escapeText(page.secondaryCTA)}</button>
  </div>`;
}

const renderers = {
  firstLaunch(page) {
    return html`${topBar(page)}
      <section class="screen-content first-launch">
        ${stateBanner(page)}
        <div class="world-hero">
          <img src="../assets/images/characters/guide-happy.png" alt="Friendly FutureLight guide reading beside soft blocks" />
          <div class="moon-lamp" aria-hidden="true"></div>
        </div>
        <p class="eyebrow">Parent-managed learning stories</p>
        <h2>One calm story path for ages 0-6.</h2>
        <p>${escapeText(page.copy)}</p>
        <div class="trust-strip">
          <span>No ads</span><span>No child account</span><span>Parent consent first</span>
        </div>
        ${primaryActions(page)}
      </section>`;
  },
  login(page) {
    return html`${topBar(page)}
      <section class="screen-content login-layout">
        ${stateBanner(page)}
        <div class="security-card">
          <h2>Parent sign in</h2>
          <label>Email <input value="parent@example.com" aria-label="Parent email" /></label>
          <label>Password <input value="secure demo" type="password" aria-label="Parent password" /></label>
          <p>${escapeText(page.copy)}</p>
        </div>
        <div class="consent-panel">
          <strong>Consent protected</strong>
          <span>Child profiles, deletion, export, and privacy choices stay in the parent account.</span>
        </div>
        ${primaryActions(page)}
      </section>`;
  },
  childProfile(page) {
    return html`${topBar(page)}
      <section class="screen-content profile-layout">
        ${stateBanner(page)}
        <div class="avatar-preview">
          <img src="../assets/images/characters/guide-thinking.png" alt="Guide character preview for child profile" />
          <strong>Mia</strong>
        </div>
        <label class="field-card">Child nickname <input value="Mia" aria-label="Child nickname" /></label>
        <div class="avatar-grid" aria-label="Avatar choices">
          ${["Leaf", "Star", "Cloud", "Drum"].map((name) => `<button>${name}</button>`).join("")}
        </div>
        <ul class="safe-list">
          <li>No full name</li><li>No birthday</li><li>No child photo</li>
        </ul>
        ${primaryActions(page)}
      </section>`;
  },
  ageBand(page) {
    return html`${topBar(page)}
      <section class="screen-content age-layout">
        ${stateBanner(page)}
        <h2>Choose Mia's age band</h2>
        <div class="age-cards">
          <button><strong>0-2</strong><span>Look, hear, point</span></button>
          <button class="selected"><strong>3-4</strong><span>Name, choose, repeat</span></button>
          <button><strong>5-6</strong><span>Tell, compare, create</span></button>
        </div>
        <aside class="parent-tip">For ages 3-4, stories stay short and questions accept pointing or one-word answers.</aside>
        ${primaryActions(page)}
      </section>`;
  },
  recommendation(page) {
    return html`${topBar(page)}<section class="screen-content recommendation-layout">
      ${stateBanner(page)}
      <div class="story-cover">
        <img src="../assets/images/course-covers/animal-english-words-cover.png" alt="Calm animal story cover" />
      </div>
      <div class="recommend-copy">
        <p class="eyebrow">Recommended for Mia</p>
        <h2>The Little Rain Drum</h2>
        <p>${escapeText(page.copy)}</p>
        <div class="fit-grid"><span>4 min</span><span>Calm pace</span><span>Pointing question</span></div>
      </div>
      <div class="alternative-list"><button>Moon Blanket</button><button>Quiet Forest</button></div>
      ${primaryActions(page)}
      </section>${bottomNav("Story")}`;
  },
  player(page) {
    return html`${topBar(page, "child")}
      <section class="screen-content player-layout">
        ${stateBanner(page)}
        <div class="story-stage" role="img" aria-label="${escapeText(page.illustration)}">
          <div class="sun"></div><div class="hill"></div><div class="character-dot"></div>
        </div>
        <div class="progress-dots" aria-label="Story progress"><span></span><span class="is-active"></span><span></span><span></span></div>
        <button class="giant-play" data-action="next" aria-label="Play or pause story">Play</button>
        <button class="parent-gate">Parent controls</button>
      </section>`;
  },
  complete(page) {
    return html`${topBar(page, "child")}
      <section class="screen-content complete-layout">
        ${stateBanner(page)}
        <div class="ending-scene"><strong>Story complete</strong><span>The fox found the quiet light.</span></div>
        <h2>How did the fox feel?</h2>
        <div class="answer-grid"><button>Calm</button><button>Curious</button><button>Sleepy</button><button>Proud</button></div>
        ${primaryActions(page)}
      </section>`;
  },
  nextChoice(page) {
    return html`${topBar(page)}
      <section class="screen-content next-layout">
        ${stateBanner(page)}
        <h2>Choose the next safe step</h2>
        <div class="decision-board">
          <article><strong>The Little Rain Drum</strong><span>4 minutes - calm</span><button>Start now</button></article>
          <article class="quiet"><strong>Save for tomorrow</strong><span>No autoplay after story</span><button data-action="next">Save for later</button></article>
          <article><strong>Bedtime path</strong><span>Dim screen and end cleanly</span><button>Start bedtime</button></article>
        </div>
      </section>${bottomNav("Home")}`;
  },
  dailyTask(page) {
    return html`${topBar(page)}
      <section class="screen-content task-layout">
        ${stateBanner(page)}
        <div class="task-card">
          <span class="timer">3 min</span>
          <h2>Rain sound hunt</h2>
          <p>${escapeText(page.copy)}</p>
        </div>
        <ol class="step-list"><li>Find one soft object.</li><li>Ask the sound question.</li><li>Let the child point or answer.</li></ol>
        ${primaryActions(page)}
      </section>${bottomNav("Task")}`;
  },
  interaction(page) {
    return html`${topBar(page)}
      <section class="screen-content interaction-layout">
        ${stateBanner(page)}
        <div class="role-panel parent-role"><h2>Parent prompt</h2><p>${escapeText(page.copy)}</p></div>
        <div class="role-panel child-role"><h2>Child choices</h2><button>Soft</button><button>Loud</button><button>Pointed only</button></div>
        <label class="note-card">Private parent note <textarea aria-label="Private parent note">Mia pointed to the soft cloth.</textarea></label>
        ${primaryActions(page)}
      </section>${bottomNav("Task")}`;
  },
  dashboard(page) {
    return html`${topBar(page)}
      <section class="screen-content dashboard-layout">
        ${stateBanner(page)}
        <h2>Mia's week</h2>
        <div class="metric-grid"><article><strong>4</strong><span>calm listens</span></article><article><strong>2</strong><span>pointing answers</span></article></div>
        <div class="signal-card"><strong>Observed pattern</strong><p>${escapeText(page.copy)}</p></div>
        <div class="privacy-shortcuts"><button>Export data</button><button>Delete profile</button><button data-action="next">Start bedtime</button></div>
      </section>${bottomNav("Parent")}`;
  },
  bedtime(page) {
    return html`${topBar(page)}
      <section class="screen-content bedtime-layout">
        ${stateBanner(page)}
        <div class="night-scene"><div class="moon"></div><strong>Bedtime mode</strong></div>
        <h2>One calm story. Then lights down.</h2>
        <div class="duration-picker"><button>3 min</button><button class="selected">5 min</button><button>8 min</button></div>
        <p>${escapeText(page.copy)}</p>
        ${primaryActions(page)}
      </section>`;
  }
};

function renderIndex(activePage) {
  pageIndex.innerHTML = pages.map((page) => `<button class="${page.id === activePage.id ? "is-active" : ""}" data-page="${page.id}">
    <span>${page.id}</span><strong>${escapeText(page.title)}</strong><em>${escapeText(page.layoutFamily)}</em>
  </button>`).join("");
  flowIndex.innerHTML = flows.map((flow) => `<button data-flow="${flow.id}">
    <strong>Flow ${flow.id}: ${escapeText(flow.name)}</strong>
    <span>${flow.pages.join(" -> ")}</span>
  </button>`).join("");
}

function renderStateControls(page) {
  stateControls.innerHTML = Object.keys(page.states).map((state) => `<button class="${state === activeState ? "is-active" : ""}" data-state="${state}">${state}</button>`).join("");
}

function renderQa(page) {
  const items = [
    ["User goal", page.userGoal],
    ["Primary CTA", page.primaryCTA],
    ["Layout family", page.layoutFamily],
    ["API", page.api],
    ["Accessibility", page.accessibility],
    ["Child safety", page.childSafety],
    ["Animation", page.animation],
    ["Responsive", page.responsive]
  ];
  qaEvidence.innerHTML = items.map(([term, desc]) => `<dt>${term}</dt><dd>${escapeText(desc)}</dd>`).join("");
  traceability.innerHTML = [
    `${page.id} -> ${page.route}`,
    `${page.id} -> renderer:${page.renderer}`,
    `${page.id} -> CTA:${page.primaryCTA}`,
    `${page.id} -> tests:${page.testIds.join(", ")}`
  ].map((item) => `<li>${escapeText(item)}</li>`).join("");
}

function render() {
  const page = currentPage();
  const renderer = renderers[page.renderer];
  screenTitle.textContent = `${page.id} - ${page.title}`;
  screenRoot.className = `screen-root renderer-${page.renderer} state-${activeState}`;
  screenRoot.innerHTML = renderer(page);
  renderIndex(page);
  renderStateControls(page);
  renderQa(page);
}

document.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-page]");
  const stateButton = event.target.closest("[data-state]");
  const actionButton = event.target.closest("[data-action]");
  const flowButton = event.target.closest("[data-flow]");
  const deviceButton = event.target.closest("[data-device]");
  const page = currentPage();

  if (pageButton) goTo(pageButton.dataset.page);
  if (stateButton) {
    activeState = stateButton.dataset.state;
    render();
  }
  if (actionButton?.dataset.action === "next") goTo(nextPageId(page.id));
  if (actionButton?.dataset.action === "previous") goTo(previousPageId(page.id));
  if (flowButton) goTo(flows.find((flow) => flow.id === flowButton.dataset.flow).pages[0]);
  if (deviceButton) {
    document.querySelectorAll("[data-device]").forEach((button) => button.classList.remove("is-active"));
    deviceButton.classList.add("is-active");
    deviceFrame.className = `device-frame ${deviceButton.dataset.device}`;
    if (deviceButton.dataset.device === "keyboard-mode") screenRoot.focus();
  }
});

window.addEventListener("hashchange", () => {
  activeState = "default";
  render();
});

window.futureLightPrototype = { pages, flows, designSystem };
render();
