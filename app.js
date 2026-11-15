const STORAGE_KEY = "cloth-order-v01";


const DEMO_CLOTHES = [
  { id: "d1", name: "雾霾蓝衬衫", type: "上装", color: "#8CA5BC", temp: "20–27℃", icon: "♧" },
  { id: "d2", name: "冷白短袖", type: "上装", color: "#E8E8E6", temp: "24–32℃", icon: "♧" },
  { id: "d3", name: "深灰西裤", type: "下装", color: "#53565F", temp: "18–27℃", icon: "⌁" },
  { id: "d4", name: "浅灰直筒裤", type: "下装", color: "#B8BAC0", temp: "18–28℃", icon: "⌁" },
  { id: "d5", name: "冷白运动鞋", type: "鞋履", color: "#F0EFED", temp: "16–32℃", icon: "⌂" },
  { id: "d6", name: "灰蓝针织衫", type: "上装", color: "#718FA8", temp: "16–23℃", icon: "♧" },
  { id: "d7", name: "莓果色针织", type: "上装", color: "#A96378", temp: "17–25℃", icon: "♧" },
  { id: "d8", name: "深蓝牛仔裤", type: "下装", color: "#43576C", temp: "16–27℃", icon: "⌁" },
  { id: "d9", name: "轻薄风衣", type: "外套", color: "#A4AAB0", temp: "14–22℃", icon: "♧" },
  { id: "d10", name: "灰紫半裙", type: "下装", color: "#9E98B4", temp: "18–27℃", icon: "⌁" },
];


let state = loadState();
let currentView = state.profile ? "today" : "landing";
let quizIndex = 0;
let quizAnswers = [];
let quizReturnView = "landing";
let closetFilter = "全部";
let toastTimer;
let selectedOutfit = 0;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      profile: saved?.profile || null,
      closet: Array.isArray(saved?.closet) ? saved.closet : [],
      feedback: saved?.feedback || {},
      weatherMode: saved?.weatherMode || "mild",
    };
  } catch {
    return { profile: null, closet: [], feedback: {}, weatherMode: "mild" };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function esc(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" })[char]);
}

function colorFor(hex) {
  return `<span class="swatch" style="background:${hex}" aria-hidden="true"></span>`;
}

function garment(item, className = "") {
  const visual = item.image
    ? `<img src="${item.image}" alt="${esc(item.name)}" />`
    : `<span class="garment-icon" aria-hidden="true">${item.icon || iconFor(item.type)}</span>`;
  return `<div class="garment ${className}" style="background:${item.color}">${visual}<span class="garment-label">${esc(item.name)}</span></div>`;
}

function iconFor(type) {
  return type === "下装" ? "⌁" : type === "鞋履" ? "⌂" : type === "配饰" ? "◌" : "♧";
}

function render() {
  const app = document.querySelector("#app");
  app.innerHTML = {
    landing: renderLanding,
    quiz: renderQuiz,
    result: renderResult,
    today: renderToday,
    closet: renderCloset,
    profile: renderProfile,
  }[currentView]();
  syncNavigation();
  bindEvents();
  const quizHeading = app.querySelector("[data-quiz-heading]");
  if (quizHeading) quizHeading.focus();
  else app.focus({ preventScroll: true });
}

function syncNavigation() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === currentView);
  });
  document.querySelector("#topbar").style.opacity = currentView === "quiz" ? ".35" : "1";
}

