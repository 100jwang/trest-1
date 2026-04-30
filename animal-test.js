const MODEL_URL = "https://teachablemachine.withgoogle.com/models/9XaSIfD6a/";
let model, maxPredictions;

// 모델 로드
async function initModel() {
    if (model) return;
    try {
        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
    } catch (e) {
        console.error("Model loading failed:", e);
    }
}

// 모달 열기
function openModal() {
    document.getElementById("animal-modal").style.display = "block";
    initModel();
}

// 모달 닫기
function closeModal() {
    document.getElementById("animal-modal").style.display = "none";
    resetTest();
}

// 테스트 초기화
function resetTest() {
    document.getElementById("preview-image").style.display = "none";
    document.getElementById("preview-image").src = "";
    document.getElementById("upload-text").style.display = "block";
    document.getElementById("prediction-result").innerHTML = "";
    document.getElementById("image-upload").value = "";
}

// 이미지 업로드 처리
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        const preview = document.getElementById("preview-image");
        preview.src = e.target.result;
        preview.style.display = "block";
        document.getElementById("upload-text").style.display = "none";
        
        await predict();
    };
    reader.readAsDataURL(file);
}

// 예측 수행
async function predict() {
    const loading = document.getElementById("loading");
    const resultArea = document.getElementById("prediction-result");
    const image = document.getElementById("preview-image");

    if (!model) {
        await initModel();
    }

    loading.style.display = "block";
    resultArea.innerHTML = "";

    try {
        const prediction = await model.predict(image);
        loading.style.display = "none";

        prediction.sort((a, b) => b.probability - a.probability);
        
        const topResult = prediction[0];
        const resultEmoji = (topResult.className === "강아지" || topResult.className.toLowerCase().includes("dog")) ? "🐶" : "🐱";
        
        let resultHTML = \`<h3>당신은 \${resultEmoji} \${topResult.className}상입니다!</h3>\`;
        
        prediction.forEach(p => {
            const percentage = (p.probability * 100).toFixed(0);
            const isDog = (p.className === "강아지" || p.className.toLowerCase().includes("dog"));
            const barColor = isDog ? "#ffcc00" : "#ff6b6b";
            
            resultHTML += \`
                <div class="bar-container">
                    <span class="bar-label">\${p.className} (\${percentage}%)</span>
                    <div class="bar-outer">
                        <div class="bar-inner" style="width: \${percentage}%; background-color: \${barColor};"></div>
                    </div>
                </div>
            \`;
        });
        
        resultArea.innerHTML = resultHTML;
    } catch (error) {
        console.error("Prediction failed:", error);
        loading.style.display = "none";
        resultArea.innerHTML = "<p>분석 중 오류가 발생했습니다. 다시 시도해주세요.</p>";
    }
}

// 모달 외곽 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById("animal-modal");
    if (event.target == modal) {
        closeModal();
    }
}
