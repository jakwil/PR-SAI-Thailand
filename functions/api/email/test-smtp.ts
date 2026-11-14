import {
  CFContext,
  jsonResponse,
  generateNewsletterHtml,
  sendEmailViaCloudflareApi,
} from '../../_shared';

export async function onRequestPost(context: CFContext): Promise<Response> {
  try {
    const body: any = await context.request.json().catch(() => ({}));
    const targetEmail = String(body?.targetEmail || '').trim();
    if (!targetEmail) {
      return jsonResponse({ error: 'กรุณาระบุอีเมลปลายทางที่จะทดสอบส่ง' }, 400);
    }

    const htmlContent = generateNewsletterHtml({
      storyTitle: 'ทดสอบระบบส่งอีเมลข่าวสาร สตง. (Test Email)',
      summary:
        'นี่คืออีเมลทดสอบความพร้อมของระบบแจ้งเตือนข่าวประชาสัมพันธ์ สำนักงานการตรวจเงินแผ่นดิน (PR - SAI Thailand)\n\nหากท่านได้รับข้อความนี้ แสดงว่าระบบส่งอีเมลบน Cloudflare Pages พร้อมใช้งานเรียบร้อยแล้ว',
      category: 'ทดสอบระบบแจ้งเตือน',
      date: new Date().toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      appUrl: context.env?.APP_URL || new URL(context.request.url).origin,
      recipientEmail: targetEmail,
    });

    const result = await sendEmailViaCloudflareApi(context.env || {}, {
      to: targetEmail,
      subject: '✅ [สตง. ทดสอบระบบ] ยืนยันการเชื่อมต่อระบบส่งอีเมลแจ้งเตือนข่าว PR - SAI Thailand',
      html: htmlContent,
    });

    if (!result.ok) {
      return jsonResponse(
        {
          error: result.error || 'ส่งอีเมลทดสอบไม่สำเร็จ',
          hint: 'ตั้งค่า RESEND_API_KEY หรือ EMAIL_WEBHOOK_URL ใน Cloudflare Pages Environment Variables',
        },
        400
      );
    }

    return jsonResponse({
      success: true,
      isReal: true,
      messageId: result.messageId,
      accepted: [targetEmail],
      recipient: targetEmail,
      sender: context.env?.EMAIL_FROM || 'PR - SAI Thailand',
      note: `ส่งอีเมลจริงไปยัง ${targetEmail} ผ่าน ${result.provider} สำเร็จเรียบร้อย!`,
    });
  } catch (err: any) {
    return jsonResponse({ error: err?.message || 'เกิดข้อผิดพลาดในการส่งอีเมลทดสอบ' }, 500);
  }
}