function renderLanding() {
  return `
    <section class="page landing">
      <div class="landing-hero">
        <div>
          <span class="eyebrow">V0.2 · 你的当季穿衣助手</span>
          <h1>今天穿什么，<br><em>不用再想。</em></h1>
          <p class="lead">从你的个人色彩、现在会穿的衣服和天气开始，每天给你一套恰到好处的答案。</p>
          <div class="hero-actions">
            <button class="button button-primary" data-action="start-quiz">开始颜色测试 <span aria-hidden="true">→</span></button>
            <button class="button button-secondary" data-action="open-demo">看看效果</button>
          </div>
          <p class="landing-note">约 1–2 分钟 · 无需自拍 · 结果保存在此浏览器</p>
        </div>
        <div class="hero-card" aria-label="今日穿搭示例">
          <div class="hero-card-top"><span>今日推荐</span><span class="weather-mini">☁ 22° · 微凉</span></div>
          <div class="outfit-preview">
            ${garment({ name: "雾霾蓝衬衫", color: "#91A8BF", icon: "♧" }, "large")}
            <div class="bottom-piece">
              ${garment({ name: "浅灰直筒裤", color: "#B9BAC0", icon: "⌁" })}
              ${garment({ name: "冷白运动鞋", color: "#E8E8E5", icon: "⌂" })}
            </div>
          </div>
          <div class="hero-match"><div><b>雾霾蓝配浅灰</b><small>通勤 · 18–25℃ · 阴天</small></div></div>
        </div>
      </div>
      <div class="steps">
        <article class="step"><span class="step-number">01</span><h3>认识你</h3><p>对比 6 组服装色卡，找到可以先试穿的颜色。</p></article>
        <article class="step"><span class="step-number">02</span><h3>认识衣柜</h3><p>先上传最近会穿的 10–20 件，不用一次整理所有衣服。</p></article>
        <article class="step"><span class="step-number">03</span><h3>每天帮你选</h3><p>结合天气与反馈，给出一套真正会穿出门的搭配。</p></article>
      </div>
    </section>`;
}

function renderQuiz() {
  const question = COLOR_QUESTIONS[quizIndex];
  const answer = quizAnswers[quizIndex];
  const step = quizIndex + 1;
  const total = COLOR_QUESTIONS.length;
  const choice = (index, label, hex) => `
    <button type="button" class="quiz-choice ${hex ? "quiz-color-choice" : "quiz-unsure"}"
      aria-pressed="${answer === index}" data-action="select-answer" data-index="${index}">
      ${hex ? `<span class="quiz-swatch" style="--swatch:${hex}" aria-hidden="true"></span>` : ""}
      <span class="quiz-choice-label">${label}<span class="quiz-check" aria-hidden="true">✓</span></span>
    </button>`;

  return `
    <section class="page quiz-wrap">
      <div class="quiz-head">
        <button class="back-button" data-action="quiz-back">← ${quizIndex === 0 ? "退出测试" : "上一题"}</button>
        <progress class="quiz-progress" value="${step}" max="${total}" aria-label="测试进度"></progress>
        <span class="quiz-step" id="quiz-step">第 ${step} / ${total} 题</span>
      </div>
      <div class="quiz-card">
        <h1 tabindex="-1" data-quiz-heading aria-describedby="quiz-step">穿在脸附近时，哪种颜色更衬你？</h1>
        <p>想想穿类似颜色时的样子。如果两种感觉差不多，可以选「看不出差别」。</p>
        <div class="quiz-choices" role="group" aria-label="选择一项">
          ${question.options.map(([name, hex], index) => choice(index, name, hex)).join("")}
          ${choice(question.options.length, "看不出差别")}
        </div>
        <div class="quiz-footer">
          <button class="button button-primary" ${answer === undefined ? "disabled" : ""} data-action="quiz-next">
            ${step === total ? "查看结果" : "下一题"} <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>`;
}

function renderPalette(colors) {
  return `<ul class="color-palette">${colors.map(([name, hex]) =>
    `<li>${colorFor(hex)}<span>${name}</span></li>`).join("")}</ul>`;
}

function renderColorSummary(profile) {
  const { name, tip, colors } = colorPalette(profile);
  const tested = profile.kind === "color-test-v2";
  return `
    <div class="result-heading">
      <span class="eyebrow">${tested ? "个人色彩 · 穿衣参考" : "示例色卡"}</span>
      <h1 tabindex="-1" data-quiz-heading>${name}</h1>
      <p>${tested ? "这是根据你选择的颜色整理出的穿衣参考。" : "完成测试后，就能看到根据你的答题生成的色卡。"}</p>
    </div>
    <div class="result-main">
      <article class="card result-data">
        <h2>${tested ? "你的答题线索" : "色彩方向"}</h2>
        <dl class="color-reasons">${Object.entries(COLOR_AXES).map(([axis, { name, choices }]) =>
          `<div><dt>${name}</dt><dd>${tested ? colorAnswerReason(profile, axis) : choices[profile[axis]]}</dd></div>`).join("")}</dl>
      </article>
      <article class="card result-data">
        <h2>可以先试这 5 个颜色</h2>
        ${renderPalette(colors)}
        <p class="recommendation-note">${tip}</p>
      </article>
    </div>`;
}

