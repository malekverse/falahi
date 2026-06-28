import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AdminTripsClient } from './client'

export default async function AdminTripsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: trips } = await supabase
    .from('trips')
    .select('id, origin_location_name, status, driver_id, created_at, last_known_lat, last_known_lng')
    .order('created_at', { ascending: false })
    .limit(50)

  const activeDrivers = (trips || [])
    .filter((t) => t.last_known_lat && t.last_known_lng && ['accepted', 'in_transit', 'arrived_hub'].includes(t.status))
    .map((t) => ({
      id: t.id,
      lat: t.last_known_lat!,
      lng: t.last_known_lng!,
      label: `${t.origin_location_name} - ${t.status}`,
    }))

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Trajets</h1>

      <div className="mb-6">
        <AdminTripsClient drivers={activeDrivers} trips={trips || []} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white" role="region" aria-label="Tableau des trajets">
        <table className="w-full text-left text-sm" role="table" aria-label="Liste des trajets en cours">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium" scope="col">ID</th>
              <th className="px-4 py-3 font-medium" scope="col">Origine</th>
              <th className="px-4 py-3 font-medium" scope="col">Statut</th>
              <th className="px-4 py-3 font-medium" scope="col">Chauffeur</th>
              <th className="px-4 py-3 font-medium" scope="col">Position</th>
              <th className="px-4 py-3 font-medium" scope="col">Créé le</th>
            </tr>
          </thead>
          <tbody>
            {(trips || []).map((trip) => (
              <tr key={trip.id} className="border-b border-gray-100 hover:bg-gray-50" aria-label={`Trajet ${trip.id.slice(0, 8)}, ${trip.origin_location_name}, ${trip.status}`}>
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
