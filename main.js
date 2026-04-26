const menus = [
  {name: "김치찌개", emoji: "🍲"},
  {name: "된장찌개", emoji: "🍲"},
  {name: "순두부찌개", emoji: "🍲"},
  {name: "부대찌개", emoji: "🍲"},
  {name: "삼겹살", emoji: "🥓"},
  {name: "불고기", emoji: "🍖"},
  {name: "제육볶음", emoji: "🍖"},
  {name: "돈까스", emoji: "🍛"},
  {name: "치킨", emoji: "🍗"},
  {name: "닭갈비", emoji: "🍗"},
  {name: "비빔밥", emoji: "🥗"},
  {name: "돌솥비빔밥", emoji: "🥗"},
  {name: "김밥", emoji: "🍙"},
  {name: "라면", emoji: "🍜"},
  {name: "짜장면", emoji: "🍜"},
  {name: "짬뽕", emoji: "🍜"},
  {name: "볶음밥", emoji: "🍚"},
  {name: "오므라이스", emoji: "🍳"},
  {name: "카레", emoji: "🍛"},
  {name: "햄버거", emoji: "🍔"},
  {name: "피자", emoji: "🍕"},
  {name: "샌드위치", emoji: "🥪"},
  {name: "샐러드", emoji: "🥗"},
  {name: "쌀국수", emoji: "🍜"},
  {name: "우동", emoji: "🍜"},
  {name: "소바", emoji: "🍜"},
  {name: "초밥", emoji: "🍣"},
  {name: "회덮밥", emoji: "🍣"},
  {name: "떡볶이", emoji: "🌶️"},
  {name: "순대", emoji: "🌭"},
  {name: "튀김", emoji: "🍤"},
  {name: "닭강정", emoji: "🍗"},
  {name: "갈비탕", emoji: "🍲"},
  {name: "설렁탕", emoji: "🍲"},
  {name: "곰탕", emoji: "🍲"},
  {name: "냉면", emoji: "🍜"},
  {name: "밀면", emoji: "🍜"},
  {name: "파스타", emoji: "🍝"},
  {name: "리조또", emoji: "🍚"},
  {name: "샤브샤브", emoji: "🍲"},
  {name: "족발", emoji: "🍖"},
  {name: "보쌈", emoji: "🍖"},
  {name: "칼국수", emoji: "🍜"},
  {name: "잔치국수", emoji: "🍜"},
  {name: "오징어볶음", emoji: "🦑"},
  {name: "낙지볶음", emoji: "🐙"},
  {name: "고등어구이", emoji: "🐟"},
  {name: "연어덮밥", emoji: "🍣"},
  {name: "덮밥", emoji: "🍚"}
];

function recommendMenu() {
  const random = Math.floor(Math.random() * menus.length);
  document.getElementById("result").innerText = menus[random].name;
  document.getElementById("emoji").innerText = menus[random].emoji;
}

function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById("theme-btn");
  
  if (body.getAttribute("data-theme") === "dark") {
    body.removeAttribute("data-theme");
    btn.innerText = "🌙 다크 모드";
  } else {
    body.setAttribute("data-theme", "dark");
    btn.innerText = "☀️ 라이트 모드";
  }
}
