require("dotenv").config();

const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", (_req, res) => {
  res.json({ ready: Boolean(process.env.OPENAI_API_KEY) });
});

app.post("/api/solve", async (req, res) => {
  try {
    const question = String(req.body?.question || "").trim();

    if (!question) {
      return res.status(400).json({ error: "اكتب السؤال أولاً." });
    }
    if (question.length > 8000) {
      return res.status(400).json({ error: "السؤال طويل جدًا. اختصره وحاول مرة أخرى." });
    }
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: "المساعد الذكي لم يتم تفعيله بعد. يحتاج صاحب الموقع إلى إضافة مفتاح API في إعدادات الاستضافة."
      });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "أنت مساعد تعليمي عربي. ساعد الطالب على فهم السؤال والتعلم. اشرح الفكرة والخطوات بوضوح، ثم اعرض الإجابة مع سببها. إذا كان السؤال غامضًا فاطلب توضيحًا. لا تدّعِ أنك متصل بمنصة تعليمية أو أنك أرسلت إجابة نيابة عن الطالب."
        },
        { role: "user", content: question }
      ],
      temperature: 0.3
    });

    const answer = completion.choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error("لم يتم إنشاء إجابة.");
    res.json({ answer });
  } catch (error) {
    console.error("AI request failed:", error.message);
    res.status(500).json({
      error: "حدثت مشكلة أثناء تحليل السؤال. تحقق من إعدادات خدمة الذكاء الاصطناعي وحاول مرة أخرى."
    });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Quero AI is running on port ${PORT}`);
});