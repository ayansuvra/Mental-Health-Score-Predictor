// -----------------------------------------------------------------------
// Point this at wherever your FastAPI app is running.
// If you run `uvicorn app.main:app --reload` from the project root,
// this is almost certainly correct as-is.
// -----------------------------------------------------------------------
const API_URL = "https://mental-health-score-predictor-model-3q8g.onrender.com/predict";

// Assumed score range coming back from the model (typical for this dataset).
// Adjust SCORE_MIN / SCORE_MAX if your training data uses a different scale.
const SCORE_MIN = 0;
const SCORE_MAX = 10;

const form = document.getElementById("predictForm");
const submitBtn = document.getElementById("submitBtn");
const errorMsg = document.getElementById("errorMsg");
const needleGroup = document.getElementById("needleGroup");
const scoreValue = document.getElementById("scoreValue");
const scoreLabel = document.getElementById("scoreLabel");

// ---------- build gauge tick marks (0,2,4,6,8,10) ----------
(function drawTicks() {
  const ticksGroup = document.getElementById("ticks");
  const cx = 120, cy = 130, rOuter = 100, rInner = 86, rLabel = 72;
  const values = [0, 2, 4, 6, 8, 10];

  values.forEach((val) => {
    const f = (val - SCORE_MIN) / (SCORE_MAX - SCORE_MIN);
    const theta = (180 * (1 - f)) * (Math.PI / 180); // radians

    const x1 = cx + rOuter * Math.cos(theta);
    const y1 = cy - rOuter * Math.sin(theta);
    const x2 = cx + rInner * Math.cos(theta);
    const y2 = cy - rInner * Math.sin(theta);
    const xL = cx + rLabel * Math.cos(theta);
    const yL = cy - rLabel * Math.sin(theta);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("class", "tick");
    ticksGroup.appendChild(line);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", xL);
    label.setAttribute("y", yL + 3);
    label.setAttribute("class", "tick-label");
    label.textContent = val;
    ticksGroup.appendChild(label);
  });
})();

// ---------- gauge update ----------
function setGauge(score) {
  const clamped = Math.max(SCORE_MIN, Math.min(SCORE_MAX, score));
  const f = (clamped - SCORE_MIN) / (SCORE_MAX - SCORE_MIN);
  const angle = -90 + f * 180;

  needleGroup.style.transform = `rotate(${angle}deg)`;
  scoreValue.textContent = score.toFixed(2);

  scoreValue.classList.remove("good", "mid", "low");
  if (clamped >= 7) {
    scoreValue.classList.add("good");
    scoreLabel.textContent = "looking steady";
  } else if (clamped >= 4) {
    scoreValue.classList.add("mid");
    scoreLabel.textContent = "worth keeping an eye on";
  } else {
    scoreValue.classList.add("low");
    scoreLabel.textContent = "worth some care";
  }
}

function resetGauge() {
  needleGroup.style.transform = "rotate(-90deg)";
  scoreValue.textContent = "—";
  scoreValue.classList.remove("good", "mid", "low");
  scoreLabel.textContent = "awaiting your data";
}

// ---------- form submit ----------
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const payload = {
    Age: Number(document.getElementById("age").value),
    Gender: document.getElementById("gender").value,
    Academic_Level: document.getElementById("academicLevel").value,
    Most_Used_Platform: document.getElementById("platform").value,
    Avg_Daily_Usage_Hours: Number(document.getElementById("dailyUsage").value),
    Daily_Unlocks: Number(document.getElementById("unlocks").value),
    Study_Hours: Number(document.getElementById("studyHours").value),
    Physical_Activity_Hours: Number(document.getElementById("activityHours").value),
    Sleep_Hours_Per_Night: Number(document.getElementById("sleepHours").value),
    Stress_Level: document.getElementById("stress").value,
  };

  submitBtn.classList.add("loading");
  submitBtn.disabled = true;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const detail = body && body.detail
        ? (Array.isArray(body.detail) ? body.detail.map(d => d.msg).join(", ") : body.detail)
        : `Request failed (${res.status})`;
      throw new Error(detail);
    }

    const data = await res.json();
    setGauge(data.predicted_mental_health_score);
  } catch (err) {
    resetGauge();
    errorMsg.textContent =
      err.message === "Failed to fetch"
        ? "Can't reach the API. Is the FastAPI server running, and is CORS enabled?"
        : err.message;
  } finally {
    submitBtn.classList.remove("loading");
    submitBtn.disabled = false;
  }
});
