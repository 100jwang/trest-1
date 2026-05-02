// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyB7NNikor31mGA6eQs2v6c5_MSm-oxBSrc",
  authDomain: "sec-challenge-a7593.firebaseapp.com",
  projectId: "sec-challenge-a7593",
  storageBucket: "sec-challenge-a7593.firebasestorage.app",
  messagingSenderId: "469668720550",
  appId: "1:469668720550:web:aadf6d03f73fa5fa6ee967",
  measurementId: "G-MK41YJBYXJ"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const articleListEl = document.getElementById('article-list');
const modal = document.getElementById('article-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');
const filterBtns = document.querySelectorAll('.filter-btn');

let allArticles = [];

// 초기 데이터 (애드센스용 고품질 콘텐츠)
const INITIAL_CONTENT = [
  {
    title: "생성형 AI의 미래: 텍스트를 넘어 멀티모달 시대로",
    category: "IT",
    date: new Date('2026-05-01'),
    content: `최근 인공지능 기술의 발전은 눈부신 속도로 이루어지고 있습니다. 특히 ChatGPT로 대표되는 생성형 AI는 이제 단순한 텍스트 답변을 넘어 이미지, 오디오, 비디오를 동시에 이해하고 생성하는 '멀티모달(Multimodal)' 기술로 진화하고 있습니다.\n\n이러한 변화는 우리의 업무 방식에 어떤 영향을 미칠까요? 첫째, 디자인과 영상 제작의 문턱이 낮아질 것입니다. 둘째, 데이터 분석에 있어 시각적 정보와 수치 데이터를 통합적으로 처리하여 더욱 정교한 의사결정을 도울 것입니다. 인공지능은 이제 도구를 넘어 협업 파트너로서 자리매김하고 있습니다.`
  },
  {
    title: "간헐적 단식, 건강에 정말 효과가 있을까? 과학적 분석",
    category: "건강",
    date: new Date('2026-04-30'),
    content: `체중 감량과 건강 증진을 위해 많은 이들이 선택하는 간헐적 단식. 최근 연구 결과에 따르면, 단순히 칼로리를 줄이는 것보다 '먹는 시간'을 조절하는 것이 신진대사에 더 큰 긍정적 영향을 줄 수 있다고 합니다.\n\n단식 기간 동안 우리 몸은 '오토파지(Autophagy)'라는 과정을 거치게 됩니다. 이는 세포 내의 노폐물을 제거하고 스스로 재생하는 과정으로, 노화 방지와 면역력 강화에 도움을 줍니다. 하지만 개인의 건강 상태에 따라 부작용이 있을 수 있으므로 전문가와 상의 후 시작하는 것이 중요합니다.`
  },
  {
    title: "화성 거주 프로젝트: 인류는 정말 지구 밖에서 살 수 있을까?",
    category: "과학",
    date: new Date('2026-04-29'),
    content: `스페이스X와 NASA를 중심으로 화성 유인 탐사 프로젝트가 속도를 내고 있습니다. 하지만 화성 거주를 위해서는 해결해야 할 난제들이 산적해 있습니다. 가장 큰 문제는 방사선 노출과 낮은 기압, 그리고 극심한 온도 차이입니다.\n\n과학자들은 화성의 토양을 이용한 벽돌 제작 기술과 대기 중의 이산화탄소를 산소로 변환하는 장치 등을 연구하며 자급자족 가능한 생태계를 설계하고 있습니다. 인류의 두 번째 고향을 찾기 위한 여정은 이제 막 시작되었습니다.`
  },
  {
    title: "2026년 글로벌 경제 전망: 금리와 물가의 상관관계",
    category: "시사",
    date: new Date('2026-04-28'),
    content: `세계 경제는 여전히 고금리와 물가 상승이라는 두 마리 토끼를 잡기 위해 고군분투하고 있습니다. 중앙은행들의 통화 정책은 각국의 환율과 직결되며, 이는 곧 소비자 물가와 기업 투자 심리에 큰 영향을 미칩니다.\n\n특히 공급망 재편과 디지털 화폐(CBDC)의 도입 논의는 향후 10년의 경제 흐름을 결정지을 중요한 변수입니다. 경제 상식을 넓히는 것은 단순한 지식을 넘어 개인의 자산 관리와 미래 설계를 위한 필수 조건이 되었습니다.`
  },
  {
    title: "디지털 헬스케어의 핵심, 웨어러블 기기의 진화",
    category: "건강",
    date: new Date('2026-04-27'),
    content: `스마트 워치를 통해 혈압과 심전도를 측정하는 것이 일상이 된 시대입니다. 디지털 헬스케어는 이제 사후 치료에서 예방 의학으로 중심축이 이동하고 있습니다.\n\n수집된 데이터는 빅데이터와 결합하여 개인 맞춤형 건강 관리를 가능케 합니다. 예를 들어, 당뇨 환자의 혈당 수치를 실시간으로 모니터링하여 위험 상황을 미리 알리거나 적절한 식단을 제안하는 방식입니다. 기술이 인간의 생명을 연장하고 삶의 질을 높이는 데 기여하고 있습니다.`
  }
];

// 데이터 불러오기 및 초기화
async function initKnowledgeHub() {
  try {
    const snapshot = await db.collection('articles').orderBy('date', 'desc').get();
    
    if (snapshot.empty) {
      // 데이터가 없으면 초기 샘플 데이터 삽입
      for (const article of INITIAL_CONTENT) {
        await db.collection('articles').add(article);
      }
      allArticles = INITIAL_CONTENT;
    } else {
      allArticles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    renderArticles('all');
  } catch (error) {
    console.error("데이터 로드 오류:", error);
    articleListEl.innerHTML = "<p>정보를 불러오는 데 실패했습니다. Firestore 설정을 확인해 주세요.</p>";
  }
}

function renderArticles(category) {
  articleListEl.innerHTML = "";
  const filtered = category === 'all' 
    ? allArticles 
    : allArticles.filter(a => a.category === category);

  if (filtered.length === 0) {
    articleListEl.innerHTML = "<p>해당 카테고리에 등록된 글이 없습니다.</p>";
    return;
  }

  filtered.forEach(article => {
    const card = document.createElement('div');
    card.className = 'card info-card';
    card.innerHTML = `
      <span class="info-category">${article.category}</span>
      <h3 style="margin: 10px 0;">${article.title}</h3>
      <p style="color: #666; font-size: 0.9rem;">${article.date?.toDate ? article.date.toDate().toLocaleDateString() : new Date(article.date).toLocaleDateString()}</p>
      <p style="margin-top: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
        ${article.content}
      </p>
    `;
    card.onclick = () => showDetail(article);
    articleListEl.appendChild(card);
  });
}

function showDetail(article) {
  modalBody.innerHTML = `
    <span class="info-category">${article.category}</span>
    <h2 style="margin: 15px 0;">${article.title}</h2>
    <p style="color: #888; margin-bottom: 20px;">작성일: ${article.date?.toDate ? article.date.toDate().toLocaleDateString() : new Date(article.date).toLocaleDateString()}</p>
    <hr style="border: 0; border-top: 1px solid #eee; margin-bottom: 25px;">
    <div class="article-body">${article.content}</div>
  `;
  modal.style.display = 'flex';
}

// 필터 버튼 이벤트
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.classList.add('secondary-btn');
    });
    btn.classList.add('active');
    btn.classList.remove('secondary-btn');
    renderArticles(btn.dataset.category);
  });
});

closeModal.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

initKnowledgeHub();
