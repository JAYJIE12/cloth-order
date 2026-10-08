const STORAGE_KEY = "cloth-order-v01";

const COLOR_PROFILE = {
  season: "夏季冷柔型",
  short: "夏冷柔",
  english: "Summer Soft",
  confidence: 86,
  undertone: "冷调",
  brightness: 72,
  saturation: 35,
  contrast: 42,
  recommended: [
    { name: "冷白", hex: "#EDECEB" },
    { name: "雾霾蓝", hex: "#8CA5BC" },
    { name: "灰紫", hex: "#9E98B4" },
    { name: "莓果红", hex: "#A96378" },
    { name: "浅灰", hex: "#B5B6BD" },
  ],
  careful: [
    { name: "橙黄", hex: "#DA9A4A" },
    { name: "土黄", hex: "#B6975C" },
    { name: "暖棕", hex: "#956A55" },
  ],
};

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

const QUIZ = [
  {
    eyebrow: "第一个线索",
    title: "哪种首饰更能让你的肤色显得干净？",
    description: "凭直觉选择即可。没有绝对正确答案，我们会把它当作一个颜色线索。",
    options: [
      { symbol: "◌", title: "银色 / 铂金", text: "清冷、利落、显气色", value: "cool" },
      { symbol: "●", title: "金色 / 香槟金", text: "温暖、柔和、显光泽", value: "warm" },
      { symbol: "◐", title: "都可以", text: "我不太确定", value: "neutral" },
      { symbol: "✦", title: "没注意过", text: "跳过这个线索", value: "skip" },
    ],
  },
  {
    eyebrow: "第二个线索",
    title: "穿哪一种白色时，你看起来更有精神？",
    description: "可以想一想自己穿衬衫、T 恤或连衣裙的感觉。",
    options: [
      { symbol: "□", title: "纯白 / 冷白", text: "更清爽、肤色更透亮", value: "cool" },
      { symbol: "◒", title: "米白 / 奶油白", text: "更柔和、不显蜡黄", value: "warm" },
      { symbol: "◈", title: "浅灰白", text: "最安全、最自在", value: "soft" },
      { symbol: "?", title: "我不确定", text: "跳过这个线索", value: "skip" },
    ],
  },
  {
    eyebrow: "第三个线索",
    title: "你穿深色和浅色，哪一种更衬你？",
    description: "选择让面部轮廓更清晰、肤色更均匀的一边。",
    options: [
      { symbol: "●", title: "浅色更好", text: "柔和、轻盈的色彩", value: "light" },
      { symbol: "■", title: "深色更好", text: "有对比度的深色", value: "deep" },
      { symbol: "◑", title: "中间色更好", text: "灰、蓝、雾感色系", value: "soft" },
      { symbol: "?", title: "看情况", text: "不同场合不同", value: "skip" },
    ],
  },
  {
    eyebrow: "最后一个线索",
    title: "你最常收到哪一种颜色的夸奖？",
    description: "请选择让你最有自信的那一类颜色。",
    options: [
      { symbol: "◌", title: "灰蓝 / 薰衣草紫", text: "轻柔、偏冷的颜色", value: "cool-soft" },
      { symbol: "●", title: "焦糖 / 橄榄绿", text: "自然、偏暖的颜色", value: "warm-soft" },
      { symbol: "◆", title: "正红 / 宝蓝", text: "清晰、饱和的颜色", value: "bright" },
      { symbol: "?", title: "还没有发现", text: "之后可以从衣柜反馈中学习", value: "skip" },
    ],
  },
];

