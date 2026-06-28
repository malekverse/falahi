import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { supabase } from '../services/supabase'

export function ProfileScreen() {
  const [driver, setDriver] = useState<{
    full_name: string
    vehicle_type: string
    vehicle_plate: string
    role: string
    trust_tier: number
    trust_score: number
    total_trips: number
  } | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const { data: driverData } = await supabase
      .from('driver_profiles')
      .select('vehicle_type, vehicle_plate, role, trust_tier, trust_score, total_trips')
      .eq('id', user.id)
      .single()

    if (profile && driverData) {
      setDriver({ ...profile, ...driverData })
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon profil</Text>

      {driver ? (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Nom</Text>
            <Text style={styles.value}>{driver.full_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Rôle</Text>
            <Text style={styles.value}>{driver.role === 'courier' ? 'Coursier' : 'Longue distance'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Véhicule</Text>
            <Text style={styles.value}>{driver.vehicle_type} - {driver.vehicle_plate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Niveau</Text>
            <Text style={styles.value}>Tier {driver.trust_tier}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Score</Text>
            <Text style={styles.value}>{driver.trust_score}/5</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Trajets</Text>
            <Text style={styles.value}>{driver.total_trips}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.loading}>Chargement...</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: { fontSize: 15, color: '#6b7280' },
  value: { fontSize: 15, fontWeight: '600', color: '#111827' },
  loading: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
})
