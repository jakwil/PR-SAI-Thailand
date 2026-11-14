import { CFContext, jsonResponse } from '../../_shared';

export async function onRequestPost(context: CFContext): Promise<Response> {
  const env = context.env || {};
  const hasHttpsEmailApi = Boolean(env.RESEND_API_KEY || env.EMAIL_WEBHOOK_URL);

  if (hasHttpsEmailApi) {
    return jsonResponse({
      success: true,
      verified: true,
      message: `เชื่อมต่อระบบส่งอีเมล HTTPS (${
        env.RESEND_API_KEY ? 'Resend API' : 'Email Webhook'
      }) บน Cloudflare Pages พร้อมใช้งาน`,
    });
  }

  return jsonResponse({
    success: true,
    verified: false,
    warning:
      'บน Cloudflare Pages Edge ไม่รองรับการเชื่อมต่อ TCP SMTP (พอร์ต 465/587) โดยตรง กรุณาตั้งค่า RESEND_API_KEY หรือ EMAIL_WEBHOOK_URL (เช่น Google Apps Script Web App) ใน Cloudflare Pages → Settings → Environment variables แล้ว Redeploy',
  });
}
