'use client'

import { useState, useEffect } from 'react'
import { formatTND } from '@filahi/types'
import type { Order } from '@filahi/types'

const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

const INTERVAL_LABELS: Record<string, string> = {
  weekly: 'Chaque semaine',
  biweekly: 'Toutes les 2 semaines',
  monthly: 'Chaque mois',
}

export default function B2BPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    try {
      const res = await fetch('/api/orders/recurring')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setOrders(data.orders ?? [])
    } catch (err) {
      setError('Impossible de charger vos commandes récurrentes.')
    } finally {
      setLoading(false)
    }
  }

  async function cancelRecurring(orderId: string) {
    if (!confirm('Annuler la récurrence de cette commande ?')) return
    try {
      const res = await fetch('/api/orders/recurring', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      if (!res.ok) throw new Error('Failed')
      await fetchOrders()
    } catch {
      setError('Erreur lors de l\'annulation.')
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="h-8 w-48 animate-pulse rounded bg-cream-200" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-cream-100" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="font-display text-xs font-medium uppercase tracking-[0.15em] text-gold-500">
        أعمال — Commandes B2B
      </p>
      <h1 className="section-title mt-1">Commandes récurrentes</h1>
      <p className="mt-2 max-w-lg text-sm text-ink-500">
        Gérez vos commandes automatiques hebdomadaires, bi-hebdomadaires ou mensuelles.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="card mt-8 flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="text-4xl">📋</span>
          <p className="text-lg font-medium text-ink-700">Aucune commande récurrente</p>
          <p className="text-sm text-ink-500">
            Après avoir passé une commande, vous pourrez la rendre récurrente depuis la page de confirmation.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="font-medium text-ink-900">
                  {formatTND(order.total_price_millimes)} ·{' '}
                  <span className="text-sm text-ink-500">{INTERVAL_LABELS[order.recurrence_interval ?? '']}</span>
                </p>
                <p className="text-sm text-ink-500">
                  {DAY_NAMES[order.recurrence_day ?? 0]} · Prochaine:{' '}
                  {order.next_recurrence_at
                    ? new Date(order.next_recurrence_at).toLocaleDateString('fr-TN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    order.status === 'delivered'
                      ? 'bg-green-100 text-green-700'
                      : order.status === 'pending'
                        ? 'bg-gold-100 text-gold-700'
                        : 'bg-ink-100 text-ink-600'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => cancelRecurring(order.id)}
                className="btn-ghost shrink-0 self-start text-sm text-red-500 hover:text-red-700 sm:self-center"
              >
                Annuler
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 rounded-xl border border-cream-200 bg-cream-50 p-5">
        <h2 className="font-display text-base font-bold text-ink-800">Fonctionnement</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-600">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-gold-500">⏤</span>
            La récurrence démarre après la première livraison réussie.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-gold-500">⏤</span>
            La commande est automatiquement générée 72h avant le jour de livraison choisi.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-gold-500">⏤</span>
            Vous pouvez annuler à tout moment depuis cette page.
          </li>
        </ul>
      </div>
    </div>
  )
}
