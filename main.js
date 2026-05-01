const DINNER_MENUS = [
  { name: "김치찌개", emoji: "🍲" }, { name: "된장찌개", emoji: "🍲" }, { name: "순두부찌개", emoji: "🍲" },
  { name: "부대찌개", emoji: "🍲" }, { name: "삼겹살", emoji: "🥓" }, { name: "불고기", emoji: "🍖" },
  { name: "제육볶음", emoji: "🍖" }, { name: "돈까스", emoji: "🍛" }, { name: "치킨", emoji: "🍗" },
  { name: "닭갈비", emoji: "🍗" }, { name: "비빔밥", emoji: "🥗" }, { name: "돌솥비빔밥", emoji: "🥗" },
  { name: "김밥", emoji: "🍙" }, { name: "라면", emoji: "🍜" }, { name: "짜장면", emoji: "🍜" },
  { name: "짬뽕", emoji: "🍜" }, { name: "볶음밥", emoji: "🍚" }, { name: "오므라이스", emoji: "🍳" },
  { name: "카레", emoji: "🍛" }, { name: "햄버거", emoji: "🍔" }, { name: "피자", emoji: "🍕" },
  { name: "샌드위치", emoji: "🥪" }, { name: "샐러드", emoji: "🥗" }, { name: "쌀국수", emoji: "🍜" },
  { name: "우동", emoji: "🍜" }, { name: "소바", emoji: "🍜" }, { name: "초밥", emoji: "🍣" },
  { name: "회덮밥", emoji: "🍣" }, { name: "떡볶이", emoji: "🌶️" }, { name: "순대", emoji: "🌭" },
  { name: "튀김", emoji: "🍤" }, { name: "닭강정", emoji: "🍗" }, { name: "갈비탕", emoji: "🍲" },
  { name: "설렁탕", emoji: "🍲" }, { name: "곰탕", emoji: "🍲" }, { name: "냉면", emoji: "🍜" },
  { name: "밀면", emoji: "🍜" }, { name: "파스타", emoji: "🍝" }, { name: "리조또", emoji: "🍚" },
  { name: "샤브샤브", emoji: "🍲" }, { name: "족발", emoji: "🍖" }, { name: "보쌈", emoji: "🍖" },
  { name: "칼국수", emoji: "🍜" }, { name: "잔치국수", emoji: "🍜" }, { name: "오징어볶음", emoji: "🦑" },
  { name: "낙지볶음", emoji: "🐙" }, { name: "고등어구이", emoji: "🐟" }, { name: "연어덮밥", emoji: "🍣" },
  { name: "덮밥", emoji: "🍚" }
];

const SEARCH_RADIUS_METERS = 1500;
const MAX_RESULTS = 6;

const state = { lastMenu: "", selectedMenu: null };

const ui = {
  result: () => document.getElementById("result"),
  emoji: () => document.getElementById("emoji"),
  nearby: () => document.getElementById("nearby-result"),
  nearbyBtn: () => document.getElementById("find-nearby-btn"),
};

function recommendMenu() {
  const candidates = DINNER_MENUS.filter((menu) => menu.name !== state.lastMenu);
  const selected = candidates[Math.floor(Math.random() * candidates.length)];

  state.lastMenu = selected.name;
  state.selectedMenu = selected;

  renderMenu(selected);
}

function renderMenu(menu) {
  const resultEl = ui.result();
  const emojiEl = ui.emoji();
  const nearbyEl = ui.nearby();
  const nearbyBtnEl = ui.nearbyBtn();

  if (!resultEl || !emojiEl) return;

  resultEl.style.opacity = "0";
  emojiEl.style.transform = "scale(0.5)";

  setTimeout(() => {
    resultEl.textContent = menu.name;
    emojiEl.textContent = menu.emoji;
    resultEl.style.opacity = "1";
    emojiEl.style.transform = "scale(1)";
  }, 100);

  if (nearbyBtnEl) nearbyBtnEl.disabled = false;
  if (nearbyEl) nearbyEl.innerHTML = "<p>👇 내 위치 기반으로 주변 저녁 맛집을 찾아보세요.</p>";
}

