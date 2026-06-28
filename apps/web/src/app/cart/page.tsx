'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { formatTND } from '@filahi/types'

export default function CartPage() {
  const { state, removeItem, updateQuantity, totalMillimes, itemCount } = useCart()

  if (state.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <span className="text-5xl">🛒</span>
        <h1 className="mt-4 text-2xl font-bold text-ink-900">Votre panier est vide</h1>
        <p className="mt-2 text-sm text-ink-500">
          Parcourez le marché et ajoutez des produits frais de Tunisie.
        </p>
        <Link href="/marketplace" className="btn-primary mt-6 inline-block">
          Voir le marché
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="font-display text-xs font-medium uppercase tracking-[0.15em] text-gold-500">
        السلة — Panier
      </p>
      <h1 className="section-title mt-1">Votre panier ({itemCount} {itemCount > 1 ? 'articles' : 'article'})</h1>

      <div className="mt-8 space-y-3">
        {state.items.map((item) => (
          <div
            key={item.inventoryItemId}
            className="card flex items-center gap-4 p-4"
          >
            <div className="flex flex-1 flex-col gap-1">
              <p className="font-medium text-ink-900">{item.productName}</p>
              <p className="text-xs text-ink-400">{item.locationName} · {item.unit}</p>
              <p className="text-sm font-semibold text-olive-700">
                {formatTND(item.unitPriceMillimes)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuantity(item.inventoryItemId, item.quantity - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-cream-200 text-sm text-ink-600 transition-colors hover:border-olive-400 hover:text-olive-700"
                aria-label="Diminuer la quantité"
              >
                −
              </button>
              <span className="w-8 text-center font-medium text-ink-900">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.inventoryItemId, item.quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-cream-200 text-sm text-ink-600 transition-colors hover:border-olive-400 hover:text-olive-700"
                aria-label="Augmenter la quantité"
              >
                +
              </button>
            </div>

            <p className="w-20 text-right font-medium text-ink-900">
              {formatTND(item.unitPriceMillimes * item.quantity)}
            </p>

            <button
              type="button"
              onClick={() => removeItem(item.inventoryItemId)}
              className="text-sm text-terra-500 transition-colors hover:text-terra-400"
              aria-label={`Retirer ${item.productName}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="card mt-6 p-5">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-ink-700">Total</span>
          <span className="font-display text-2xl font-bold text-ink-900">
            {formatTND(totalMillimes)}
          </span>
        </div>
        <Link
          href="/checkout"
          className="btn-primary mt-4 flex w-full items-center justify-center text-base"
        >
          Commander
        </Link>
      </div>

      <Link
        href="/marketplace"
        className="mt-4 flex items-center justify-center gap-1 text-sm text-ink-500 transition-colors hover:text-olive-700"
      >
        ← Continuer mes achats
      </Link>
    </div>
  )
}
