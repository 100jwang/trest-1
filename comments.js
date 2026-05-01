const STORAGE_KEYS = {
    users: "challenge_users_v1",
    session: "challenge_session_v1",
    posts: "challenge_posts_v1",
  };
  
  const CHALLENGES = [
    "오늘의 주제: 가장 웃긴 표정 5초",
    "오늘의 주제: 퇴근 후 한입 먹방 5초",
    "오늘의 주제: 나만의 인사법 5초",
    "오늘의 주제: 책상 위 최애템 소개 5초",
    "오늘의 주제: 오늘 하늘 보여주기 5초",
    "오늘의 주제: 오늘의 스트레칭 5초",
    "오늘의 주제: 나의 집중 루틴 5초",
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
    postVideo: document.getElementById("post-video"),
    postMessage: document.getElementById("post-message"),
    feedList: document.getElementById("feed-list"),
    challengeText: document.getElementById("challenge-text"),
  };
  
  function getTodayChallenge() {
    const dayIndex = Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % CHALLENGES.length;
    return CHALLENGES[dayIndex];
  }
  
  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }
  
  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  
  function getUsers() { return readJson(STORAGE_KEYS.users, []); }
  function getPosts() { return readJson(STORAGE_KEYS.posts, []); }
  function getSession() { return localStorage.getItem(STORAGE_KEYS.session) || ""; }
  
  function setSession(username) {
    if (!username) localStorage.removeItem(STORAGE_KEYS.session);
    else localStorage.setItem(STORAGE_KEYS.session, username);
  }
  
  function hash(password) {
    return btoa(unescape(encodeURIComponent(password)));
  }
  
  function setMessage(target, message, isError = false) {
    target.textContent = message;
    target.style.color = isError ? "#cf2f2f" : "#2f8f2f";
  }
  
  function renderAuthState() {
    const user = getSession();
    const loggedIn = Boolean(user);
  
    el.authSection.classList.toggle("hidden", loggedIn);
    el.communitySection.classList.toggle("hidden", !loggedIn);
  
    if (loggedIn) {
      el.currentUser.textContent = user;
      renderFeed();
    }
  }
  
  function createPostCard(post) {
    const article = document.createElement("article");
    article.className = "feed-card";
  
    article.innerHTML = `
      <p class="meta">👤 ${post.author} · ${new Date(post.createdAt).toLocaleString("ko-KR")}</p>
      <p><strong>주제:</strong> ${post.challenge}</p>
      <p>${post.text}</p>
      <video controls preload="metadata" src="${post.videoData}" class="feed-video"></video>
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
  
    for (const c of post.comments || []) {
      const item = document.createElement("p");
      item.className = "comment-item";
      item.textContent = `💬 ${c.author}: ${c.text}`;
      commentList.appendChild(item);
    }
  
    commentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = commentForm.elements.comment;
      const value = input.value.trim();
      if (!value) return;
  
      const posts = getPosts();
      const target = posts.find((p) => p.id === post.id);
      if (!target) return;
  
      target.comments = target.comments || [];
      target.comments.push({ author: getSession(), text: value, createdAt: new Date().toISOString() });
      writeJson(STORAGE_KEYS.posts, posts);
      renderFeed();
    });
  
    return article;
  }
  
  function renderFeed() {
    const posts = getPosts().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    el.feedList.innerHTML = "";
  
    if (!posts.length) {
      el.feedList.innerHTML = "<p>아직 업로드된 챌린지 영상이 없어요. 첫 번째로 올려보세요!</p>";
      return;
    }
  
    posts.forEach((post) => {
      el.feedList.appendChild(createPostCard(post));
    });
  }
  
  el.authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const mode = event.submitter?.dataset.mode;
    const username = el.authUsername.value.trim();
    const password = el.authPassword.value;
    const users = getUsers();
  
    if (!mode) return;
    if (!username || !password) return setMessage(el.authMessage, "아이디와 비밀번호를 입력하세요.", true);
  
    const existing = users.find((u) => u.username === username);
  
    if (mode === "signup") {
      if (existing) return setMessage(el.authMessage, "이미 존재하는 아이디입니다.", true);
      users.push({ username, passwordHash: hash(password), createdAt: new Date().toISOString() });
      writeJson(STORAGE_KEYS.users, users);
      setMessage(el.authMessage, "회원가입 완료! 이제 로그인해보세요.");
      el.authForm.reset();
      return;
    }
  
    if (!existing || existing.passwordHash !== hash(password)) {
      return setMessage(el.authMessage, "로그인 정보가 올바르지 않습니다.", true);
    }
  
    setSession(username);
    setMessage(el.authMessage, "로그인 성공!");
    el.authForm.reset();
    renderAuthState();
  });
  
  el.logoutBtn.addEventListener("click", () => {
    setSession("");
    el.postForm.reset();
    setMessage(el.postMessage, "", false);
    renderAuthState();
  });
  
  el.postForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = el.postVideo.files?.[0];
    const text = el.postText.value.trim();
  
    if (!file) return setMessage(el.postMessage, "영상을 선택해 주세요.", true);
    if (!file.type.startsWith("video/")) return setMessage(el.postMessage, "영상 파일만 업로드할 수 있습니다.", true);
  
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = URL.createObjectURL(file);
  
    await new Promise((resolve) => {
      video.onloadedmetadata = resolve;
      video.onerror = resolve;
    });
  
    if (Number.isFinite(video.duration) && video.duration > 5.5) {
      URL.revokeObjectURL(video.src);
      return setMessage(el.postMessage, "5초 이내 영상만 업로드할 수 있어요.", true);
    }
  
    const reader = new FileReader();
    reader.onload = () => {
      const posts = getPosts();
      posts.push({
        id: crypto.randomUUID(),
        author: getSession(),
        challenge: getTodayChallenge(),
        text,
        videoData: reader.result,
        comments: [],
        createdAt: new Date().toISOString(),
      });
      writeJson(STORAGE_KEYS.posts, posts);
      setMessage(el.postMessage, "업로드 완료! 피드에서 확인해보세요.");
      el.postForm.reset();
      renderFeed();
    };
  
    reader.onerror = () => setMessage(el.postMessage, "파일을 읽는 중 오류가 발생했습니다.", true);
    reader.readAsDataURL(file);
  });
  
  el.challengeText.textContent = getTodayChallenge();
  renderAuthState();