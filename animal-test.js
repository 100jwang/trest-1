const URL = "https://teachablemachine.withgoogle.com/models/3JmQ6l6xH/";
let model, maxPredictions;

const labelMap = {
  DOG: "강아지상",
  CAT: "고양이상"
};

async function initModel() {
  if (model) return;
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();
}

async function predictAnimal() {
  const input = document.getElementById("imageUpload");
  const loading = document.getElementById("loading");
  const resultArea = document.getElementById("resultArea");

  if (!input.files.length) {
    resultArea.innerHTML = "<p>⚠️ 먼저 이미지를 업로드해주세요!</p>";
    return;
  }

  loading.style.display = "block";
  resultArea.innerHTML = "";

  await initModel();

  const file = input.files[0];
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.onload = async () => {
    const prediction = await model.predict(img);
    prediction.sort((a, b) => b.probability - a.probability);

    const topResult = prediction[0];
    const topClass = labelMap[topResult.className] || topResult.className;
    const topPercent = (topResult.probability * 100).toFixed(1);

    let resultHTML = `<h2>당신은 <strong>${topClass}</strong> 입니다! (${topPercent}%)</h2><div style="text-align:left; max-width:400px; margin:0 auto;">`;

    prediction.forEach((p) => {
      const label = labelMap[p.className] || p.className;
      const percent = (p.probability * 100).toFixed(1);
      resultHTML += `
        <p>${label}: ${percent}%</p>
        <div style="background:#ddd; border-radius:5px; overflow:hidden; margin-bottom:10px;">
          <div style="width:${percent}%; background:#4caf50; height:12px;"></div>
        </div>
      `;
    });

    resultHTML += "</div>";
    loading.style.display = "none";
    resultArea.innerHTML = resultHTML;

    const shareBtn = document.createElement("button");
    shareBtn.textContent = "📤 결과 공유하기";
    shareBtn.style.marginTop = "20px";
    shareBtn.className = "recommend-btn";
    shareBtn.onclick = () => {
      const text = `나는 ${topClass}! (${topPercent}%)\n너도 해봐 👉 ${window.location.href}`;
      navigator.clipboard.writeText(text).then(() => {
        alert("결과가 복사됐어요!");
      });
    };
    resultArea.appendChild(shareBtn);
  };
}