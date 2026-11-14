import {
  CFContext,
  jsonResponse,
  generateNewsletterHtml,
  sendEmailViaCloudflareApi,
} from '../_shared';

export async function onRequestPost(context: CFContext): Promise<Response> {
  try {
    const body: any = await context.request.json().catch(() => ({}));
    const { storyId, storyTitle, subject, summary, recipients, aiGenerated, story } = body || {};

    const targetRecipients: string[] = Array.isArray(recipients) ? recipients.filter(Boolean) : [];
    const env = context.env || {};
    const hasEmailApi = Boolean(env.RESEND_API_KEY || env.EMAIL_WEBHOOK_URL);
    const appUrl = env.APP_URL || new URL(context.request.url).origin;

    const deliveredEmails: string[] = [];
    const failedEmails: { email: string; error: string }[] = [];
    let deliveryStatus: 'success' | 'partial' | 'failed' | 'simulated' = hasEmailApi
      ? 'success'
      : 'simulated';

    if (targetRecipients.length > 0 && hasEmailApi) {
      for (const email of targetRecipients) {
        const emailHtml = generateNewsletterHtml({
          storyTitle: storyTitle || story?.title || 'ข่าวประชาสัมพันธ์ สตง.',
          summary: summary || story?.subtitle || 'ติดตามข้อมูลข่าวสารภารกิจการตรวจเงินแผ่นดิน',
          category: story?.category || 'ข่าวเด่น สตง.',
          date:
            story?.date ||
            new Date().toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          imageUrl: story?.imageUrl,
          appUrl,
          recipientEmail: email,
        });

        const sendRes = await sendEmailViaCloudflareApi(env, {
          to: email,
          subject: subject || `📢 ข่าวประชาสัมพันธ์ สตง.: ${storyTitle || 'อัปเดตข่าวใหม่'}`,
          html: emailHtml,
        });

        if (sendRes.ok) {
          deliveredEmails.push(email);
        } else {
          failedEmails.push({ email, error: sendRes.error || 'ส่งไม่สำเร็จ' });
        }
      }

      if (failedEmails.length === 0) {
        deliveryStatus = 'success';
      } else if (deliveredEmails.length > 0) {
        deliveryStatus = 'partial';
      } else {
        deliveryStatus = 'failed';
      }
    }

    const newBroadcast = {
      id: `bcast_${Date.now()}`,
      storyId: storyId || 'general',
      storyTitle: storyTitle || 'ข่าวประชาสัมพันธ์',
      subject: subject || 'แจ้งเตือนข่าวใหม่จาก สตง.',
      summary: summary || '',
      recipientCount: targetRecipients.length,
      recipients: targetRecipients,
      aiGenerated: !!aiGenerated,
      sentAt: new Date().toISOString(),
      deliveryStatus,
      deliveredEmails,
      failedEmails,
      previewUrl: null,
      smtpUser: env.EMAIL_FROM || null,
      isRealDelivery: hasEmailApi && deliveredEmails.length > 0,
    };

    return jsonResponse({
      success: true,
      broadcast: newBroadcast,
      smtpConfigured: hasEmailApi,
      isRealDelivery: hasEmailApi && deliveredEmails.length > 0,
      deliveredCount: deliveredEmails.length,
      failedCount: failedEmails.length,
      previewUrl: null,
      warning: !hasEmailApi
        ? '⚠️ บน Cloudflare Pages ยังไม่ได้ตั้งค่า RESEND_API_KEY หรือ EMAIL_WEBHOOK_URL ระบบจึงบันทึกข่าวลง Firestore แล้ว แต่ยังไม่ได้ส่งอีเมลจริง หากต้องการส่งอีเมลอัตโนมัติ กรุณาเพิ่ม RESEND_API_KEY หรือ EMAIL_WEBHOOK_URL ใน Cloudflare Pages → Settings → Environment variables'
        : undefined,
    });
  } catch (err: any) {
    return jsonResponse({ error: err?.message || 'Broadcast failed' }, 500);
  }
}
