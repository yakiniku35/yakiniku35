/* =========================================================
   Peter Chiu 自我介紹網站 第二版 - 互動腳本
   功能：
   1. 背景星塵 (canvas)
   2. 標題字母逐一落下
   3. PRESS START → 切到選單畫面
   4. 指令選單（滑鼠 / 鍵盤 ↑↓ Enter）
   5. 對話框打字機效果
   6. 狀態頁血條動畫
   ========================================================= */

// 使用者如果在系統設定「減少動態效果」，打字機等動畫就直接跳到結果
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. 背景星塵 ---------- */
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
let stars = [];

function makeStars() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const count = Math.floor((canvas.width * canvas.height) / 14000); // 畫面越大星星越多
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() < 0.85 ? 1 : 2,        // 大多是 1px，少數 2px
      speed: 0.08 + Math.random() * 0.25,        // 往上飄的速度
      phase: Math.random() * Math.PI * 2,        // 閃爍的起始相位
      gold: Math.random() < 0.12,                // 少數幾顆是金色的
    });
  }
}
function drawStars(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const s of stars) {
    // 用 sin 讓亮度忽明忽暗
    const alpha = 0.35 + 0.65 * Math.abs(Math.sin(t / 900 + s.phase));
    ctx.fillStyle = s.gold ? `rgba(227,191,95,${alpha})` : `rgba(245,241,230,${alpha * 0.8})`;
    ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size); // 取整數讓它保持像素感
    s.y -= s.speed;
    if (s.y < -2) { s.y = canvas.height + 2; s.x = Math.random() * canvas.width; }
  }
  if (!reduceMotion) requestAnimationFrame(drawStars);
}
makeStars();
drawStars(0);
window.addEventListener("resize", makeStars);

/* ---------- 2. 標題字母逐一落下 ---------- */
const titleName = document.getElementById("title-name");
const letters = titleName.textContent.split("");
titleName.textContent = "";
letters.forEach((ch, i) => {
  const span = document.createElement("span");
  span.textContent = ch;
  span.style.setProperty("--i", i);          // CSS 用這個數字算延遲
  if (ch === " ") span.classList.add("space");
  titleName.appendChild(span);
});

/* ---------- 3. PRESS START ---------- */
const titleScreen = document.getElementById("title");
const menuScreen = document.getElementById("menu");
let started = false;

function startGame() {
  if (started) return;
  started = true;
  titleScreen.classList.add("is-leaving");
  setTimeout(() => {
    titleScreen.hidden = true;
    menuScreen.hidden = false;
    selectCommand("status");                 // 預設先顯示「狀態」
    document.querySelector(".cmd__item.is-active").focus({ preventScroll: true });
  }, reduceMotion ? 0 : 500);
}
document.getElementById("start").addEventListener("click", startGame);
titleScreen.addEventListener("click", startGame);
window.addEventListener("keydown", (e) => {
  if (!started && !e.metaKey && !e.ctrlKey && !e.altKey) startGame();
}, { once: false });

/* ---------- 4. 指令選單 ---------- */
const cmdItems = Array.from(document.querySelectorAll(".cmd__item"));
const panels = Array.from(document.querySelectorAll(".panel"));

// 每個指令對應的對話內容，點對話框會一句一句看下去
const lines = {
  status: [
    "你好，我是 Peter Chiu。來自台北的 Mobile 開發見習生。",
    "目前 Lv 5：寫程式大概五年，還在持續升級中。",
    "左邊的選單可以看看我的技能、作品和興趣。",
  ],
  skill: [
    "這些是目前學到的技能。星星越多代表越熟。",
    "JavaScript 還在習得中，這個網站就是練習的一部分。",
  ],
  item: [
    "道具欄裡放的是我做過的東西。",
    "數量標 ×? 的還在製作中，之後會補上。",
  ],
  party: [
    "我的夥伴：さくらみこ。",
    "看 hololive 直播是我回血的方式。にぇ！",
  ],
  talk: [
    "想聊程式、Mobile 開發或 hololive，都可以找我。",
    "點上面的連結就能聯絡到我。",
  ],
};

let currentCmd = null;

function selectCommand(cmd) {
  // 更新左側游標
  cmdItems.forEach((li) => {
    const active = li.dataset.cmd === cmd;
    li.classList.toggle("is-active", active);
    li.tabIndex = active ? 0 : -1;
  });
  if (cmd === currentCmd) return;
  currentCmd = cmd;

  // 切換右側內容；重新加 class 讓 panel-in 動畫再跑一次
  panels.forEach((p) => {
    const show = p.dataset.panel === cmd;
    p.hidden = !show;
    if (show) { p.style.animation = "none"; void p.offsetWidth; p.style.animation = ""; }
  });

  // 狀態頁：讓血條長出來
  if (cmd === "status") {
    document.querySelectorAll(".gauge").forEach((g) => {
      const fill = g.querySelector(".gauge__fill");
      fill.style.width = "0";
      setTimeout(() => { fill.style.width = g.dataset.value + "%"; }, 150);
    });
  }

  // 對話框從第一句開始
  startDialog(lines[cmd]);
}

// 滑鼠：移過去就移動游標，點下去就決定
cmdItems.forEach((li) => {
  li.addEventListener("mouseenter", () => selectCommand(li.dataset.cmd));
  li.addEventListener("click", () => selectCommand(li.dataset.cmd));
  li.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectCommand(li.dataset.cmd); }
  });
});

// 鍵盤：↑↓ 移動游標
window.addEventListener("keydown", (e) => {
  if (!started) return;
  if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
  e.preventDefault();
  const idx = cmdItems.findIndex((li) => li.classList.contains("is-active"));
  const next = (idx + (e.key === "ArrowDown" ? 1 : -1) + cmdItems.length) % cmdItems.length;
  selectCommand(cmdItems[next].dataset.cmd);
  cmdItems[next].focus({ preventScroll: true });
});

/* ---------- 5. 對話框打字機 ---------- */
const dialogEl = document.getElementById("dialog");
const dialogText = document.getElementById("dialog-text");
const dialogNext = document.getElementById("dialog-next");
let dialogLines = [];
let lineIndex = 0;
let typing = false;
let typeTimer = null;

function startDialog(arr) {
  dialogLines = arr;
  lineIndex = 0;
  typeLine(dialogLines[0]);
}

function typeLine(text) {
  clearTimeout(typeTimer);
  dialogNext.classList.remove("is-on");
  dialogText.textContent = "";
  if (reduceMotion) { dialogText.textContent = text; dialogNext.classList.add("is-on"); return; }

  typing = true;
  let i = 0;
  function step() {
    i++;
    dialogText.textContent = text.slice(0, i);
    if (i < text.length) {
      // 遇到標點停久一點，讀起來比較有節奏
      const ch = text[i - 1];
      const pause = "，。、！？：".includes(ch) ? 220 : 45;
      typeTimer = setTimeout(step, pause);
    } else {
      typing = false;
      dialogNext.classList.add("is-on");
    }
  }
  step();
}

function advanceDialog() {
  if (typing) {
    // 還在打字時點一下 → 直接顯示整句（老遊戲都這樣）
    clearTimeout(typeTimer);
    typing = false;
    dialogText.textContent = dialogLines[lineIndex];
    dialogNext.classList.add("is-on");
    return;
  }
  lineIndex = (lineIndex + 1) % dialogLines.length;
  typeLine(dialogLines[lineIndex]);
}
dialogEl.addEventListener("click", advanceDialog);
dialogEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); advanceDialog(); }
});
