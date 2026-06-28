import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatTND } from '@filahi/types'
import { CsvExportButton } from './client'

export default async function AdminLedgerPage() {
  const supabase = await createServerSupabaseClient()

  const { data: entries } = await supabase
    .from('ledger_entries')
    .select('id, entry_type, amount_millimes, party_id, payment_method, reference, notes, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const totalRevenue = (entries || [])
    .filter((e) => e.entry_type === 'platform_commission')
    .reduce((sum, e) => sum + e.amount_millimes, 0)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold">Comptabilité</h1>
          <p className="text-lg text-gray-600">
            Revenu total commission: <span className="font-bold text-green-700">{formatTND(totalRevenue)}</span>
          </p>
        </div>
        <CsvExportButton entries={entries || []} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Montant</th>
              <th className="px-4 py-3 font-medium">Partie</th>
              <th className="px-4 py-3 font-medium">Méthode</th>
              <th className="px-4 py-3 font-medium">Référence</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {(entries || []).map((entry) => (
              <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize">
                    {entry.entry_type}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">
                  {formatTND(entry.amount_millimes)}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{entry.party_id?.slice(0, 8) || '-'}</td>
                <td className="px-4 py-3">{entry.payment_method || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{entry.reference || '-'}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(entry.created_at).toLocaleDateString('fr-TN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(!entries || entries.length === 0) && (
        <p className="py-8 text-center text-gray-500">Aucune entrée</p>
      )}
    </div>
  )
}
