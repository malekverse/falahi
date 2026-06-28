import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function AdminTripsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: trips } = await supabase
    .from('trips')
    .select('id, origin_location_name, status, driver_id, created_at, last_known_lat, last_known_lng')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Trajets</h1>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Origine</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Chauffeur</th>
              <th className="px-4 py-3 font-medium">Position</th>
              <th className="px-4 py-3 font-medium">Créé le</th>
            </tr>
          </thead>
          <tbody>
            {(trips || []).map((trip) => (
              <tr key={trip.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{trip.id.slice(0, 8)}</td>
                <td className="px-4 py-3">{trip.origin_location_name}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize">
                    {trip.status}
                  </span>
                </td>
                <td className="px-4 py-3">{trip.driver_id?.slice(0, 8) || '-'}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                  {trip.last_known_lat && trip.last_known_lng
                    ? `${trip.last_known_lat.toFixed(4)}, ${trip.last_known_lng.toFixed(4)}`
                    : '-'}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(trip.created_at).toLocaleDateString('fr-TN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(!trips || trips.length === 0) && (
        <p className="py-8 text-center text-gray-500">Aucun trajet</p>
      )}
    </div>
  )
}
