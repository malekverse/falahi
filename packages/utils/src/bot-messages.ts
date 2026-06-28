export const BOT_MESSAGES = {
  welcome: (name?: string) => `
أهلاً وسهلاً ${name ? 'يا ' + name : ''}! 🌿
أنا بوت فلاحي. نقدر نعاونك تبيع محصولك مباشرة بسعر أحسن.

إرسلي رسالة صوتية أو كتابية فيها:
- شنو عندك للبيع
- الكمية
- وين أنت (المنطقة)

مثال: "عندي 200 حارة بيض بلدي في المطر"
  `.trim(),

  clarification_needed: `
ما فهمتكش مليح 🙏
ممكن تعيد وترسلي رسالة صوتية واضحة أكثر؟
أو اكتب لي:
- شنو تحب تبيع
- الكمية
- المنطقة متاعك
  `.trim(),

  listing_confirmation: (item: {
    product_name: string
    quantity: number
    unit: string
    location_name: string
    asking_price_tnd?: number
  }) => `
تمام يا عمي! 👍 فهمت:

📦 المنتج: ${item.product_name}
🔢 الكمية: ${item.quantity} ${item.unit}
📍 المنطقة: ${item.location_name}
${item.asking_price_tnd ? `💰 السعر: ${item.asking_price_tnd} دينار` : ''}

هل تأكد؟
  `.trim(),

  listing_live: `
ممتاز! 🎉 حطينا عرضك على الموقع.
المشترين يشوفوه دروا.
باش تعرف حال الفلوس، ابعثلي "فلوسي" في أي وقت.
  `.trim(),

  listing_cancelled: `
تمام، حذفنا العرض.
باش تبيع، ابعثلي رسالة صوتية جديدة.
  `.trim(),

  payment_status: (transactions: Array<{
    date: string
    product: string
    amount_tnd: number
    status: 'pending' | 'paid'
  }>) => {
    if (transactions.length === 0) {
      return `ما عندكش معاملات حتى الآن. باش تبيع، ابعثلي رسالة بالمنتج متاعك.`
    }
    const lines = transactions.map(t =>
      `- ${t.date}: ${t.product} → ${t.amount_tnd} دينار (${t.status === 'paid' ? '✅ مدفوع' : '⏳ في الانتظار'})`,
    )
    return `آخر معاملاتك:\n${lines.join('\n')}`
  },

  pickup_otp: (code: string, driverName: string) => `
🚛 السواق ${driverName} وصل عندك!
كودك السري: *${code}*
عطيه هذا الكود باش يأكد الاستلام.
  `.trim(),

  payout_notice: (amount_tnd: number, method: string) => `
✅ تم التسليم بنجاح!
فلوسك: ${amount_tnd} دينار
طريقة الدفع: ${method}
نشكرك يا عمي، بارك الله فيك 🌿
  `.trim(),
}
