function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById("theme-btn");
  
  if (body.getAttribute("data-theme") === "dark") {
    body.removeAttribute("data-theme");
    if (btn) btn.innerText = "🌙 다크 모드";
    localStorage.setItem("theme", "light");
  } else {
    body.setAttribute("data-theme", "dark");
    if (btn) btn.innerText = "☀️ 라이트 모드";
    localStorage.setItem("theme", "dark");
  }
}

// 초기 테마 로드
(function() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.setAttribute("data-theme", "dark");
    window.addEventListener('DOMContentLoaded', () => {
      const btn = document.getElementById("theme-btn");
      if (btn) btn.innerText = "☀️ 라이트 모드";
    });
  }
})();
