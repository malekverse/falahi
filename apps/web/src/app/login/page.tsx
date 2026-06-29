'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/context'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('sms')
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const supabase = createClient()

  function normalizePhone(raw: string) {
    return `+216${raw.replace(/^\+216/, '').replace(/^00216/, '')}`
  }

  async function sendSmsOtp() {
    setChannel('sms')
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizePhone(phone),
    })
    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }
    setStep('otp')
  }

  async function sendWhatsAppOtp() {
    setChannel('whatsapp')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/send-whatsapp-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizePhone(phone) }),
      })

      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to send code')
        return
      }

      setStep('otp')
    } catch {
      alert('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function verifySmsOtp() {
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      phone: normalizePhone(phone),
      token: otp,
      type: 'sms',
    })
    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }
    window.location.href = '/marketplace'
  }

  async function verifyWhatsAppOtp() {
    setLoading(true)

    try {
      const res = await fetch('/api/auth/verify-whatsapp-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizePhone(phone), otp }),
      })

      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Invalid code')
        return
      }

      window.location.href = data.redirect || '/marketplace'
    } catch {
      alert('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">{t.login.title}</h1>

        {step === 'phone' ? (
          <>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t.login.phoneNumber}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="20 123 456"
              className="mb-4 w-full rounded border border-gray-300 px-3 py-2"
            />

            <button
              onClick={sendSmsOtp}
              disabled={loading || phone.length < 8}
              className="w-full rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {loading && channel === 'sms' ? t.login.sending : t.login.sendCode}
            </button>

            <div className="my-3 text-center text-sm text-gray-400">{t.login.or}</div>

            <button
              onClick={sendWhatsAppOtp}
              disabled={loading || phone.length < 8}
              className="w-full rounded bg-green-500 px-4 py-2 text-white disabled:opacity-50"
            >
              {loading && channel === 'whatsapp' ? t.login.sending : t.login.sendViaWhatsApp}
            </button>
          </>
        ) : (
          <>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {channel === 'sms' ? t.login.enterCode : t.login.enterWhatsAppCode}
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="mb-4 w-full rounded border border-gray-300 px-3 py-2"
            />
            <button
              onClick={channel === 'sms' ? verifySmsOtp : verifyWhatsAppOtp}
              disabled={loading || otp.length < 4}
              className="w-full rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? t.login.verifying : t.login.verify}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