function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function directionsUrl(name) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
}

async function fetchPlaces(menuName, lat, lng) {
  const query = `
    [out:json][timeout:20];
    (
      node(around:${SEARCH_RADIUS_METERS},${lat},${lng})["amenity"~"restaurant|fast_food|cafe"];
      way(around:${SEARCH_RADIUS_METERS},${lat},${lng})["amenity"~"restaurant|fast_food|cafe"];
    );
    out center tags;
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: query,
  });

  if (!response.ok) throw new Error("주변 가게 데이터를 불러오지 못했습니다.");

  const data = await response.json();
  const keyword = menuName.toLowerCase();

  return (data.elements || [])
    .map((el) => {
      const placeLat = el.lat ?? el.center?.lat;
      const placeLng = el.lon ?? el.center?.lon;
      if (!placeLat || !placeLng) return null;

      const name = el.tags?.name || "이름 없는 가게";
      const cuisine = el.tags?.cuisine || "";
      const score = `${name} ${cuisine}`.toLowerCase().includes(keyword) ? 1000 : 0;

      return {
        id: `${el.type}-${el.id}`,
        name,
        type: cuisine || el.tags?.amenity || "restaurant",
        distance: distanceMeters(lat, lng, placeLat, placeLng),
        score,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b.score - a.score) || (a.distance - b.distance))
    .slice(0, MAX_RESULTS);
}

function renderPlaces(menuName, places, lat, lng) {
  const nearbyEl = ui.nearby();
  if (!nearbyEl) return;

  if (!places.length) {
    nearbyEl.innerHTML = `<p><strong>${menuName}</strong> 관련 주변 가게를 찾지 못했어요.</p>`;
    return;
  }

  nearbyEl.innerHTML = `
    <p><strong>${menuName}</strong> 기준 추천 ${places.length}곳 (반경 ${(SEARCH_RADIUS_METERS / 1000).toFixed(1)}km)</p>
    <div class="place-cards">
      ${places.map((place) => `
        <article class="place-card">
          <h4>${place.name}</h4>
          <p>유형: ${place.type}</p>
          <p>거리: 약 ${Math.round(place.distance)}m</p>
          <a href="${directionsUrl(place.name)}" target="_blank" rel="noopener noreferrer">길찾기</a>
        </article>
      `).join("")}
    </div>
    <small>내 위치: ${lat.toFixed(5)}, ${lng.toFixed(5)}</small>
  `;
}

function findNearbyRestaurants() {
  const nearbyEl = ui.nearby();
  if (!state.selectedMenu) {
    if (nearbyEl) nearbyEl.innerHTML = "<p>먼저 저녁 메뉴 추천을 받아주세요.</p>";
    return;
  }

  if (!navigator.geolocation) {
    if (nearbyEl) nearbyEl.innerHTML = "<p>이 브라우저는 위치 정보를 지원하지 않습니다.</p>";
    return;
  }

  if (nearbyEl) nearbyEl.innerHTML = "<p>현재 위치와 주변 가게를 검색 중입니다...</p>";

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        const places = await fetchPlaces(state.selectedMenu.name, coords.latitude, coords.longitude);
        renderPlaces(state.selectedMenu.name, places, coords.latitude, coords.longitude);
      } catch (error) {
        if (nearbyEl) nearbyEl.innerHTML = `<p>${error.message || "검색 중 오류가 발생했습니다."}</p>`;
      }
    },
    (error) => {
      const messageByCode = {
        1: "위치 권한이 거부되었습니다. 브라우저 권한을 허용해주세요.",
        2: "위치 정보를 찾을 수 없습니다.",
        3: "위치 정보 확인 시간이 초과되었습니다.",
      };
      const message = messageByCode[error.code] || "위치 정보를 가져오는 중 오류가 발생했습니다.";
      if (nearbyEl) nearbyEl.innerHTML = `<p>${message}</p>`;
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}