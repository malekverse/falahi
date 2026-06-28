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

  function statusBadge(status: string) {
    const green = ['delivered', 'settled']
    const yellow = ['pending', 'accepted']
    const red = ['disputed']
    if (green.includes(status)) return 'badge-green'
    if (yellow.includes(status)) return 'badge-gold'
    if (red.includes(status)) return 'badge-red'
    return 'badge-gray'
  }

  return (
    <div>
      <h1 className="section-title mb-6">Trajets</h1>

      <div className="mb-6">
        <AdminTripsClient drivers={activeDrivers} trips={trips || []} />
      </div>

      <div className="card overflow-hidden" role="region" aria-label="Tableau des trajets">
        <table className="w-full text-left text-sm" role="table" aria-label="Liste des trajets en cours">
          <thead className="border-b border-cream-200 bg-cream-50">
            <tr>
              <th className="px-4 py-3 font-display text-xs font-semibold uppercase tracking-wider text-ink-500" scope="col">ID</th>
              <th className="px-4 py-3 font-display text-xs font-semibold uppercase tracking-wider text-ink-500" scope="col">Origine</th>
              <th className="px-4 py-3 font-display text-xs font-semibold uppercase tracking-wider text-ink-500" scope="col">Statut</th>
              <th className="px-4 py-3 font-display text-xs font-semibold uppercase tracking-wider text-ink-500" scope="col">Chauffeur</th>
              <th className="px-4 py-3 font-display text-xs font-semibold uppercase tracking-wider text-ink-500" scope="col">Position</th>
              <th className="px-4 py-3 font-display text-xs font-semibold uppercase tracking-wider text-ink-500" scope="col">Créé le</th>
            </tr>
          </thead>
          <tbody>
            {(trips || []).map((trip) => (
              <tr key={trip.id} className="border-b border-cream-100 transition-colors hover:bg-cream-50" aria-label={`Trajet ${trip.id.slice(0, 8)}, ${trip.origin_location_name}, ${trip.status}`}>
                <td className="px-4 py-3 font-mono text-xs text-ink-500">{trip.id.slice(0, 8)}</td>
                <td className="px-4 py-3 text-ink-700">{trip.origin_location_name}</td>
                <td className="px-4 py-3">
                  <span className={statusBadge(trip.status)}>
                    {trip.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-600">{trip.driver_id?.slice(0, 8) || '-'}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-500">
                  {trip.last_known_lat && trip.last_known_lng
                    ? `${trip.last_known_lat.toFixed(4)}, ${trip.last_known_lng.toFixed(4)}`
                    : '-'}
                </td>
                <td className="px-4 py-3 text-ink-500">
                  {new Date(trip.created_at).toLocaleDateString('fr-TN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(!trips || trips.length === 0) && (
        <p className="py-8 text-center text-ink-500">Aucun trajet</p>
      )}
    </div>
  )
}
