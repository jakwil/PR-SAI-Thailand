import { CFContext, jsonResponse } from '../_shared';

export async function onRequestPost(context: CFContext): Promise<Response> {
  const body: any = await context.request.json().catch(() => ({}));
  const imageBase64 = body?.imageBase64;
  if (!imageBase64) {
    return jsonResponse({ error: 'ไม่พบข้อมูลรูปภาพ (imageBase64 required)' }, 400);
  }
  return jsonResponse({
    success: true,
    imageUrl: imageBase64,
    inlineOnly: true,
  });
}
