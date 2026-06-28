'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Dispute {
  id: number
  trip_id: string | null
  raised_by: string | null
  dispute_type: string
  description: string | null
  status: string
  created_at: string
}

const DISPUTE_TYPE_LABELS: Record<string, string> = {
  cargo_theft: 'Vol de cargaison',
  otp_failure: 'Échec OTP',
  gps_loss: 'Perte de signal GPS',
  quality_issue: 'Problème de qualité',
  no_show: 'Absence',
  other: 'Autre',
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDisputes()
  }, [])

  async function loadDisputes() {
    const supabase = createClient()
    const { data } = await supabase
      .from('disputes')
      .select('*')
      .order('created_at', { ascending: false })

    setDisputes(data || [])
    setLoading(false)
  }

  async function resolveDispute(id: number, status: string) {
    const supabase = createClient()
    await supabase
      .from('disputes')
      .update({ status, resolution_notes: 'Résolu par l\'administrateur' })
      .eq('id', id)

    loadDisputes()
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Litiges</h1>

      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
        <strong>Processus de résolution :</strong> Vérifier le statut du trajet, les logs GPS,
        et les tentatives OTP. Si un chauffeur a marqué le ramassage mais il n&apos;y a pas de trace
        GPS pendant plus de 10 minutes, contacter le chauffeur par téléphone.
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {disputes.map((d) => (
              <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">#{d.id}</td>
                <td className="px-4 py-3">{DISPUTE_TYPE_LABELS[d.dispute_type] || d.dispute_type}</td>
                <td className="max-w-xs truncate px-4 py-3">{d.description || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    d.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    d.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(d.created_at).toLocaleDateString('fr-TN')}
                </td>
                <td className="px-4 py-3">
                  {d.status === 'open' && (
                    <div className="flex gap-1">
                      <button
                        className="rounded bg-yellow-600 px-2 py-1 text-xs text-white"
                        onClick={() => resolveDispute(d.id, 'investigating')}
                      >
                        Enquêter
                      </button>
                      <button
                        className="rounded bg-green-600 px-2 py-1 text-xs text-white"
                        onClick={() => resolveDispute(d.id, 'resolved')}
                      >
                        Résoudre
                      </button>
                    </div>
                  )}
                  {d.status === 'investigating' && (
                    <button
                      className="rounded bg-green-600 px-2 py-1 text-xs text-white"
                      onClick={() => resolveDispute(d.id, 'resolved')}
                    >
                      Résoudre
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && disputes.length === 0 && (
        <p className="py-8 text-center text-gray-500">Aucun litige</p>
      )}
    </div>
  )
}