let state = loadState();
let currentView = state.profile ? "today" : "landing";
let quizIndex = 0;
let quizAnswers = [];
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
  app.focus({ preventScroll: true });
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
          <span class="eyebrow">你的当季穿衣助手</span>
          <h1>今天穿什么，<br><em>不用再想。</em></h1>
          <p class="lead">从你的个人色彩、现在会穿的衣服和天气开始，每天给你一套恰到好处的答案。</p>
          <div class="hero-actions">
            <button class="button button-primary" data-action="start-quiz">免费测试我的颜色 <span>→</span></button>
            <button class="button button-secondary" data-action="open-demo">看看效果</button>
          </div>
          <p class="landing-note">约 2 分钟 · 不需要上传照片 · 结果仅保存在当前设备</p>
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
          <div class="hero-match"><div class="match-ring"><span>91</span></div><div><b>很适合你今天的颜色</b><small>通勤 · 18–25℃ · 阴天</small></div></div>
        </div>
      </div>
      <div class="steps">
        <article class="step"><span class="step-number">01</span><h3>认识你</h3><p>用几道直觉题，建立可持续调整的个人色彩参考。</p></article>
        <article class="step"><span class="step-number">02</span><h3>认识衣柜</h3><p>先上传最近会穿的 10–20 件，不用一次整理所有衣服。</p></article>
        <article class="step"><span class="step-number">03</span><h3>每天帮你选</h3><p>结合天气与反馈，给出一套真正会穿出门的搭配。</p></article>
      </div>
    </section>`;
}

function renderQuiz() {
  const question = QUIZ[quizIndex];
  const answer = quizAnswers[quizIndex];
  const isLast = quizIndex === QUIZ.length - 1;
  return `
    <section class="page quiz-wrap">
      <div class="quiz-head">
        <button class="back-button" data-action="quiz-back">← ${quizIndex === 0 ? "返回首页" : "上一题"}</button>
        <div class="quiz-progress"><span style="width:${((quizIndex + 1) / QUIZ.length) * 100}%"></span></div>
        <span class="quiz-step">${String(quizIndex + 1).padStart(2, "0")} / ${String(QUIZ.length).padStart(2, "0")}</span>
      </div>
      <div class="quiz-card">
        <span class="eyebrow">${question.eyebrow}</span>
        <h1>${question.title}</h1>
        <p>${question.description}</p>
        <div class="question-options">
          ${question.options.map((option, index) => `
            <button class="question-option ${answer === index ? "selected" : ""}" data-action="select-answer" data-index="${index}">
              <span class="option-symbol">${option.symbol}</span>
              <span><strong>${option.title}</strong><small>${option.text}</small></span>
            </button>`).join("")}
        </div>
        <div class="quiz-footer"><button class="button button-primary" ${answer === undefined ? "disabled" : ""} data-action="quiz-next">${isLast ? "查看我的结果" : "下一题"} <span>→</span></button></div>
      </div>
      <p class="quiz-privacy">这是一份穿衣颜色参考，不替代专业个人色彩诊断。</p>
    </section>`;
}

function renderResult() {
  const p = COLOR_PROFILE;
  return `
    <section class="page color-result">
      <div class="result-heading"><span class="eyebrow">你的 Personal Color</span><h1>你是 <em>${p.season}</em></h1><p>偏冷、低饱和的颜色会让肤色更清透。把它当作穿衣的起点，而不是限制。</p></div>
      <div class="result-main">
        <article class="season-card"><span class="season-caption">PERSONAL COLOR / 01</span><h2>${p.english}</h2><p>柔雾感的冷色、低对比度搭配，是你最不费力的好气色。</p><span class="confidence">匹配参考度 ${p.confidence}%</span></article>
        <article class="card result-data"><h3>你的色彩关键词</h3>
          <div class="metric-row"><span>冷暖</span><div class="metric-line"><span style="width:72%"></span></div><b>${p.undertone}</b></div>
          <div class="metric-row"><span>明度</span><div class="metric-line"><span style="width:${p.brightness}%"></span></div><b>中高</b></div>
          <div class="metric-row"><span>饱和度</span><div class="metric-line"><span style="width:${p.saturation}%"></span></div><b>柔和</b></div>
          <div class="metric-row"><span>对比度</span><div class="metric-line"><span style="width:${p.contrast}%"></span></div><b>偏低</b></div>
          <div class="result-palette"><h4>先从这些颜色开始</h4><div class="palette-large">${p.recommended.map((c) => colorFor(c.hex)).join("")}</div></div>
          <div class="recommendation-note">试试让一套搭配里有 2–3 个相近明度的冷色，效果往往比“高饱和撞色”更自然。</div>
        </article>
      </div>
      <div class="result-action"><button class="button button-primary" data-action="continue-closet">分析我的衣柜 <span>→</span></button></div>
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
  const hasClothes = state.closet.length > 0;
  const top = state.closet.find((item) => item.type === "上装") || DEMO_CLOTHES[0];
  const bottom = state.closet.find((item) => item.type === "下装") || DEMO_CLOTHES[3];
  const altTop = state.closet.filter((item) => item.type === "上装")[1] || DEMO_CLOTHES[6];
  const altBottom = state.closet.filter((item) => item.type === "下装")[1] || DEMO_CLOTHES[7];
  return [
    { label: "首选", score: hasClothes ? 91 : 88, name: `${top.name} × ${bottom.name}`, note: weather.note, main: top, secondary: bottom, bg: weather.bg },
    { label: "更休闲", score: hasClothes ? 86 : 84, name: `${altTop.name} × ${altBottom.name}`, note: "轻松但不随意", main: altTop, secondary: altBottom, bg: "#E4E9EC" },
    { label: "更利落", score: hasClothes ? 83 : 81, name: "冷白上衣 × 深灰下装", note: "干净、低对比度", main: DEMO_CLOTHES[1], secondary: DEMO_CLOTHES[2], bg: "#EDE9E4" },
  ];
}

