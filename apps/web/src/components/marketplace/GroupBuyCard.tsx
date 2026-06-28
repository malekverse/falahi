'use client'

import React from 'react'
import { formatTND } from '@filahi/types'
import type { GroupBuyWithItem } from '@filahi/types'

interface GroupBuyCardProps {
  groupBuy: GroupBuyWithItem
}

export const GroupBuyCard = React.memo(function GroupBuyCard({ groupBuy }: GroupBuyCardProps) {
  const progressPct = (groupBuy.current_quantity / groupBuy.target_quantity) * 100
  const isExpired = new Date(groupBuy.expires_at) < new Date()
  const isFull = groupBuy.status === 'fulfilled'

  return (
    <div
      className={`market-card relative ${isFull ? 'opacity-60' : ''} ${isExpired && !isFull ? 'border-red-300' : ''}`}
      role="article"
      aria-label={`Achat groupé: ${groupBuy.product_name}, ${groupBuy.current_quantity}/${groupBuy.target_quantity} ${groupBuy.unit}`}
    >
      <div className="p-4 pt-5">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="text-base font-bold text-ink-900">{groupBuy.product_name}</h3>
          <span className="shrink-0 rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-semibold text-gold-700">
            Groupé
          </span>
        </div>

        <p className="mb-2 text-sm text-ink-500">
          Prix unitaire:{' '}
          <span className="font-semibold text-ink-900">{formatTND(groupBuy.unit_price_millimes)}</span>
          {' / '}{groupBuy.unit}
        </p>

        <p className="mb-1 text-xs text-ink-400">
          Créé par {groupBuy.creator_name ?? 'un acheteur'}{groupBuy.creator_location ? ` · ${groupBuy.creator_location}` : ''}
        </p>

        <div className="mb-3 mt-3">
          <div className="flex items-center justify-between text-xs text-ink-500">
            <span>Progression</span>
            <span>{groupBuy.current_quantity} / {groupBuy.target_quantity} {groupBuy.unit}</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-cream-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-olive-400 to-olive-600 transition-all duration-500"
              style={{ width: `${Math.min(progressPct, 100)}%` }}
            />
          </div>
        </div>

        {isFull && (
          <p className="mb-2 rounded-md bg-olive-100 px-2 py-1 text-center text-sm font-medium text-olive-800">
            Objectif atteint !
          </p>
        )}

        {!isFull && (
          <p className="text-[11px] text-ink-400">
            Expire le {new Date(groupBuy.expires_at).toLocaleDateString('fr-TN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
})
