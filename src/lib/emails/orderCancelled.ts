export function orderCancelledSubject() {
  return `Your order has been cancelled`;
}

export function orderCancelledHtml({
  buyerName,
  dishTitle,
  cookName,
  totalPrice,
}: {
  buyerName: string;
  dishTitle: string;
  cookName: string;
  totalPrice: number;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px;">
  <h2 style="color:#c62828;">Order Cancelled</h2>
  <p>Hi ${buyerName},</p>
  <p>Unfortunately your order has been cancelled.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr><td style="padding:8px 0;border-bottom:1px solid #eee;"><strong>Dish</strong></td><td style="padding:8px 0;border-bottom:1px solid #eee;">${dishTitle}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #eee;"><strong>Cook</strong></td><td style="padding:8px 0;border-bottom:1px solid #eee;">${cookName}</td></tr>
    <tr><td style="padding:8px 0;"><strong>Order Total</strong></td><td style="padding:8px 0;">$${(totalPrice).toFixed(2)}</td></tr>
  </table>
  <p style="background:#fff8e1;border-left:4px solid #f9a825;padding:12px 16px;border-radius:4px;">
    💳 If you were charged, your payment will be refunded within <strong>5–10 business days</strong> to your original payment method.
  </p>
  <p style="color:#666;">We're sorry this didn't work out. Browse other cooks on Homecooked and find something delicious.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">Homecooked — real food from real kitchens.</p>
</body>
</html>`;
}
