import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native'
import { supabase } from '../services/supabase'
import { TripCard } from '../components/TripCard'
import { useTheme } from '../services/theme'

interface Trip {
  id: string
  origin_location_name: string
  status: string
  cargo_value_millimes: number
  driver_fee_millimes: number
}

export function HomeScreen({ onTripPress }: { onTripPress: (tripId: string) => void }) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [driverRole, setDriverRole] = useState<string | null>(null)
  const t = useTheme()
  const s = createStyles(t)

  const fetchTrips = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('driver_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    setDriverRole(profile?.role ?? null)

    let query = supabase
      .from('trips')
      .select('id, origin_location_name, status, cargo_value_millimes, driver_fee_millimes')
      .eq('driver_id', user.id)
      .in('status', ['pending', 'accepted', 'in_transit', 'arrived_hub'])
      .order('created_at', { ascending: false })

    if (profile?.role === 'courier') {
      query = query.eq('role', 'courier')
    }

    const { data } = await query
    setTrips(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  async function onRefresh() {
    setRefreshing(true)
    await fetchTrips()
    setRefreshing(false)
  }

  const activeTrips = trips.filter((t) => ['accepted', 'in_transit', 'arrived_hub'].includes(t.status))
  const pendingTrips = trips.filter((t) => t.status === 'pending')

  return (
    <View style={s.container}>
      <View style={s.headerSection}>
        <Text style={s.eyebrow}>فلاحي — Chauffeur</Text>
        <Text style={s.title}>
          {driverRole === 'courier' ? 'Courses disponibles' : 'Trajets longue distance'}
        </Text>
      </View>

      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TripCard
            id={item.id}
            originLocation={item.origin_location_name}
            status={item.status}
            cargoValue={item.cargo_value_millimes}
            driverFee={item.driver_fee_millimes}
            onPress={() => onTripPress(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.accent} colors={[t.accent]} />
        }
        contentContainerStyle={trips.length === 0 ? s.emptyContainer : s.list}
        ListHeaderComponent={
          <>
            {activeTrips.length > 0 && (
              <View style={s.sectionHeader}>
                <View style={[s.sectionDot, { backgroundColor: t.accent }]} />
                <Text style={s.sectionTitle}>En cours ({activeTrips.length})</Text>
              </View>
            )}
            {pendingTrips.length > 0 && (
              <View style={s.sectionHeader}>
                <View style={[s.sectionDot, { backgroundColor: t.gold }]} />
                <Text style={s.sectionTitle}>Disponibles ({pendingTrips.length})</Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={s.emptyContent}>
              <Text style={s.emptyIcon}>🛻</Text>
              <Text style={s.emptyText}>Aucun trajet disponible</Text>
              <Text style={s.emptySubtext}>Tirez vers le bas pour actualiser</Text>
            </View>
          ) : null
        }
      />
    </View>
  )
}

const createStyles = (t: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.background },
    headerSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    eyebrow: { fontSize: 11, fontWeight: '600', letterSpacing: 2, color: t.gold, marginBottom: 4 },
    title: { fontSize: 22, fontWeight: '700', color: t.text },
    list: { padding: 16 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContent: { alignItems: 'center', paddingTop: 60 },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyText: { color: t.textSecondary, fontSize: 16, fontWeight: '600' },
    emptySubtext: { color: t.textMuted, fontSize: 13, marginTop: 4 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 4 },
    sectionDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: t.textSecondary },
  })
