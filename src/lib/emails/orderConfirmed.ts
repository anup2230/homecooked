export function orderConfirmedSubject(cookName: string) {
  return `Order confirmed by ${cookName}! ✅`;
}

export function orderConfirmedHtml({
  buyerName,
  cookName,
  dishTitle,
  pickupAddress,
  pickupTime,
  confirmationMessage,
}: {
  buyerName: string;
  cookName: string;
  dishTitle: string;
  pickupAddress?: string | null;
  pickupTime?: string | null;
  confirmationMessage?: string | null;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px;">
  <h2 style="color:#2e7d32;">✅ Order Confirmed!</h2>
  <p>Hi ${buyerName},</p>
  <p><strong>${cookName}</strong> has confirmed your order for <strong>${dishTitle}</strong>.</p>
  ${confirmationMessage ? `<blockquote style="border-left:3px solid #e07b39;padding-left:12px;color:#555;margin:16px 0;">"${confirmationMessage}"<br/><em>— ${cookName}</em></blockquote>` : ''}
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    ${pickupAddress ? `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;"><strong>Pickup Address</strong></td><td style="padding:8px 0;border-bottom:1px solid #eee;">${pickupAddress}</td></tr>` : ''}
    ${pickupTime ? `<tr><td style="padding:8px 0;"><strong>Pickup Time</strong></td><td style="padding:8px 0;">${pickupTime}</td></tr>` : ''}
  </table>
  <p style="color:#666;">Get ready — your food is being prepared with love. 🍳</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">Homecooked — real food from real kitchens.</p>
</body>
</html>`;
}
