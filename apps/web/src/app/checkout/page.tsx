'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { formatTND } from '@filahi/types'

export default function CheckoutPage() {
  const router = useRouter()
  const { state, totalMillimes, clearCart, setDeliveryAddress, setDeliveryNotes } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (state.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <span className="text-5xl">🛒</span>
        <h1 className="mt-4 text-2xl font-bold text-ink-900">Votre panier est vide</h1>
        <Link href="/marketplace" className="btn-primary mt-6 inline-block">
          Voir le marché
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const address = formData.get('deliveryAddress') as string
    const notes = formData.get('deliveryNotes') as string

    setDeliveryAddress(address)
    setDeliveryNotes(notes)

    try {
      const orderIds: string[] = []

      for (const item of state.items) {
        const res = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inventoryItemId: String(item.inventoryItemId),
            quantity: item.quantity,
            deliveryAddress: address,
            deliveryNotes: notes,
            idempotencyKey: crypto.randomUUID(),
          }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error ?? 'Échec de la commande')
        }

        const data = await res.json()
        orderIds.push(data.orderId)
      }

      clearCart()
      if (orderIds.length === 1) {
        router.push(`/orders/${orderIds[0]}`)
      } else {
        router.push('/orders')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <p className="font-display text-xs font-medium uppercase tracking-[0.15em] text-gold-500">
        الدفع — Confirmation
      </p>
      <h1 className="section-title mt-1">Finaliser la commande</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="card p-5">
          <h2 className="mb-4 font-display text-base font-bold text-ink-800">Récapitulatif</h2>
          <div className="space-y-2">
            {state.items.map((item) => (
              <div key={item.inventoryItemId} className="flex items-center justify-between text-sm">
                <span className="text-ink-600">
                  {item.productName} × {item.quantity}
                </span>
                <span className="font-medium text-ink-900">
                  {formatTND(item.unitPriceMillimes * item.quantity)}
                </span>
              </div>
            ))}
            <div className="border-t border-cream-200 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink-700">Total</span>
                <span className="font-display text-xl font-bold text-ink-900">
                  {formatTND(totalMillimes)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-display text-base font-bold text-ink-800">Livraison</h2>
          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Adresse de livraison *</span>
            <textarea
              name="deliveryAddress"
              required
              rows={3}
              placeholder="Rue, ville, code postal..."
              className="w-full rounded-lg border border-cream-200 bg-cream-50 px-3 py-2 text-sm text-ink-900 placeholder-ink-400 focus:border-olive-500 focus:outline-none focus:ring-1 focus:ring-olive-500"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Notes (optionnel)</span>
            <textarea
              name="deliveryNotes"
              rows={2}
              placeholder="Instructions de livraison..."
              className="w-full rounded-lg border border-cream-200 bg-cream-50 px-3 py-2 text-sm text-ink-900 placeholder-ink-400 focus:border-olive-500 focus:outline-none focus:ring-1 focus:ring-olive-500"
            />
          </label>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <Link href="/cart" className="btn-ghost text-sm">
            ← Retour
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1 text-base disabled:opacity-50"
          >
            {submitting ? 'Commande en cours...' : `Confirmer la commande — ${formatTND(totalMillimes)}`}
          </button>
        </div>
      </form>
    </div>
  )
}
