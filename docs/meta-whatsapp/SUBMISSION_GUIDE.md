# WhatsApp Template Submission Guide

## Prerequisites
- Meta Business Account linked to WhatsApp Business API
- Access to https://business.facebook.com/wa/manage/phone-numbers/
- WABA (WhatsApp Business Account) with approved phone number

## Steps

### 1. Log into Meta Business Platform
Go to https://business.facebook.com/wa/manage/message-templates/
Select your WABA.

### 2. Create Each Template
For each template in `templates.json`:

1. Click **Create Template**
2. Category: **Marketing** → switch to **Transactional** (these are transaction-related)
3. Name: Use the exact name from templates.json (e.g., `listing_confirmation`)
4. Language: **Arabic (ar)**
5. Body: Copy the body text from templates.json

**Critical rules:**
- Emojis are NOT allowed in template submissions at submission time (add them in the code when sending)
- Variable placeholders must use `{{1}}`, `{{2}}`, etc. format
- Example values must be provided for every placeholder
- Submit in Arabic (Darija dialect is not a separate language option in Meta)

### 3. After Approval
Once approved, update `.env.local` with the template names:
```
META_WA_TEMPLATE_WELCOME=welcome
META_WA_TEMPLATE_CONFIRMATION=listing_confirmation
META_WA_TEMPLATE_CLARIFICATION=clarification_needed
META_WA_TEMPLATE_LISTING_LIVE=listing_live
META_WA_TEMPLATE_PICKUP_OTP=pickup_otp
META_WA_TEMPLATE_PAYOUT=payout_notice
META_WA_TEMPLATE_PAYMENT_STATUS=payment_status
```

### 4. Send Template Messages
Use the Meta Cloud API endpoint:
```
POST https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages
{
  "messaging_product": "whatsapp",
  "to": "216XXXXXXXXX",
  "type": "template",
  "template": {
    "name": "welcome",
    "language": { "code": "ar" }
  }
}
```

### 5. Notes
- User-initiated conversations are free for 24 hours (no template needed)
- Templates are only needed for business-initiated conversations or after 24h
- The free tier includes 1,000 business-initiated conversations per month
- Re-submit if a template is rejected — Meta often rejects on first pass