function renderResult() {
  return `
    <section class="page color-result">
      ${renderColorSummary(state.profile)}
      <div class="result-action">
        <button class="button button-primary" data-action="continue-closet">进入我的衣柜 <span aria-hidden="true">→</span></button>
        <button class="button button-secondary" data-action="restart-quiz">重新测试</button>
      </div>
    </section>`;
}

function weatherData() {
  return {
    mild: { city: "上海", day: "周四，10 月 8 日", icon: "☁", temp: "22°", note: "18–25° · 阴", title: "微凉，适合有层次的轻搭配", bg: "#E9E3ED" },
    warm: { city: "上海", day: "周四，10 月 8 日", icon: "☀", temp: "28°", note: "24–30° · 晴", title: "天气偏暖，穿得轻一点", bg: "#EFE0CC" },
    cool: { city: "上海", day: "周四，10 月 8 日", icon: "☂", temp: "16°", note: "13–17° · 小雨", title: "降温有雨，别忘了加一层", bg: "#DCE6ED" },
  }[state.weatherMode];
}

function outfits() {
  const weather = weatherData();
  const top = state.closet.find((item) => item.type === "上装") || DEMO_CLOTHES[0];
  const bottom = state.closet.find((item) => item.type === "下装") || DEMO_CLOTHES[3];
  const altTop = state.closet.filter((item) => item.type === "上装")[1] || DEMO_CLOTHES[6];
  const altBottom = state.closet.filter((item) => item.type === "下装")[1] || DEMO_CLOTHES[7];
  return [
    { label: "首选", name: `${top.name} × ${bottom.name}`, note: weather.note, main: top, secondary: bottom, bg: weather.bg },
    { label: "更休闲", name: `${altTop.name} × ${altBottom.name}`, note: "轻松但不随意", main: altTop, secondary: altBottom, bg: "#E4E9EC" },
    { label: "更利落", name: "冷白上衣 × 深灰下装", note: "干净、低对比度", main: DEMO_CLOTHES[1], secondary: DEMO_CLOTHES[2], bg: "#EDE9E4" },
  ];
}

function renderToday() {
  if (!state.profile) return renderLanding();
  const weather = weatherData();
  const looks = outfits();
  const current = looks[selectedOutfit];
  const feedback = state.feedback.today;
  const { profile } = state;
  const hasPalette = profile.kind === "color-test-v2" || profile.kind === "demo";
  const palette = hasPalette ? colorPalette(profile) : null;
  return `
    <section class="page">
      <header class="page-header"><div><span class="eyebrow">DAILY EDIT</span><h1>今天，穿这一套。</h1><p class="subcopy">${state.closet.length ? "从你的当季衣柜里，挑出一个不用犹豫的答案。" : "先用示例搭配看看产品效果；添加衣物后会换成你的衣柜。"}</p></div></header>
      <div class="dashboard-grid">
        <section class="card today-hero">
          <div class="weather-strip"><div class="weather-place"><strong>${weather.city}</strong>${weather.day}</div><div class="weather-main"><span class="weather-icon">${weather.icon}</span><div><strong>${weather.temp}</strong><span>${weather.note}</span></div></div><button class="weather-control" data-action="change-weather">模拟天气</button></div>
          <h2 class="today-title">${weather.title}</h2><p class="today-subtitle">${current.label}建议</p>
          <div class="outfit-card" style="background:${current.bg}"><div class="outfit-card-main">${garment(current.main, "large")}</div><div class="outfit-meta"><h3>${esc(current.name)}</h3><p>${esc(current.note)}</p><div class="outfit-actions"><button class="button button-primary button-small" data-action="wear-this">${feedback === "wear" ? "已记录 ✓" : "就穿这套"}</button><button class="button button-secondary button-small" data-action="show-alternatives">换一套</button></div></div></div>
        </section>
        <aside class="side-stack">
          <section class="card insight-card"><h2>当季衣柜</h2><p>不需要一次整理全部衣服。先补齐最近会穿的就够了。</p><div class="closet-progress"><div class="progress-ring" style="--progress:${Math.min(state.closet.length / 15 * 100, 100)}%"><span>${state.closet.length}/15</span></div><div><strong>${state.closet.length >= 10 ? "已经足够开始推荐" : "再加几件就更准"}</strong><p>${state.closet.length >= 10 ? "你的夏秋衣柜已可用。" : `建议再添加 ${Math.max(0, 10 - state.closet.length)} 件常穿单品。`}</p></div></div><button class="text-button" data-view="closet">管理我的衣柜 →</button></section>
          <section class="card color-mini"><div class="color-mini-top"><h2>穿衣色卡</h2><button class="text-button" data-view="profile">查看我的颜色</button></div>${palette ? `<p>${profile.kind === "demo" ? "示例 · " : ""}${palette.name}</p>${renderPalette(palette.colors)}` : `<p>完成新版测试后，这里会显示你的推荐色。</p><button class="text-button" data-action="start-quiz">重新测试 →</button>`}</section>
          <section class="tip"><b>小提示</b><br>${state.closet.length ? "你今天选择“就穿这套”后，明天的推荐会更懂你。" : "上传衣服时不必拍得完美；先记录颜色和类别即可。"}</section>
        </aside>
      </div>
      <section class="outfit-ideas"><div class="section-title-row"><h2>再给我两个选择</h2><button class="text-button" data-action="show-alternatives">刷新推荐 →</button></div><div class="mini-outfits">${looks.slice(1).map((look, index) => `<button class="mini-outfit" data-action="select-outfit" data-index="${index + 1}"><div class="mini-look" style="background:${look.bg}"><span>${look.main.icon || iconFor(look.main.type)}</span></div><strong>${look.label}</strong><small>${esc(look.note)}</small></button>`).join("")}</div></section>
    </section>`;
}

