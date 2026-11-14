import { CFContext, jsonResponse } from '../_shared';

export async function onRequestGet(context: CFContext): Promise<Response> {
  try {
    const reqUrl = new URL(context.request.url);
    const url = (reqUrl.searchParams.get('url') || '').trim();
    if (!url) {
      return jsonResponse({ ok: false, message: 'กรุณาระบุลิงก์เพลง' });
    }

    const isDrive = url.includes('drive.google.com') || url.includes('docs.google.com');
    let fileId = '';
    if (isDrive) {
      const match =
        url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
        url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
        url.match(/\/folders\/([a-zA-Z0-9_-]+)/) ||
        url.match(/drive\.google\.com\/.*\/([a-zA-Z0-9_-]{25,})/);
      fileId = match ? match[1] : '';
    }

    return jsonResponse({
      ok: true,
      isDrive,
      fileId,
      streamUrl: fileId ? `/api/audio-proxy?id=${fileId}` : `/api/audio-proxy?url=${encodeURIComponent(url)}`,
      message: fileId
        ? `พบ Google Drive File ID (${fileId}) พร้อมเชื่อมต่อสตรีมเสียงความคมชัดสูง`
        : isDrive
        ? 'เป็นลิงก์ Google Drive หน้าหลัก ระบบจะสตรีมเพลงบรรเลงประชาสัมพันธ์ สตง. ให้ทันที'
        : 'เป็นลิงก์เสียงภายนอก พร้อมสตรีมผ่าน Audio Proxy',
    });
  } catch (err: any) {
    return jsonResponse({ ok: false, message: err?.message || 'ตรวจสอบลิงก์ไม่สำเร็จ' });
  }
}
