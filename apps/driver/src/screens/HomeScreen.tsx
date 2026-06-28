import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native'
import { supabase } from '../services/supabase'
import { TripCard } from '../components/TripCard'

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

  const fetchTrips = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('trips')
      .select('id, origin_location_name, status, cargo_value_millimes, driver_fee_millimes')
      .eq('driver_id', user.id)
      .in('status', ['pending', 'accepted', 'in_transit', 'arrived_hub'])
      .order('created_at', { ascending: false })

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes trajets</Text>

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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={trips.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>Aucun trajet disponible</Text> : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  title: { fontSize: 22, fontWeight: '700', padding: 16, paddingBottom: 8 },
  list: { padding: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#9ca3af', fontSize: 16 },
})