function renderCloset() {
  if (!state.profile) return renderLanding();
  const categories = ["全部", "上装", "下装", "外套", "鞋履", "配饰"];
  const items = closetFilter === "全部" ? state.closet : state.closet.filter((item) => item.type === closetFilter);
  const count = (type) => state.closet.filter((item) => item.type === type).length;
  return `
    <section class="page"><header class="page-header"><div><span class="eyebrow">ACTIVE CLOSET</span><h1>我的当季衣柜</h1><p class="subcopy">只放现在会穿的。天气变了，再慢慢添加下一波。</p></div><div class="closet-header-actions"><button class="button button-secondary button-small" data-action="add-demo">添加示例</button><button class="button button-primary button-small" data-action="open-add">＋ 添加衣服</button></div></header>
      <div class="filter-row">${categories.map((category) => `<button class="filter-chip ${closetFilter === category ? "active" : ""}" data-action="filter-closet" data-filter="${category}">${category}${category === "全部" ? ` · ${state.closet.length}` : ""}</button>`).join("")}</div>
      <div class="closet-layout"><div class="closet-grid">${items.length ? items.map((item) => `<article class="closet-item" style="background:${item.color}">${item.image ? `<img src="${item.image}" alt="${esc(item.name)}" />` : `<span class="garment-icon">${item.icon || iconFor(item.type)}</span>`}<div class="item-info"><strong>${esc(item.name)}</strong><small>${esc(item.type)} · ${esc(item.temp)}</small></div><button class="delete-item" aria-label="删除 ${esc(item.name)}" title="删除" data-action="delete-item" data-id="${item.id}">×</button></article>`).join("") : `<div class="empty-closet"><div class="empty-icon">▦</div><h2>先从最近会穿的开始</h2><p>建议先添加 5–8 件上装、3–5 件下装和 2–4 双鞋。达到 10 件，就能生成更像你的搭配。</p><button class="button button-primary button-small" data-action="open-add">添加第一件衣服</button></div>`}</div>
      <aside class="card closet-aside"><h2>衣柜进度</h2><p>当季 10–20 件常穿单品，就足够给出高质量的每日建议。</p><div class="closet-progress"><div class="progress-ring" style="--progress:${Math.min(state.closet.length / 15 * 100, 100)}%"><span>${state.closet.length}/15</span></div><div><strong>${state.closet.length >= 10 ? "可以开始穿搭" : "正在建立中"}</strong><p>${state.closet.length >= 10 ? "已具备推荐基础。" : "不追求一次完成。"}</p></div></div><div class="category-summary"><div class="category-line"><span>上装</span><b>${count("上装")}</b></div><div class="category-line"><span>下装</span><b>${count("下装")}</b></div><div class="category-line"><span>外套</span><b>${count("外套")}</b></div><div class="category-line"><span>鞋履</span><b>${count("鞋履")}</b></div></div></aside></div>
    </section>`;
}

