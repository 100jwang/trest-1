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
const auth = firebase.auth();
const db = firebase.firestore();

// 텍스트 중심 챌린지 주제로 변경
const CHALLENGES = [
  "오늘의 주제: 5초 안에 떠오른 가장 먹고 싶은 음식은?",
  "오늘의 주제: 지금 내 눈앞에 보이는 물건 3가지는?",
  "오늘의 주제: 5초 안에 생각나는 가장 좋아하는 노래 제목은?",
  "오늘의 주제: 지금 당장 떠나고 싶은 여행지는?",
  "오늘의 주제: 오늘 나를 기쁘게 한 사소한 일 한 가지는?",
  "오늘의 주제: 5초 안에 생각나는 나의 장점은?",
  "오늘의 주제: 내일 가장 먼저 하고 싶은 일은?",
];

const el = {
  authSection: document.getElementById("auth-section"),
  communitySection: document.getElementById("community-section"),
  authForm: document.getElementById("auth-form"),
  authUsername: document.getElementById("auth-username"),
  authPassword: document.getElementById("auth-password"),
  authMessage: document.getElementById("auth-message"),
  currentUser: document.getElementById("current-user"),
  logoutBtn: document.getElementById("logout-btn"),
  postForm: document.getElementById("post-form"),
  postText: document.getElementById("post-text"),
  postMessage: document.getElementById("post-message"),
  feedList: document.getElementById("feed-list"),
  challengeText: document.getElementById("challenge-text"),
};

function getTodayChallenge() {
  const dayIndex = Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % CHALLENGES.length;
  return CHALLENGES[dayIndex];
}

function setMessage(target, message, isError = false) {
  target.textContent = message;
  target.style.color = isError ? "#cf2f2f" : "#2f8f2f";
}

// 로그인 상태 감지
auth.onAuthStateChanged((user) => {
  const loggedIn = Boolean(user);
  el.authSection.classList.toggle("hidden", loggedIn);
  el.communitySection.classList.toggle("hidden", !loggedIn);

  if (loggedIn) {
    el.currentUser.textContent = user.email.split('@')[0];
    renderFeed();
  }
});

async function renderFeed() {
  el.feedList.innerHTML = "피드를 불러오는 중...";
  
  try {
    const snapshot = await db.collection('posts').orderBy('created_at', 'desc').limit(50).get();
    el.feedList.innerHTML = "";

    if (snapshot.empty) {
      el.feedList.innerHTML = "<p>아직 답변이 없어요. 첫 번째 답변을 남겨보세요!</p>";
      return;
    }

    snapshot.forEach((doc) => {
      const post = doc.data();
      post.id = doc.id;
      el.feedList.appendChild(createPostCard(post));
    });
  } catch (error) {
    console.error("피드 로드 오류:", error);
    el.feedList.innerHTML = "<p>피드를 불러오는 중 오류가 발생했습니다.</p>";
  }
}

function createPostCard(post) {
  const article = document.createElement("article");
  article.className = "feed-card";

  article.innerHTML = `
    <div class="post-header">
      <p class="meta">👤 ${post.author_name} · ${post.created_at?.toDate().toLocaleString("ko-KR") || '방금 전'}</p>
    </div>
    <div class="post-content">
      <p class="challenge-tag">🚩 ${post.challenge}</p>
      <p class="main-text">${post.text}</p>
    </div>
    <div class="comment-box">
      <h4>댓글</h4>
      <div class="comment-list"></div>
      <form class="comment-form">
        <input type="text" name="comment" placeholder="댓글을 입력하세요" maxlength="100" required>
        <button type="submit" class="recommend-btn secondary-btn">등록</button>
      </form>
    </div>
  `;

  const commentList = article.querySelector(".comment-list");
  const commentForm = article.querySelector(".comment-form");

  // 댓글 실시간 로드
  db.collection('posts').doc(post.id).collection('comments')
    .orderBy('created_at', 'asc')
    .onSnapshot(snapshot => {
      commentList.innerHTML = "";
      snapshot.forEach(doc => {
        const c = doc.data();
        const item = document.createElement("p");
        item.className = "comment-item";
        item.textContent = `💬 ${c.author_name}: ${c.text}`;
        commentList.appendChild(item);
      });
    });

  commentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = commentForm.elements.comment;
    const value = input.value.trim();
    const user = auth.currentUser;
    if (!value || !user) return;

    try {
      await db.collection('posts').doc(post.id).collection('comments').add({
        author_name: user.email.split('@')[0],
        text: value,
        created_at: firebase.firestore.FieldValue.serverTimestamp()
      });
      input.value = "";
    } catch (error) {
      alert("댓글 등록 실패");
    }
  });

  return article;
}

// 인증 처리
el.authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const mode = event.submitter?.dataset.mode;
  const username = el.authUsername.value.trim();
  const password = el.authPassword.value;
  const email = `${username}@example.com`;

  try {
    if (mode === "signup") {
      await auth.createUserWithEmailAndPassword(email, password);
      setMessage(el.authMessage, "회원가입 완료! 즐거운 5초 챌린지 되세요.");
    } else {
      await auth.signInWithEmailAndPassword(email, password);
      setMessage(el.authMessage, "로그인 성공!");
    }
    el.authForm.reset();
  } catch (error) {
    console.error("인증 상세 오류:", error);
    let msg = `오류 발생 (${error.code})`; // 에러 코드를 직접 표시
    
    if (error.code === "auth/email-already-in-use") msg = "이미 존재하는 아이디입니다.";
    else if (error.code === "auth/wrong-password" || error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") msg = "로그인 정보가 올바르지 않습니다.";
    else if (error.code === "auth/unauthorized-domain") msg = "이 도메인은 Firebase에 등록되지 않았습니다. (승인된 도메인 추가 필요)";
    else if (error.code === "auth/operation-not-allowed") msg = "이메일 로그인이 비활성화되어 있습니다. (콘솔 확인 필요)";
    else msg = `오류: ${error.message}`;
    
    setMessage(el.authMessage, msg, true);
  }
});

el.logoutBtn.addEventListener("click", () => {
  auth.signOut();
  el.postForm.reset();
  setMessage(el.postMessage, "", false);
});

// 답변 등록 처리 (Storage 없이 Firestore만 사용)
el.postForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const user = auth.currentUser;
  const text = el.postText.value.trim();

  if (!user) return;
  if (!text) return setMessage(el.postMessage, "답변을 적어주세요.", true);
  
  setMessage(el.postMessage, "등록 중입니다...");

  try {
    await db.collection('posts').add({
      author_name: user.email.split('@')[0],
      challenge: getTodayChallenge(),
      text: text,
      user_id: user.uid,
      created_at: firebase.firestore.FieldValue.serverTimestamp()
    });

    setMessage(el.postMessage, "등록 완료!");
    el.postForm.reset();
    renderFeed();
  } catch (error) {
    console.error("등록 오류:", error);
    setMessage(el.postMessage, "등록 실패: " + error.message, true);
  }
});

el.challengeText.textContent = getTodayChallenge();
