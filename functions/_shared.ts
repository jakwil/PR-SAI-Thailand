export interface CFEnv {
  GEMINI_API_KEY?: string;
  RESEND_API_KEY?: string;
  EMAIL_WEBHOOK_URL?: string;
  EMAIL_FROM?: string;
  EMAIL_FROM_NAME?: string;
  APP_URL?: string;
}

export interface CFContext {
  request: Request;
  env: CFEnv;
  params: Record<string, string | string[]>;
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function callGeminiGenerateContent(
  apiKey: string,
  models: string[],
  payload: Record<string, unknown>
): Promise<{ ok: boolean; status: number; data: any; errorText?: string }> {
  let lastStatus = 500;
  let lastErrorText = 'Gemini request failed';

  for (const model of models) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return { ok: true, status: res.status, data };
    }

    lastStatus = res.status;
    lastErrorText = await res.text().catch(() => `HTTP ${res.status}`);

    // Retry next fallback model only on 404 (model unavailable on public endpoint) or 400 unsupported model
    if (res.status !== 404 && res.status !== 400) {
      break;
    }
  }

  return { ok: false, status: lastStatus, data: null, errorText: lastErrorText };
}

export function generateNewsletterHtml(params: {
  storyTitle: string;
  summary: string;
  category?: string;
  date?: string;
  imageUrl?: string;
  appUrl?: string;
  recipientEmail?: string;
}): string {
  const { storyTitle, summary, category, date, imageUrl, appUrl, recipientEmail } = params;
  const baseUrl = appUrl || 'https://pr-sai-thailand.pages.dev';
  const resolvedImg =
    imageUrl && imageUrl.startsWith('http')
      ? imageUrl
      : imageUrl && imageUrl.startsWith('/')
      ? `${baseUrl}${imageUrl}`
      : 'https://i.postimg.cc/90TgPftw/Untitled-design-2026-10-13T095211-499.png';

  const formattedSummary = (summary || '')
    .split('\n')
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin: 0 0 14px 0; line-height: 1.7; color: #334155; font-size: 15px;">${escapeHtml(
          p
        )}</p>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(storyTitle)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #d97706, #fbbf24, #d97706);">&nbsp;</td>
          </tr>
          <tr>
            <td style="background-color: #051438; padding: 24px 28px; text-align: center;">
              <img src="https://i.postimg.cc/90TgPftw/Untitled-design-2026-10-13T095211-499.png" alt="ตราสัญลักษณ์ สตง." width="72" height="72" style="display: block; margin: 0 auto 12px auto; border: 0; border-radius: 50%;" />
              <span style="font-size: 11px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 2px;">
                STATE AUDIT OFFICE OF THE KINGDOM OF THAILAND
              </span>
              <h1 style="margin: 6px 0 0 0; color: #ffffff; font-size: 20px; font-weight: 700;">
                สำนักงานการตรวจเงินแผ่นดิน
              </h1>
              <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px;">
                ศูนย์กลางประชาสัมพันธ์และสื่อสารองค์กร (PR - SAI Thailand)
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 28px 20px 28px;">
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #92400e; font-weight: 700;">
                ${escapeHtml(category || 'ข่าวประชาสัมพันธ์')} · 📅 ${escapeHtml(date || 'ประกาศล่าสุด')}
              </p>
              <h2 style="margin: 0 0 16px 0; font-size: 20px; line-height: 1.4; color: #0f172a;">
                ${escapeHtml(storyTitle)}
              </h2>
              ${
                resolvedImg
                  ? `<img src="${escapeHtml(
                      resolvedImg
                    )}" alt="" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 12px; margin-bottom: 18px;" />`
                  : ''
              }
              ${formattedSummary}
              <div style="margin-top: 20px; text-align: center;">
                <a href="${escapeHtml(
                  baseUrl
                )}" style="display: inline-block; padding: 12px 24px; background-color: #d97706; color: #ffffff; text-decoration: none; font-weight: 700; border-radius: 10px;">
                  เข้าชมเว็บไซต์ PR - SAI Thailand
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fafaf9; padding: 20px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 6px 0; font-weight: 700; color: #334155;">
                สำนักประชาสัมพันธ์และสื่อสารองค์กร สำนักงานการตรวจเงินแผ่นดิน (สตง.)
              </p>
              <p style="margin: 0;">โทรศัพท์: 0 2271 8000 | สายด่วนตรวจเงินแผ่นดิน: 1730</p>
              <p style="margin: 10px 0 0 0; font-size: 11px; color: #94a3b8;">
                ส่งถึง <strong>${escapeHtml(recipientEmail || 'ท่านผู้ติดตาม')}</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendEmailViaCloudflareApi(
  env: CFEnv,
  params: {
    to: string;
    subject: string;
    html: string;
  }
): Promise<{ ok: boolean; provider: string; messageId?: string; error?: string }> {
  const fromName = env.EMAIL_FROM_NAME || 'สำนักประชาสัมพันธ์และสื่อสารองค์กร สตง. (PR SAI Thailand)';
  const fromEmail = env.EMAIL_FROM || 'onboarding@resend.dev';

  if (env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });

    const data: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        provider: 'resend',
        error: data?.message || data?.name || `Resend HTTP ${res.status}`,
      };
    }
    return { ok: true, provider: 'resend', messageId: data?.id || 'resend-ok' };
  }

  if (env.EMAIL_WEBHOOK_URL) {
    const res = await fetch(env.EMAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: params.to,
        subject: params.subject,
        html: params.html,
        fromName,
      }),
    });

    const data: any = await res.json().catch(() => ({}));
    if (!res.ok || data?.success === false) {
      return {
        ok: false,
        provider: 'webhook',
        error: data?.error || `Webhook HTTP ${res.status}`,
      };
    }
    return { ok: true, provider: 'webhook', messageId: data?.messageId || 'webhook-ok' };
  }

  return {
    ok: false,
    provider: 'unconfigured',
    error:
      'บน Cloudflare Pages ต้องตั้งค่า RESEND_API_KEY หรือ EMAIL_WEBHOOK_URL ใน Cloudflare Environment Variables (เนื่องจาก Edge Runtime ไม่รองรับ TCP SMTP พอร์ต 465/587 โดยตรง)',
  };
}
