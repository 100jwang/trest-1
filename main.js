const DINNER_MENUS = [
  { name: "김치찌개", emoji: "🍲", keyword: "kimchi-jjigae" }, { name: "된장찌개", emoji: "🍲", keyword: "soybean-paste-stew" }, { name: "순두부찌개", emoji: "🍲", keyword: "soft-tofu-stew" },
  { name: "부대찌개", emoji: "🍲", keyword: "army-stew" }, { name: "삼겹살", emoji: "🥓", keyword: "pork-belly" }, { name: "불고기", emoji: "🍖", keyword: "bulgogi" },
  { name: "제육볶음", emoji: "🍖", keyword: "spicy-pork" }, { name: "돈까스", emoji: "🍛", keyword: "tonkatsu" }, { name: "치킨", emoji: "🍗", keyword: "fried-chicken" },
  { name: "닭갈비", emoji: "🍗", keyword: "dakgalbi" }, { name: "비빔밥", emoji: "🥗", keyword: "bibimbap" }, { name: "돌솥비빔밥", emoji: "🥗", keyword: "dolsot-bibimbap" },
  { name: "김밥", emoji: "🍙", keyword: "gimbap" }, { name: "라면", emoji: "🍜", keyword: "ramen" }, { name: "짜장면", emoji: "🍜", keyword: "jajangmyeon" },
  { name: "짬뽕", emoji: "🍜", keyword: "jjampong" }, { name: "볶음밥", emoji: "🍚", keyword: "fried-rice" }, { name: "오므라이스", emoji: "🍳", keyword: "omurice" },
  { name: "카레", emoji: "🍛", keyword: "curry" }, { name: "햄버거", emoji: "🍔", keyword: "hamburger" }, { name: "피자", emoji: "🍕", keyword: "pizza" },
  { name: "샌드위치", emoji: "🥪", keyword: "sandwich" }, { name: "샐러드", emoji: "🥗", keyword: "salad" }, { name: "쌀국수", emoji: "🍜", keyword: "pho" },
  { name: "우동", emoji: "🍜", keyword: "udon" }, { name: "소바", emoji: "🍜", keyword: "soba" }, { name: "초밥", emoji: "🍣", keyword: "sushi" },
  { name: "회덮밥", emoji: "🍣", keyword: "raw-fish-bowl" }, { name: "떡볶이", emoji: "🌶️", keyword: "tteokbokki" }, { name: "순대", emoji: "🌭", keyword: "korean-blood-sausage" },
  { name: "튀김", emoji: "🍤", keyword: "tempura" }, { name: "닭강정", emoji: "🍗", keyword: "sweet-spicy-chicken" }, { name: "갈비탕", emoji: "🍲", keyword: "galbitang" },
  { name: "설렁탕", emoji: "🍲", keyword: "seolleongtang" }, { name: "곰탕", emoji: "🍲", keyword: "gomtang" }, { name: "냉면", emoji: "🍜", keyword: "naengmyeon" },
  { name: "밀면", emoji: "🍜", keyword: "milmyeon" }, { name: "파스타", emoji: "🍝", keyword: "pasta" }, { name: "리조또", emoji: "🍚", keyword: "risotto" },
  { name: "샤브샤브", emoji: "🍲", keyword: "shabu-shabu" }, { name: "족발", emoji: "🍖", keyword: "jokbal" }, { name: "보쌈", emoji: "🍖", keyword: "bossam" },
  { name: "칼국수", emoji: "🍜", keyword: "kalguksu" }, { name: "잔치국수", emoji: "🍜", keyword: "janchi-guksu" }, { name: "오징어볶음", emoji: "🦑", keyword: "spicy-squid" },
  { name: "낙지볶음", emoji: "🐙", keyword: "spicy-octopus" }, { name: "고등어구이", emoji: "🐟", keyword: "grilled-mackerel" }, { name: "연어덮밥", emoji: "🍣", keyword: "salmon-donburi" },
  { name: "덮밥", emoji: "🍚", keyword: "rice-bowl" }
];

const SEARCH_RADIUS_METERS = 1500;
const MAX_RESULTS = 6;
const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";

const state = { lastMenu: "", selectedMenu: null };

const ui = {
  result: () => document.getElementById("result"),
  emoji: () => document.getElementById("emoji"),
  nearby: () => document.getElementById("nearby-result"),
  nearbyBtn: () => document.getElementById("find-nearby-btn"),
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

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
  emojiEl.style.opacity = "0";
  emojiEl.style.transform = "scale(0.8)";

  // Using LoremFlickr for food images based on keyword
  const imageUrl = `https://loremflickr.com/400/300/food,${menu.keyword || 'dish'}/all`;

  setTimeout(() => {
    resultEl.textContent = menu.name;
    emojiEl.innerHTML = `<img src="${imageUrl}" alt="${menu.name}" class="food-img" onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(menu.name)}'; this.onerror=null;">`;
    
    resultEl.style.opacity = "1";
    emojiEl.style.opacity = "1";
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

  const response = await fetch(OVERPASS_API_URL, {
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
    nearbyEl.innerHTML = `<p><strong>${escapeHtml(menuName)}</strong> 관련 주변 가게를 찾지 못했어요.</p>`;
    return;
  }

  nearbyEl.innerHTML = `
    <p><strong>${escapeHtml(menuName)}</strong> 기준 추천 ${places.length}곳 (반경 ${(SEARCH_RADIUS_METERS / 1000).toFixed(1)}km)</p>
    <div class="place-cards">
      ${places.map((place) => `
        <article class="place-card">
          <h4>${escapeHtml(place.name)}</h4>
          <p>유형: ${escapeHtml(place.type)}</p>
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
        const fallbackUrl = directionsUrl(`${state.selectedMenu.name} 맛집`);
        if (nearbyEl) {
          nearbyEl.innerHTML = `<p>${escapeHtml(error.message || "검색 중 오류가 발생했습니다.")}</p>
          <p><a href="${fallbackUrl}" target="_blank" rel="noopener noreferrer">지도에서 ${escapeHtml(state.selectedMenu.name)} 맛집 검색하기</a></p>`;
        }
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