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

  async function loginWithEmail(email: string, password: string) {
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.session) {
      setLoading(false)
      alert(error?.message ?? 'Login failed')
      return
    }

    const res = await fetch('/api/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const err = await res.json()
      alert(err.error || 'Failed to establish session')
      return
    }

    window.location.href = '/marketplace'
  }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">{t.login.title}</h1>

        <div className="mb-6 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          <strong>Dev login:</strong><br />
          Admin: admin@filahi.tn / TestAdmin123!<br />
          Buyers: any email with password TestBuyer123!<br />
          Farmers/Drivers: use phone OTP below
        </div>

        <details className="mb-6">
          <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900">
            Email/Password login (dev only)
          </summary>
          <div className="mt-3 space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@filahi.tn"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              onClick={() => loginWithEmail(email, password)}
              disabled={loading || !email || !password}
              className="w-full rounded bg-gray-800 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              Sign in with Email
            </button>
          </div>
        </details>

        <div className="mb-4 text-center text-sm text-gray-400">— or phone OTP —</div>

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
