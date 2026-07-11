import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || 'noreply@homecooked.app';

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (
    !process.env.RESEND_API_KEY ||
    process.env.RESEND_API_KEY.startsWith('re_placeholder')
  ) {
    console.log('[email] RESEND_API_KEY not set, skipping email to', to);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error('[email] Failed to send email:', err);
    // Don't throw — email failure should not break the order flow
  }
}
