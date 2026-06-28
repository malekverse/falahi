'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/context'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const supabase = createClient()

  async function sendOtp() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+216${phone.replace(/^\+216/, '')}`,
    })
    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }
    setStep('otp')
  }

  async function verifyOtp() {
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      phone: `+216${phone.replace(/^\+216/, '')}`,
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
              onClick={sendOtp}
              disabled={loading || phone.length < 8}
              className="w-full rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? t.login.sending : t.login.sendCode}
            </button>
          </>
        ) : (
          <>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t.login.enterCode}
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="mb-4 w-full rounded border border-gray-300 px-3 py-2"
            />
            <button
              onClick={verifyOtp}
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
