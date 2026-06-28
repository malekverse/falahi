import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function AdminFarmersPage() {
  const supabase = await createServerSupabaseClient()

  const { data: farmers } = await supabase
    .from('profiles')
    .select('id, full_name, phone_number, whatsapp_id, created_at')
    .eq('role', 'farmer')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Agriculteurs</h1>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Téléphone</th>
              <th className="px-4 py-3 font-medium">WhatsApp</th>
              <th className="px-4 py-3 font-medium">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {(farmers || []).map((farmer) => (
              <tr key={farmer.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{farmer.full_name}</td>
                <td className="px-4 py-3">{farmer.phone_number}</td>
                <td className="px-4 py-3 font-mono text-xs">{farmer.whatsapp_id || '-'}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(farmer.created_at).toLocaleDateString('fr-TN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(!farmers || farmers.length === 0) && (
        <p className="py-8 text-center text-gray-500">Aucun agriculteur</p>
      )}
    </div>
  )
}