function renderProfile() {
  const { profile } = state;
  if (profile?.kind === "color-test-v2" || profile?.kind === "demo") {
    return `<section class="page color-result">
      ${renderColorSummary(profile)}
      <div class="result-action"><button class="button button-secondary" data-action="restart-quiz">重新测试</button></div>
    </section>`;
  }

  return `<section class="page color-result">
    <header class="page-header"><div><h1>我的颜色</h1></div></header>
    <div class="card profile-empty">
      <h2>${profile ? "新版颜色测试已上线" : "还没有你的穿衣色卡"}</h2>
      <p>${profile ? "完成 6 道色卡对比题，就能更新你的个人色彩结果。" : "比较 6 组服装颜色，看看哪些颜色可以先试穿。"}</p>
      <button class="button button-primary" data-action="start-quiz">${profile ? "重新测试" : "开始颜色测试"}</button>
    </div>
  </section>`;
}

function addClothingModal() {
  const root = document.querySelector("#modal-root");
  root.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="add-title" data-modal-content>
      <div class="modal-head"><div><h2 id="add-title">添加一件衣服</h2><p>先记录基础信息即可。之后可接入 AI 图片识别自动补全。</p></div><button class="close-modal" data-action="close-modal" aria-label="关闭">×</button></div>
      <label class="upload-zone" id="upload-zone"><input type="file" id="cloth-image" accept="image/*" /><div class="upload-text"><div class="upload-icon">↥</div><strong>上传衣服照片（可选）</strong><span>正面、单件、自然光会更利于识别</span></div></label>
      <form id="add-clothing-form"><div class="form-grid"><div class="form-field"><label for="cloth-name">名称</label><input id="cloth-name" name="name" placeholder="如：雾霾蓝衬衫" required /></div><div class="form-field"><label for="cloth-type">类别</label><select id="cloth-type" name="type"><option>上装</option><option>下装</option><option>外套</option><option>鞋履</option><option>配饰</option></select></div><div class="form-field"><label>主色</label><div class="tone-picker">${["#E8E8E6", "#8CA5BC", "#9E98B4", "#A96378", "#53565F", "#B6975C", "#6F907B"].map((color, index) => `<label class="tone-choice" style="background:${color}" title="${color}"><input type="radio" name="color" value="${color}" ${index === 0 ? "checked" : ""} /></label>`).join("")}</div></div><div class="form-field"><label for="cloth-temp">适宜温度</label><select id="cloth-temp" name="temp"><option>24–32℃</option><option selected>18–27℃</option><option>14–22℃</option><option>8–16℃</option></select></div></div><div class="modal-actions"><button type="button" class="button button-secondary button-small" data-action="close-modal">取消</button><button type="submit" class="button button-primary button-small">添加到衣柜</button></div><p class="modal-note">照片只用于当前窗口预览；添加后仅保存衣物的基础标签，不会上传或保存图片。</p></form>
    </section></div>`;
  document.querySelector("#cloth-image").addEventListener("change", previewImage);
  document.querySelector("#add-clothing-form").addEventListener("submit", submitClothing);
}

function previewImage(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const zone = document.querySelector("#upload-zone");
  const existing = zone.querySelector(".upload-preview");
  if (existing) existing.remove();
  const image = document.createElement("img");
  image.className = "upload-preview";
  image.src = URL.createObjectURL(file);
  image.alt = "衣服预览";
  zone.appendChild(image);
  zone.classList.add("has-image");
}

function submitClothing(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const preview = document.querySelector(".upload-preview");
  const item = {
    id: `c-${Date.now()}`,
    name: form.get("name"),
    type: form.get("type"),
    color: form.get("color"),
    temp: form.get("temp"),
    icon: iconFor(form.get("type")),
  };
  state.closet.unshift(item);
  saveState();
  closeModal();
  render();
  showToast("已添加到当季衣柜");
}

function weatherModal() {
  const options = [
    ["mild", "☁", "微凉", "18–25℃ · 阴"],
    ["warm", "☀", "偏暖", "24–30℃ · 晴"],
    ["cool", "☂", "有雨降温", "13–17℃ · 小雨"],
  ];
  document.querySelector("#modal-root").innerHTML = `<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" data-modal-content><div class="modal-head"><div><h2>模拟今日天气</h2><p>V0.1 使用本地天气状态；接入天气服务后会自动更新。</p></div><button class="close-modal" data-action="close-modal" aria-label="关闭">×</button></div><div class="question-options" style="margin-top:24px">${options.map(([id, icon, title, note]) => `<button class="question-option ${state.weatherMode === id ? "selected" : ""}" data-action="set-weather" data-weather="${id}"><span class="option-symbol">${icon}</span><span><strong>${title}</strong><small>${note}</small></span></button>`).join("")}</div></section></div>`;
}

