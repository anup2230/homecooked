export function orderReadySubject() {
  return `Your order is ready for pickup! 🎉`;
}

export function orderReadyHtml({
  buyerName,
  dishTitle,
  cookName,
  pickupAddress,
  cookPhone,
}: {
  buyerName: string;
  dishTitle: string;
  cookName: string;
  pickupAddress?: string | null;
  cookPhone?: string | null;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px;">
  <h2 style="color:#2e7d32;">🎉 Your Order is Ready!</h2>
  <p>Hi ${buyerName},</p>
  <p>Great news! Your <strong>${dishTitle}</strong> from <strong>${cookName}</strong> is ready for pickup.</p>
  ${pickupAddress ? `
  <div style="background:#f1f8e9;border-left:4px solid #66bb6a;padding:12px 16px;border-radius:4px;margin:16px 0;">
    <strong>📍 Pickup Address</strong><br/>${pickupAddress}
  </div>` : ''}
  ${cookPhone ? `<p>📞 Cook's phone: <a href="tel:${cookPhone}">${cookPhone}</a></p>` : ''}
  <p style="color:#666;">Head over and enjoy your meal! 🍽️</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">Homecooked — real food from real kitchens.</p>
</body>
</html>`;
}
