export function orderConfirmedCookSubject(buyerName: string) {
  return `New order from ${buyerName}! 🛎️`;
}

export function orderConfirmedCookHtml({
  cookName,
  buyerName,
  dishTitle,
  quantity,
  notes,
  orderId,
}: {
  cookName: string;
  buyerName: string;
  dishTitle: string;
  quantity: number;
  notes?: string | null;
  orderId: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px;">
  <h2 style="color:#e07b39;">🛎️ New Order!</h2>
  <p>Hi ${cookName},</p>
  <p><strong>${buyerName}</strong> just placed an order. Here are the details:</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr><td style="padding:8px 0;border-bottom:1px solid #eee;"><strong>Dish</strong></td><td style="padding:8px 0;border-bottom:1px solid #eee;">${dishTitle}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #eee;"><strong>Quantity</strong></td><td style="padding:8px 0;border-bottom:1px solid #eee;">${quantity}</td></tr>
    ${notes ? `<tr><td style="padding:8px 0;"><strong>Notes from buyer</strong></td><td style="padding:8px 0;font-style:italic;">"${notes}"</td></tr>` : ''}
  </table>
  <p>Log in to confirm or cancel this order:</p>
  <a href="${process.env.NEXTAUTH_URL || 'https://homecooked.app'}/orders/${orderId}" style="display:inline-block;background:#e07b39;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">View Order →</a>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">Homecooked — real food from real kitchens.</p>
</body>
</html>`;
}
