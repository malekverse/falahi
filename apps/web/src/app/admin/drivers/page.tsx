import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDriversPage() {
  const supabase = await createServerSupabaseClient()

  const { data: drivers } = await supabase
    .from('driver_profiles')
    .select('*, profiles!driver_profiles_id_fkey(full_name, phone_number)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Chauffeurs</h1>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Téléphone</th>
              <th className="px-4 py-3 font-medium">Véhicule</th>
              <th className="px-4 py-3 font-medium">Immatriculation</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Trajets</th>
              <th className="px-4 py-3 font-medium">Vérifié</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(drivers || []).map((driver) => (
              <tr key={driver.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{driver.profiles?.full_name || '-'}</td>
                <td className="px-4 py-3">{driver.profiles?.phone_number || '-'}</td>
                <td className="px-4 py-3">{driver.vehicle_type}</td>
                <td className="px-4 py-3">{driver.vehicle_plate}</td>
                <td className="px-4 py-3">Tier {driver.trust_tier}</td>
                <td className="px-4 py-3">{driver.trust_score}/5</td>
                <td className="px-4 py-3">{driver.total_trips}</td>
                <td className="px-4 py-3">
                  {driver.is_verified
                    ? <span className="text-green-600">✓</span>
                    : <span className="text-red-400">—</span>}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/whatsapp?to=${(driver.profiles?.phone_number || '').replace(/^\+?216/, '')}`}
                    className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                  >
                    WhatsApp
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(!drivers || drivers.length === 0) && (
        <p className="py-8 text-center text-gray-500">Aucun chauffeur</p>
      )}
    </div>
  )
}