function closeModal() { document.querySelector("#modal-root").innerHTML = ""; }

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => { currentView = button.dataset.view; render(); }));
  document.querySelectorAll("[data-action]").forEach((element) => element.addEventListener("click", (event) => handleAction(event, element)));
}

function handleAction(event, element) {
  const action = element.dataset.action;
  if (action === "close-modal") {
    if (element.classList.contains("modal-backdrop") && event.target !== element) return;
    if (element.hasAttribute("data-modal-content")) return;
    closeModal();
  }
  if (action === "go-home") { currentView = state.profile ? "today" : "landing"; render(); }
  if (action === "start-quiz" || action === "restart-quiz") {
    quizReturnView = currentView;
    quizIndex = 0;
    quizAnswers = [];
    currentView = "quiz";
    render();
  }
  if (action === "open-demo") {
    if (!state.profile) {
      state.profile = { kind: "demo", warmth: "cool", clarity: "soft" };
      if (!state.closet.length) state.closet = DEMO_CLOTHES.map((item) => ({ ...item }));
      saveState();
    }
    currentView = "today";
    render();
    showToast("正在查看穿搭示例");
  }
  if (action === "select-answer") {
    quizAnswers[quizIndex] = Number(element.dataset.index);
    document.querySelectorAll(".quiz-choice").forEach((button) => {
      button.setAttribute("aria-pressed", String(button === element));
    });
    document.querySelector('[data-action="quiz-next"]').disabled = false;
  }
  if (action === "quiz-back") {
    if (quizIndex === 0) currentView = quizReturnView;
    else quizIndex -= 1;
    render();
  }
  if (action === "quiz-next") {
    if (quizAnswers[quizIndex] === undefined) return;
    if (quizIndex + 1 < COLOR_QUESTIONS.length) {
      quizIndex += 1;
    } else {
      state.profile = scoreColorTest(quizAnswers);
      saveState();
      currentView = "result";
    }
    render();
  }
  if (action === "continue-closet") {
    currentView = "closet";
    window.scrollTo(0, 0);
    render();
  }
  if (action === "open-add") addClothingModal();
  if (action === "add-demo") { state.closet = [...DEMO_CLOTHES.map((item) => ({ ...item })), ...state.closet]; saveState(); render(); showToast("已添加 10 件示例单品"); }
  if (action === "filter-closet") { closetFilter = element.dataset.filter; render(); }
  if (action === "delete-item") { state.closet = state.closet.filter((item) => item.id !== element.dataset.id); saveState(); render(); showToast("已从衣柜移除"); }
  if (action === "change-weather") weatherModal();
  if (action === "set-weather") { state.weatherMode = element.dataset.weather; saveState(); closeModal(); render(); showToast("今日天气已更新"); }
  if (action === "wear-this") { state.feedback.today = "wear"; saveState(); render(); showToast("记下了，明天会继续参考你的选择"); }
  if (action === "show-alternatives") { selectedOutfit = (selectedOutfit + 1) % outfits().length; render(); }
  if (action === "select-outfit") { selectedOutfit = Number(element.dataset.index); render(); window.scrollTo({ top: 0, behavior: "smooth" }); }
}

render();
