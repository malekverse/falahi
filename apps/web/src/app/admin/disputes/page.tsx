import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function AdminDisputesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: disputes } = await supabase
    .from('disputes')
    .select('*, profiles!disputes_raised_by_fkey(full_name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Litiges</h1>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Signaleur</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {(disputes || []).map((d) => (
              <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium capitalize">{d.dispute_type}</td>
                <td className="px-4 py-3">{d.profiles?.full_name || '-'}</td>
                <td className="px-4 py-3 max-w-xs truncate text-gray-500">{d.description || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    d.status === 'open' ? 'bg-red-100 text-red-700' :
                    d.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(d.created_at).toLocaleDateString('fr-TN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(!disputes || disputes.length === 0) && (
        <p className="py-8 text-center text-gray-500">Aucun litige</p>
      )}
    </div>
  )
}
