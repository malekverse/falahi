import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatTND } from '@filahi/types'

export default async function AdminInventoryPage() {
  const supabase = await createServerSupabaseClient()

  const { data: items } = await supabase
    .from('inventory_items')
    .select('*, profiles!inventory_items_farmer_id_fkey(full_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Inventaire</h1>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium">Produit</th>
              <th className="px-4 py-3 font-medium">Agriculteur</th>
              <th className="px-4 py-3 font-medium">Quantité</th>
              <th className="px-4 py-3 font-medium">Prix</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {(items || []).map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{item.product_name}</td>
                <td className="px-4 py-3">{item.profiles?.full_name || '-'}</td>
                <td className="px-4 py-3">{item.quantity} {item.unit}</td>
                <td className="px-4 py-3">
                  {item.platform_price_millimes ? formatTND(item.platform_price_millimes) : '-'}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.status === 'available' ? 'bg-green-100 text-green-700' :
                    item.status === 'pending_confirmation' ? 'bg-yellow-100 text-yellow-700' :
                    item.status === 'sold' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{item.source}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(item.created_at).toLocaleDateString('fr-TN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(!items || items.length === 0) && (
        <p className="py-8 text-center text-gray-500">Aucun produit</p>
      )}
    </div>
  )
}
