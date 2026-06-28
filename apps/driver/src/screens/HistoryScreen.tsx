import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, RefreshControl, useColorScheme } from 'react-native'
import { supabase } from '../services/supabase'
import { TripCard } from '../components/TripCard'
import { lightTheme, darkTheme } from '../services/theme'

interface Trip {
  id: string
  origin_location_name: string
  status: string
  cargo_value_millimes: number
  driver_fee_millimes: number
}

export function HistoryScreen() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const isDark = useColorScheme() === 'dark'
  const t = isDark ? darkTheme : lightTheme

  const fetchHistory = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('trips')
      .select('id, origin_location_name, status, cargo_value_millimes, driver_fee_millimes')
      .eq('driver_id', user.id)
      .in('status', ['delivered', 'settled', 'disputed'])
      .order('created_at', { ascending: false })

    setTrips(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const styles = createStyles(t)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique</Text>

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
            onPress={() => {}}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={t.textSecondary}
            onRefresh={async () => {
              setRefreshing(true)
              await fetchHistory()
              setRefreshing(false)
            }}
          />
        }
        contentContainerStyle={trips.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>Aucun trajet terminé</Text> : null
        }
      />
    </View>
  )
}

const createStyles = (t: typeof lightTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.background },
    title: { fontSize: 22, fontWeight: '700', padding: 16, paddingBottom: 8, color: t.text },
    list: { padding: 16 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: t.textSecondary, fontSize: 16 },
  })
