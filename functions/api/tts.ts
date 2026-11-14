import { CFContext, jsonResponse, callGeminiGenerateContent } from '../_shared';

export async function onRequestPost(context: CFContext): Promise<Response> {
  try {
    const body: any = await context.request.json().catch(() => ({}));
    const text = body?.text;

    if (!text || typeof text !== 'string') {
      return jsonResponse({ error: 'Text is required' }, 400);
    }

    const apiKey = context.env?.GEMINI_API_KEY;
    if (!apiKey) {
      return jsonResponse({ error: 'Gemini API not configured' }, 503);
    }

    const cleanText = text.replace(/[*#_`]/g, '').trim().slice(0, 300);

    const result = await callGeminiGenerateContent(
      apiKey,
      ['gemini-3.8-flash-lite-tts', 'gemini-2.5-flash-preview-tts'],
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: cleanText }],
          },
        ],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      }
    );

    if (!result.ok) {
      return jsonResponse({ error: result.errorText || 'TTS generation failed' }, 500);
    }

    const base64Audio = result.data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return jsonResponse({ error: 'No audio returned' }, 500);
    }

    return jsonResponse({ audio: base64Audio });
  } catch (err: any) {
    return jsonResponse({ error: err?.message || 'TTS generation failed' }, 500);
  }
}