function renderToday() {
  if (!state.profile) return renderLanding();
  const weather = weatherData();
  const looks = outfits();
  const current = looks[selectedOutfit];
  const feedback = state.feedback.today;
  return `
    <section class="page">
      <header class="page-header"><div><span class="eyebrow">DAILY EDIT</span><h1>今天，穿这一套。</h1><p class="subcopy">${state.closet.length ? "从你的当季衣柜里，挑出一个不用犹豫的答案。" : "先用示例搭配看看产品效果；添加衣物后会换成你的衣柜。"}</p></div></header>
      <div class="dashboard-grid">
        <section class="card today-hero">
          <div class="weather-strip"><div class="weather-place"><strong>${weather.city}</strong>${weather.day}</div><div class="weather-main"><span class="weather-icon">${weather.icon}</span><div><strong>${weather.temp}</strong><span>${weather.note}</span></div></div><button class="weather-control" data-action="change-weather">模拟天气</button></div>
          <h2 class="today-title">${weather.title}</h2><p class="today-subtitle">${current.label}建议 · ${current.score}% 色彩与天气匹配</p>
          <div class="outfit-card" style="background:${current.bg}"><div class="outfit-card-main">${garment(current.main, "large")}</div><div class="outfit-meta"><span class="match-line">MATCH ${current.score}%</span><h3>${esc(current.name)}</h3><p>和你的 ${COLOR_PROFILE.short} 相衬，也符合今天的温度与场合。</p><div class="outfit-actions"><button class="button button-primary button-small" data-action="wear-this">${feedback === "wear" ? "已记录 ✓" : "就穿这套"}</button><button class="button button-secondary button-small" data-action="show-alternatives">换一套</button></div></div></div>
        </section>
        <aside class="side-stack">
          <section class="card insight-card"><h2>当季衣柜</h2><p>不需要一次整理全部衣服。先补齐最近会穿的就够了。</p><div class="closet-progress"><div class="progress-ring" style="--progress:${Math.min(state.closet.length / 15 * 100, 100)}%"><span>${state.closet.length}/15</span></div><div><strong>${state.closet.length >= 10 ? "已经足够开始推荐" : "再加几件就更准"}</strong><p>${state.closet.length >= 10 ? "你的夏秋衣柜已可用。" : `建议再添加 ${Math.max(0, 10 - state.closet.length)} 件常穿单品。`}</p></div></div><button class="text-button" data-view="closet">管理我的衣柜 →</button></section>
          <section class="card color-mini"><div class="color-mini-top"><span class="season-pill"><i class="season-dot"></i>${COLOR_PROFILE.short}</span><button class="text-button" data-view="profile">查看</button></div><h3>今天的颜色方向</h3><p>雾霾蓝、冷白、浅灰，都是很稳的选择。</p><div class="swatches">${COLOR_PROFILE.recommended.slice(0,5).map((c) => colorFor(c.hex)).join("")}</div></section>
          <section class="tip"><b>小提示</b><br>${state.closet.length ? "你今天选择“就穿这套”后，明天的推荐会更懂你。" : "上传衣服时不必拍得完美；先记录颜色和类别即可。"}</section>
        </aside>
      </div>
      <section class="outfit-ideas"><div class="section-title-row"><h2>再给我两个选择</h2><button class="text-button" data-action="show-alternatives">刷新推荐 →</button></div><div class="mini-outfits">${looks.slice(1).map((look, index) => `<button class="mini-outfit" data-action="select-outfit" data-index="${index + 1}"><div class="mini-look" style="background:${look.bg}"><span>${look.main.icon || iconFor(look.main.type)}</span></div><strong>${look.label}</strong><small>${look.score}% 匹配 · ${esc(look.note)}</small></button>`).join("")}</div></section>
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
  if (!state.profile) {
    return `<section class="page"><header class="page-header"><div><span class="eyebrow">PERSONAL COLOR</span><h1>我的颜色</h1></div></header><div class="card profile-empty"><div class="empty-icon">✦</div><h2>还没有你的色彩参考</h2><p>完成一个 2 分钟的小测试，找到更衬你的颜色方向。</p><button class="button button-primary" data-action="start-quiz">开始测试</button></div></section>`;
  }
  const p = COLOR_PROFILE;
  const tag = (item) => `<span class="color-tag"><span style="background:${item.hex}"></span>${item.name}</span>`;
  return `
    <section class="page"><header class="page-header"><div><span class="eyebrow">PERSONAL COLOR</span><h1>我的颜色</h1><p class="subcopy">这是穿衣参考，会随着你实际喜欢的搭配慢慢变得更懂你。</p></div><button class="button button-secondary button-small" data-action="restart-quiz">重新测试</button></header>
      <div class="profile-layout"><article class="profile-season"><span class="season-pill"><i class="season-dot"></i>你的结果</span><h2>${p.season}</h2><p>柔和的冷色比浓烈的暖色更容易带来干净、均匀的肤色观感。</p><p>当前参考度：${p.confidence}%</p></article><article class="card profile-details"><h2>你的色彩轮廓</h2><div class="metric-row"><span>冷暖</span><div class="metric-line"><span style="width:72%"></span></div><b>冷调</b></div><div class="metric-row"><span>明度</span><div class="metric-line"><span style="width:72%"></span></div><b>中高</b></div><div class="metric-row"><span>饱和度</span><div class="metric-line"><span style="width:35%"></span></div><b>偏低</b></div><h3>推荐优先尝试</h3><div class="color-tags">${p.recommended.map(tag).join("")}</div><h3>可谨慎尝试</h3><div class="color-tags">${p.careful.map(tag).join("")}</div></article></div>
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
  if (action === "start-quiz" || action === "restart-quiz") { quizIndex = 0; quizAnswers = []; currentView = "quiz"; render(); }
  if (action === "open-demo") { state.profile = COLOR_PROFILE; state.closet = DEMO_CLOTHES.map((item) => ({ ...item })); saveState(); currentView = "today"; render(); showToast("已载入演示衣柜"); }
  if (action === "select-answer") { quizAnswers[quizIndex] = Number(element.dataset.index); render(); }
  if (action === "quiz-back") { if (quizIndex === 0) { currentView = "landing"; } else { quizIndex -= 1; } render(); }
  if (action === "quiz-next") { if (quizAnswers[quizIndex] === undefined) return; if (quizIndex < QUIZ.length - 1) { quizIndex += 1; currentView = "quiz"; } else { currentView = "result"; } render(); }
  if (action === "continue-closet") { state.profile = COLOR_PROFILE; saveState(); currentView = "closet"; render(); showToast("你的色彩参考已保存到本设备"); }
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

