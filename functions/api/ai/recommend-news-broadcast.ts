import { CFContext, jsonResponse, callGeminiGenerateContent } from '../../_shared';

export async function onRequestPost(context: CFContext): Promise<Response> {
  try {
    const body: any = await context.request.json().catch(() => ({}));
    const { story, subscribers } = body || {};

    if (!story || !story.title) {
      return jsonResponse({ error: 'Story title is required' }, 400);
    }

    const subsList = Array.isArray(subscribers) ? subscribers : [];

    const fallbackRecommendation = () => {
      const storyCat = (story.category || '').toLowerCase();
      const storyWords = (story.title || '').split(/\s+/).filter((w: string) => w.length > 2);

      const scored = subsList.map((sub: any) => {
        let score = 50;
        const subCat = (sub.category || '').toLowerCase();
        const subStory = (sub.storyTitle || '').toLowerCase();

        if (subCat && storyCat && (subCat.includes(storyCat) || storyCat.includes(subCat))) {
          score += 35;
        }
        for (const w of storyWords) {
          if (subStory.includes(w.toLowerCase())) {
            score += 15;
          }
        }
        return {
          email: sub.email,
          subscriberId: sub.id,
          score: Math.min(score, 100),
          reason:
            subCat.includes(storyCat) || storyCat.includes(subCat)
              ? `เคยติดตามข่าวหมวด "${sub.category || 'ทั่วไป'}" ที่มีความเชื่อมโยงโดยตรง`
              : `ติดตามข่าว "${(sub.storyTitle || '').slice(0, 40)}..." ซึ่งมีบริบทใกล้เคียง`,
        };
      });

      const recommended = scored
        .filter((s: any) => s.score >= 50)
        .sort((a: any, b: any) => b.score - a.score);

      return {
        recommendedEmails: recommended.map((r: any) => r.email),
        recipientDetails: recommended,
        rationale: `AI วิเคราะห์จากประวัติการกดติดตามข่าวสาร พบว่ามี ${recommended.length} รายการที่มีความสนใจในหมวดหมู่ "${
          story.category || 'ข่าวเด่น'
        }" และหัวข้อข่าวที่เกี่ยวข้องโดยตรง`,
        emailDraft: {
          subject: `📢 ข่าวประชาสัมพันธ์ สตง. ใหม่: ${story.title.slice(0, 60)}...`,
          previewText: story.subtitle
            ? story.subtitle.slice(0, 90)
            : 'อัปเดตภารกิจและการดำเนินงานสำคัญของสำนักงานการตรวจเงินแผ่นดิน',
          headline: story.title,
          greeting: 'เรียน ท่านผู้ติดตามข่าวสารสำนักงานการตรวจเงินแผ่นดิน (สตง.)',
          body: `สำนักประชาสัมพันธ์และสื่อสารองค์กร สตง. ขอแจ้งข่าวประชาสัมพันธ์ล่าสุดสำหรับท่านที่ติดตามข้อมูลข่าวสารขององค์กร:\n\n• ${
            story.title
          }\n• หมวดหมู่: ${story.category || 'ข่าวเด่น สตง.'}\n• สาระสำคัญ: ${
            story.subtitle || 'ติดตามข้อมูล ข้อเท็จจริง และความคืบหน้าของภารกิจตรวจเงินแผ่นดิน'
          }\n• ประจำวันที่: ${
            story.date || 'ปัจจุบัน'
          }\n\nท่านสามารถเข้าดูภาพข่าว คลิปวิดีโอ และรายละเอียดฉบับเต็มได้ทางหน้าเว็บไซต์ PR - SAI Thailand`,
          callToAction: 'คลิกอ่านรายละเอียดข่าวฉบับเต็ม',
          linkUrl: story.linkUrl || '#home',
          signOff:
            'สำนักประชาสัมพันธ์และสื่อสารองค์กร สำนักงานการตรวจเงินแผ่นดิน (PR - SAI Thailand)\nสายด่วน สตง. 1730',
        },
      };
    };

    const apiKey = context.env?.GEMINI_API_KEY;
    if (!apiKey) {
      return jsonResponse(fallbackRecommendation());
    }

    const subscriberContext = subsList
      .map(
        (s: any, idx: number) =>
          `${idx + 1}. อีเมล: ${s.email} | ติดตามจากข่าว: "${s.storyTitle}" (หมวด: ${
            s.category || 'ไม่ระบุ'
          })`
      )
      .join('\n');

    const prompt = `
คุณคือ AI ผู้ช่วยวางแผนการสื่อสารประชาสัมพันธ์ขององค์กร "สำนักงานการตรวจเงินแผ่นดิน (สตง.)"
เรากำลังจะเผยแพร่ (Publish) ข่าว Hero ใหม่ดังนี้:
[ข้อมูลข่าวใหม่ที่จะเผยแพร่]
- ชื่อข่าว: ${story.title}
- รายละเอียดย่อ: ${story.subtitle || 'ไม่มี'}
- หมวดหมู่: ${story.category || 'ข่าวเด่น'}
- สัญลักษณ์/Badge: ${story.badge || 'ข่าวใหม่'}
- วันที่: ${story.date || 'ปัจจุบัน'}

[รายชื่อผู้ติดตามที่เคยให้ Email ไว้ และข่าวที่พวกเขาเคยกดติดตาม]
${subscriberContext || 'ไม่มีผู้ติดตามเดิม'}

กรุณาทำ 3 ภารกิจ:
1. วิเคราะห์ความเชื่อมโยงว่าอีเมลใดควรได้รับการส่งอัปเดตข่าวนี้มากที่สุด พร้อมให้เหตุผลสั้นๆ สำหรับแต่ละอีเมล
2. สรุปเหตุผลภาพรวม (Rationale) สั้นๆ 2-3 บรรทัด
3. ร่างเนื้อหาอีเมลประชาสัมพันธ์อย่างเป็นทางการ สุภาพ น่าเชื่อถือ ไพเราะ เหมาะกับภาพลักษณ์ สตง.

ตอบกลับเป็น JSON เท่านั้นตามรูปแบบนี้:
{
  "recommendedEmails": ["email1@..."],
  "recipientDetails": [
    { "email": "email1@...", "reason": "เหตุผลสั้นๆ" }
  ],
  "rationale": "คำอธิบายภาพรวมของ AI",
  "emailDraft": {
    "subject": "หัวข้ออีเมล",
    "previewText": "ข้อความพรีวิวย่อ 1 บรรทัด",
    "headline": "พาดหัวข่าวในอีเมล",
    "greeting": "คำขึ้นต้นสุภาพ",
    "body": "เนื้อหาหลักของอีเมล",
    "callToAction": "ข้อความบนปุ่มลิงก์",
    "linkUrl": "${story.linkUrl || '#home'}",
    "signOff": "คำลงท้าย"
  }
}
`;

    const result = await callGeminiGenerateContent(
      apiKey,
      ['gemini-4-hydrogen', 'gemini-3.8-flash', 'gemini-2.5-flash'],
      {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      }
    );

    if (!result.ok) {
      return jsonResponse(fallbackRecommendation());
    }

    const parts = result.data?.candidates?.[0]?.content?.parts || [];
    const text = parts
      .map((p: any) => p?.text || '')
      .join('')
      .trim();

    if (!text) {
      return jsonResponse(fallbackRecommendation());
    }

    try {
      const parsed = JSON.parse(text);
      return jsonResponse(parsed);
    } catch {
      return jsonResponse(fallbackRecommendation());
    }
  } catch {
    return jsonResponse({ error: 'Recommendation failed' }, 500);
  }
}
