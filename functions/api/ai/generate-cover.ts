import { CFContext, jsonResponse, callGeminiGenerateContent } from '../../_shared';

export async function onRequestPost(context: CFContext): Promise<Response> {
  try {
    const body: any = await context.request.json().catch(() => ({}));
    const { prompt, storyTitle, subtitle, category, style, aspectRatio = '16:9' } = body || {};

    let styleDescriptor = '';
    if (style === 'inspection') {
      styleDescriptor =
        'Photorealistic, professional civil engineering and site inspection photojournalism, State Audit Office executives with blueprints and safety helmets, sharp focus, 8k resolution, daytime natural sunlight';
    } else if (style === 'digital') {
      styleDescriptor =
        'Futuristic high-tech digital audit operations center with glowing 3D holographic data visualization screen, national budget network nodes, deep royal blue and amber gold lighting, cinematic 8k';
    } else if (style === 'official') {
      styleDescriptor =
        'Prestigious official government press conference hall, elegant dark navy backdrop with golden Thai national emblem, executive podium, broadcast news studio lighting, sharp 8k';
    } else if (style === 'infographic') {
      styleDescriptor =
        'Modern high-impact infographic banner, crisp statistics data typography, royal blue and gold luxury color scheme, high contrast, clean vector and 3D geometric composition';
    } else {
      styleDescriptor =
        'High quality editorial news cover, State Audit Office of Thailand, royal blue and gold theme, crisp professional photography, 8k resolution, cinematic lighting';
    }

    const coreTopic = prompt || storyTitle || 'ภารกิจตรวจสอบและประชาสัมพันธ์ สำนักงานการตรวจเงินแผ่นดิน';
    const enrichedPrompt = `Official news cover banner for State Audit Office of Thailand: "${coreTopic}". ${
      subtitle ? 'Context: ' + subtitle + '.' : ''
    } ${category ? 'Category: ' + category + '.' : ''} ${styleDescriptor}. 16:9 widescreen composition, high visual appeal, ultra crisp details, award-winning photography, clean background, no distorted text or weird artifacts.`;

    const curatedFallbacks: Record<string, string> = {
      inspection: '/src/assets/images/sai_hero_inspection_1792297056517.jpg',
      digital: '/src/assets/images/sai_digital_audit_ai_1792297056483.jpg',
      official: '/src/assets/images/sai_press_photo_1791791796122.jpg',
      infographic: '/src/assets/images/sai_infographic_stats_1791791809566.jpg',
      default: '/src/assets/images/sai_hero_inspection_1792297056517.jpg',
    };

    const apiKey = context.env?.GEMINI_API_KEY;
    if (!apiKey) {
      const fallbackUrl = curatedFallbacks[style || 'default'] || curatedFallbacks.default;
      return jsonResponse({
        success: true,
        imageUrl: fallbackUrl,
        isFallback: true,
        prompt: enrichedPrompt,
        note: 'ใช้ภาพ AI Cover คุณภาพสูงที่คัดสรรไว้สำหรับธีม สตง. (กรุณาเพิ่ม GEMINI_API_KEY ใน Cloudflare Pages Environment Variables เพื่อสร้างภาพใหม่แบบ Real-time)',
      });
    }

    const result = await callGeminiGenerateContent(
      apiKey,
      ['gemini-3.1-flash-lite-image', 'gemini-2.5-flash-image'],
      {
        contents: [{ parts: [{ text: enrichedPrompt }] }],
        generationConfig: {
          imageConfig: { aspectRatio: aspectRatio || '16:9' },
        },
      }
    );

    if (result.ok) {
      const parts = result.data?.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part?.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          return jsonResponse({
            success: true,
            imageUrl: `data:${mimeType};base64,${part.inlineData.data}`,
            prompt: enrichedPrompt,
            isAiGenerated: true,
          });
        }
      }
    }

    const fallbackUrl = curatedFallbacks[style || 'default'] || curatedFallbacks.default;
    return jsonResponse({
      success: true,
      imageUrl: fallbackUrl,
      isFallback: true,
      prompt: enrichedPrompt,
      note: 'สร้างภาพด้วยธีมสำเร็จรูปคุณภาพสูงของ สตง. เรียบร้อยแล้ว',
    });
  } catch (err: any) {
    return jsonResponse({ error: err?.message || 'เกิดข้อผิดพลาดในการสร้างภาพ COVER' }, 500);
  }
}
