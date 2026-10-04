/* =========================================================
   Peter Chiu 自我介紹網站 - 互動腳本
   這裡有四個小功能，每個都盡量寫得簡單好懂：
   1. Hero 打字效果
   2. 導覽列捲動後變毛玻璃
   3. 元素捲到畫面時淡入 (IntersectionObserver)
   4. 技能進度條長出來
   ========================================================= */

// ---------- 1. 打字效果 ----------
// 會輪流打出這幾句話，可以自己改內容
const phrases = [
  "Mobile 開發學習者",
  "Python / Java / JavaScript",
  "來自台北的工程師新手",
  "oshi is SAKURA MIKO 🌸",
];
const typingEl = document.getElementById("typing");
let phraseIndex = 0;   // 現在是第幾句
let charIndex = 0;     // 現在打到第幾個字
let deleting = false;  // 目前是在「打字」還是「刪字」

function typeLoop() {
  const current = phrases[phraseIndex];

  if (!deleting) {
    // 打字：多顯示一個字
    charIndex++;
    typingEl.textContent = current.slice(0, charIndex);
    if (charIndex === current.length) {
      // 整句打完，停一下再開始刪
      deleting = true;
      setTimeout(typeLoop, 1600);
      return;
    }
    setTimeout(typeLoop, 70);
  } else {
    // 刪字：少顯示一個字
    charIndex--;
    typingEl.textContent = current.slice(0, charIndex);
    if (charIndex === 0) {
      // 刪光了，換下一句
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(typeLoop, 300);
      return;
    }
    setTimeout(typeLoop, 35);
  }
}
typeLoop();

// ---------- 2. 導覽列捲動效果 ----------
const nav = document.getElementById("nav");
function onScroll() {
  // 捲超過 20px 就加上 class，CSS 會負責變成毛玻璃
  nav.classList.toggle("nav--scrolled", window.scrollY > 20);
}
window.addEventListener("scroll", onScroll);
onScroll();

// ---------- 3. 捲動淡入 ----------
// IntersectionObserver 會在元素「進入畫面」時通知我們
const revealEls = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");

        // ---------- 4. 技能進度條 ----------
        // 如果這個元素是技能列，就把進度條的寬度設成 data-level
        if (entry.target.classList.contains("skill")) {
          const level = entry.target.dataset.level;       // 例如 "75"
          const fill = entry.target.querySelector(".skill__fill");
          fill.style.width = level + "%";
        }

        // 出現過一次就不用再觀察了
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 } // 元素露出 15% 就算進入畫面
);
revealEls.forEach((el) => observer.observe(el));

// ---------- 頁尾年份 ----------
document.getElementById("year").textContent = new Date().getFullYear();
