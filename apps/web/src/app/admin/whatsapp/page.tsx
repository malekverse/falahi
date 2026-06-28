'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendWhatsAppMessage } from '@filahi/utils'

const TEMPLATES = [
  { id: 'listing_confirmed', label: 'Listing confirmé', body: 'Salam aalikom. Votre produit {product} a été confirmé et publié sur le marché.' },
  { id: 'driver_assigned', label: 'Chauffeur assigné', body: 'Salam aalikom. Un chauffeur a été assigné pour récupérer votre produit {product}. Il arrive bientôt.' },
  { id: 'payment_received', label: 'Paiement reçu', body: 'Salam aalikom. Le paiement pour votre produit {product} a été reçu. Vous recevrez votre argent sous 48h.' },
  { id: 'custom', label: 'Message personnalisé', body: '' },
]

export default function AdminWhatsAppPage() {
  const [recipientPhone, setRecipientPhone] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  function applyTemplate(templateId: string) {
    setSelectedTemplate(templateId)
    const tpl = TEMPLATES.find((t) => t.id === templateId)
    if (tpl) {
      setMessageBody(tpl.body)
    }
  }

  async function handleSend() {
    if (!recipientPhone || !messageBody) return

    setSending(true)
    setSent(false)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Non connecté')
        return
      }

      const response = await fetch('/api/admin/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          to: `216${recipientPhone.replace(/^0/, '')}`,
          message: messageBody,
        }),
      })

      if (response.ok) {
        setSent(true)
        setMessageBody('')
        setRecipientPhone('')
      } else {
        const err = await response.json()
        alert(err.error || 'Erreur lors de l\'envoi')
      }
    } catch {
      alert('Erreur réseau')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Envoyer WhatsApp</h1>

      {sent && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Message envoyé
        </div>
      )}

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Numéro du destinataire (ex: 20123456)
        </label>
        <input
          type="tel"
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2"
          value={recipientPhone}
          onChange={(e) => setRecipientPhone(e.target.value)}
          placeholder="20123456"
        />

        <label className="mb-1 block text-sm font-medium text-gray-700">
          Modèle de message
        </label>
        <div className="mb-4 flex flex-wrap gap-2">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              className={`rounded-full px-3 py-1 text-sm ${
                selectedTemplate === tpl.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => applyTemplate(tpl.id)}
            >
              {tpl.label}
            </button>
          ))}
        </div>

        <label className="mb-1 block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          className="mb-4 min-h-[120px] w-full rounded-lg border border-gray-300 px-3 py-2"
          value={messageBody}
          onChange={(e) => setMessageBody(e.target.value)}
          placeholder="Écrivez le message en Darija..."
        />

        <button
          className="rounded-lg bg-green-600 px-6 py-2 text-white disabled:opacity-50"
          onClick={handleSend}
          disabled={sending || !recipientPhone || !messageBody}
        >
          {sending ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>
    </div>
  )
}
