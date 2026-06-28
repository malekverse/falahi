'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Settlement {
  id: string
  trip_id: string
  farmer_id: string
  farmer_name: string
  amount_millimes: number
  status: string
  created_at: string
}

export default function AdminPayoutsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettlements()
  }, [])

  async function loadSettlements() {
    const supabase = createClient()
    const { data } = await supabase
      .from('trips')
      .select(`
        id,
        payout_millimes,
        payment_status,
        created_at,
        farmer_id,
        profiles!trips_farmer_id_fkey(full_name)
      `)
      .in('payment_status', ['held', 'released'])
      .order('created_at', { ascending: false })

    if (data) {
      setSettlements(
        data.map((t: any) => ({
          id: t.id.slice(0, 8),
          trip_id: t.id,
          farmer_id: t.farmer_id,
          farmer_name: t.profiles?.full_name || 'Inconnu',
          amount_millimes: t.payout_millimes || 0,
          status: t.payment_status,
          created_at: t.created_at,
        }))
      )
    }
    setLoading(false)
  }

  async function markDisbursed(tripId: string) {
    const supabase = createClient()
    await supabase
      .from('trips')
      .update({ payment_status: 'disbursed' })
      .eq('id', tripId)

    await supabase.from('ledger_entries').insert({
      trip_id: tripId,
      entry_type: 'farmer_payout',
      amount_millimes: settlements.find((s) => s.trip_id === tripId)?.amount_millimes || 0,
      payment_method: 'manual',
      notes: 'Paiement D17 traité manuellement',
    })

    loadSettlements()
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Paiements D17</h1>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium">Trajet</th>
              <th className="px-4 py-3 font-medium">Agriculteur</th>
              <th className="px-4 py-3 font-medium">Montant</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {settlements.map((s) => (
              <tr key={s.trip_id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{s.id}</td>
                <td className="px-4 py-3">{s.farmer_name}</td>
                <td className="px-4 py-3">{(s.amount_millimes / 1000).toFixed(3)} TND</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    s.status === 'disbursed' ? 'bg-green-100 text-green-700' :
                    s.status === 'released' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(s.created_at).toLocaleDateString('fr-TN')}
                </td>
                <td className="px-4 py-3">
                  {s.status !== 'disbursed' && (
                    <button
                      className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
                      onClick={() => markDisbursed(s.trip_id)}
                    >
                      Marquer payé
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && settlements.length === 0 && (
        <p className="py-8 text-center text-gray-500">Aucun paiement en attente</p>
      )}
    </div>
  )
}
