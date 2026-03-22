require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// ⚠️ LINE webhook ต้องการ raw body สำหรับ verify signature
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// ─── 1. Web chat endpoint (เดิม) ───────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── 2. LINE Webhook endpoint ──────────────────────────────
app.post('/webhook', async (req, res) => {
  res.status(200).send('OK');

  try {
    const body = req.body;
    const events = JSON.parse(body.toString()).events;

    for (const event of events) {
      if (event.type !== 'message' || event.message.type !== 'text') continue;

      const userText = event.message.text;
      const replyToken = event.replyToken;

      const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `당신은 한국어 사용자의 일본인 친구입니다. 진짜 일본인처럼 자연스럽게 대화하세요.
상대의 말투(반말/존댓말/캐주얼)를 그대로 따라가고, 슬랭도 자유롭게 사용하세요.
억지로 가르치려 하지 말고, 먼저 진짜 대화를 하세요.
반드시 RESPONSE: / KOREAN: / GRAMMAR: / VOCAB: 형식으로만 응답하세요.`,
          messages: [{ role: 'user', content: userText }]
        })
      });

      const aiData = await aiResponse.json();
      const rawText = aiData.content?.[0]?.text || 'すみません、エラーが発生しました。';

      const responseMatch = rawText.match(/RESPONSE:\s*([\s\S]*?)(?=KOREAN:|$)/);
      const koreanMatch = rawText.match(/KOREAN:\s*([\s\S]*?)(?=GRAMMAR:|$)/);
      const grammarMatch = rawText.match(/GRAMMAR:\s*([\s\S]*?)(?=VOCAB:|$)/);
      const vocabMatch = rawText.match(/VOCAB:\s*([\s\S]*?)$/);

      const japanese = responseMatch ? responseMatch[1].trim() : rawText;
      const korean = koreanMatch ? koreanMatch[1].trim() : '';
      const grammar = grammarMatch ? grammarMatch[1].trim() : '';
      const vocab = vocabMatch ? vocabMatch[1].trim() : '';

      let replyText = japanese;
      if (korean) replyText += `\n\n📝 ${korean}`;
      if (grammar) replyText += `\n\n📚 문법: ${grammar}`;
      if (vocab) replyText += `\n\n💡 어휘: ${vocab}`;

      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          replyToken,
          messages: [{ type: 'text', text: replyText }]
        })
      });
    }
  } catch (err) {
    console.error('Webhook error:', err.message);
  }
});

// ─── 3. Heroku ใช้ process.env.PORT ────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));