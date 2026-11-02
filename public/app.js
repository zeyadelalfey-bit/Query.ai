const question = document.getElementById("question");
const solveBtn = document.getElementById("solve-btn");
const clearBtn = document.getElementById("clear-btn");
const notice = document.getElementById("notice");
const noticeText = document.getElementById("notice-text");
const answerCard = document.getElementById("answer-card");
const answer = document.getElementById("answer");
const charCount = document.getElementById("char-count");

question.addEventListener("input", () => {
  charCount.textContent = `${question.value.length} / 8000`;
});

function setNotice(message, type = "") {
  notice.className = `notice ${type}`.trim();
  noticeText.textContent = message;
}

solveBtn.addEventListener("click", async () => {
  const text = question.value.trim();
  if (!text) {
    setNotice("اكتب السؤال أولاً حتى أتمكن من مساعدتك.", "error");
    question.focus();
    return;
  }

  solveBtn.disabled = true;
  solveBtn.innerHTML = "<span>جارٍ تحليل السؤال...</span><span>✦</span>";
  answerCard.hidden = true;
  setNotice("يتم الآن إعداد شرح السؤال، قد يستغرق ذلك لحظات.");

  try {
    const response = await fetch("/api/solve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: text })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "تعذر تحليل السؤال.");
    answer.textContent = data.answer;
    answerCard.hidden = false;
    setNotice("تم إعداد الشرح. راجعه وتأكد من فهم خطوات الحل.", "success");
    answerCard.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    setNotice(error.message || "حدث خطأ. حاول مرة أخرى.", "error");
  } finally {
    solveBtn.disabled = false;
    solveBtn.innerHTML = "<span>حلّل السؤال واشرحه</span><span>✦</span>";
  }
});

clearBtn.addEventListener("click", () => {
  question.value = "";
  charCount.textContent = "0 / 8000";
  answer.textContent = "";
  answerCard.hidden = true;
  setNotice("تم مسح السؤال. اكتب سؤالًا جديدًا للبدء.");
  question.focus();
});

document.getElementById("copy-btn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(answer.textContent);
    setNotice("تم نسخ الإجابة.", "success");
  } catch {
    setNotice("تعذر النسخ تلقائيًا. يمكنك تحديد النص ونسخه يدويًا.", "error");
  }
});

fetch("/api/status")
  .then(r => r.json())
  .then(data => {
    if (data.ready) setNotice("المساعد الذكي جاهز. اكتب السؤال للبدء.", "success");
  })
  .catch(() => setNotice("الموقع يعمل محليًا. أكمل إعدادات الاستضافة لتفعيل المساعد."));
