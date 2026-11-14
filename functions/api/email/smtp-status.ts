import { CFContext, jsonResponse } from '../../_shared';

export async function onRequestGet(context: CFContext): Promise<Response> {
  const env = context.env || {};
  const hasResend = Boolean(env.RESEND_API_KEY);
  const hasWebhook = Boolean(env.EMAIL_WEBHOOK_URL);
  const isConfigured = hasResend || hasWebhook;
  const fromEmail = env.EMAIL_FROM || 'auditpicture.webapp@gmail.com';
  const fromName =
    env.EMAIL_FROM_NAME || 'สำนักประชาสัมพันธ์และสื่อสารองค์กร สตง. (PR SAI Thailand)';

  return jsonResponse({
    isConfigured,
    service: hasResend ? 'resend' : hasWebhook ? 'webhook' : 'cloudflare-edge',
    host: hasResend ? 'api.resend.com' : hasWebhook ? 'Email HTTPS Webhook' : 'Cloudflare Pages Edge',
    port: 443,
    secure: true,
    user: isConfigured ? fromEmail : '',
    rawUser: isConfigured ? fromEmail : '',
    fromName,
    fromEmail,
    hasPassword: isConfigured,
    envConfigured: isConfigured,
    runtime: 'cloudflare-pages',
    cloudflareNote: isConfigured
      ? `เชื่อมต่อระบบส่งอีเมล HTTPS (${hasResend ? 'Resend API' : 'Email Webhook'}) บน Cloudflare Pages พร้อมใช้งาน`
      : 'บน Cloudflare Pages กรุณาเพิ่ม RESEND_API_KEY หรือ EMAIL_WEBHOOK_URL ใน Cloudflare Pages → Settings → Environment variables',
  });
}
