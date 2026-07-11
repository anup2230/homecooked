export function orderPlacedSubject(cookName: string) {
  return `Your order from ${cookName} is placed! 🍽️`;
}

export function orderPlacedHtml({
  buyerName,
  cookName,
  kitchenName,
  dishTitle,
  quantity,
  totalPrice,
  pickupSlot,
}: {
  buyerName: string;
  cookName: string;
  kitchenName: string;
  dishTitle: string;
  quantity: number;
  totalPrice: number;
  pickupSlot?: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px;">
  <h2 style="color:#e07b39;">🍽️ Order Placed!</h2>
  <p>Hi ${buyerName},</p>
  <p>Your order from <strong>${kitchenName}</strong> (${cookName}) has been received. Here's your summary:</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr><td style="padding:8px 0;border-bottom:1px solid #eee;"><strong>Dish</strong></td><td style="padding:8px 0;border-bottom:1px solid #eee;">${dishTitle}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #eee;"><strong>Quantity</strong></td><td style="padding:8px 0;border-bottom:1px solid #eee;">${quantity}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #eee;"><strong>Total</strong></td><td style="padding:8px 0;border-bottom:1px solid #eee;"><strong>$${(totalPrice).toFixed(2)}</strong></td></tr>
    ${pickupSlot ? `<tr><td style="padding:8px 0;"><strong>Pickup Slot</strong></td><td style="padding:8px 0;">${pickupSlot}</td></tr>` : ''}
  </table>
  <p style="color:#666;">We'll notify you when the cook confirms your order.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">Homecooked — real food from real kitchens.</p>
</body>
</html>`;
}
