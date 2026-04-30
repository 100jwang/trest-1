const MODEL_URL = "https://teachablemachine.withgoogle.com/models/9XaSIfD6a/";
let model, maxPredictions;

// 모델 로드
async function initModel() {
    if (model) return;
    try {
        const loading = document.getElementById("loading");
        if (loading) loading.style.display = "block";
        
        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        
        if (loading) loading.style.display = "none";
    } catch (e) {
        console.error("Model loading failed:", e);
    }
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
    reader.onload = function(e) {
        const preview = document.getElementById("preview-image");
        preview.onload = async function() {
            await predict();
        };
        preview.src = e.target.result;
        preview.style.display = "block";
        document.getElementById("upload-text").style.display = "none";
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

        if (!prediction || prediction.length === 0) {
            resultArea.innerHTML = "<p>분석 결과를 가져올 수 없습니다.</p>";
            return;
        }

        prediction.sort((a, b) => b.probability - a.probability);
        
        const topResult = prediction[0];
        let topClassName = topResult.className;
        if (topClassName.toUpperCase() === "DOG") topClassName = "강아지";
        if (topClassName.toUpperCase() === "CAT") topClassName = "고양이";

        const resultEmoji = (topClassName === "강아지" || topClassName.toLowerCase().includes("dog")) ? "🐶" : "🐱";
        
        let resultHTML = `<h3 style="text-align: center; margin-bottom: 20px;">당신은 ${resultEmoji} ${topClassName}상입니다!</h3>`;
        
        prediction.forEach(p => {
            const percentage = (p.probability * 100).toFixed(0);
            let className = p.className;
            if (className.toUpperCase() === "DOG") className = "강아지";
            if (className.toUpperCase() === "CAT") className = "고양이";
            
            const isDog = (className === "강아지" || className.toLowerCase().includes("dog"));
            const barColor = isDog ? "#ffcc00" : "#ff6b6b";
            
            resultHTML += `
                <div class="bar-container">
                    <span class="bar-label">${className} (${percentage}%)</span>
                    <div class="bar-outer">
                        <div class="bar-inner" style="width: ${percentage}%; background-color: ${barColor};"></div>
                    </div>
                </div>
            `;
        });
        
        resultArea.innerHTML = resultHTML;

        // 결과 공유 버튼 추가
        const shareBtn = document.createElement("button");
        shareBtn.innerText = "🔗 결과 복사하기";
        shareBtn.style.marginTop = "20px";
        shareBtn.style.padding = "10px 20px";
        shareBtn.style.borderRadius = "10px";
        shareBtn.style.border = "none";
        shareBtn.style.backgroundColor = "#444";
        shareBtn.style.color = "#fff";
        shareBtn.style.cursor = "pointer";
        shareBtn.onclick = () => {
            const text = `나의 동물상 테스트 결과: 당신은 ${resultEmoji} ${topClassName}상입니다! #동물상테스트 #AI분석`;
            navigator.clipboard.writeText(text).then(() => {
                alert("결과가 클립보드에 복사되었습니다!");
            });
        };
        resultArea.appendChild(shareBtn);
    } catch (error) {
        console.error("Prediction failed:", error);
        loading.style.display = "none";
        resultArea.innerHTML = "<p>분석 중 오류가 발생했습니다. 다시 시도해주세요.</p>";
    }
}
