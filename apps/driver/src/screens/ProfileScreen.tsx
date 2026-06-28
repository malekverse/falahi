import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { supabase } from '../services/supabase'

interface DriverData {
  full_name: string
  vehicle_type: string
  vehicle_plate: string
  role: string
  trust_tier: number
  trust_score: number
  total_trips: number
  total_earnings: number
}

const TIER_REQUIREMENTS = [
  { tier: 2, minScore: 2.5, minTrips: 10, label: 'Score ≥ 2.5 et 10 trajets' },
  { tier: 3, minScore: 4.0, minTrips: 30, label: 'Score ≥ 4.0 et 30 trajets' },
]

export function ProfileScreen() {
  const [driver, setDriver] = useState<DriverData | null>(null)

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

    const { data: earningsData } = await supabase
      .from('trips')
      .select('driver_fee_millimes')
      .eq('driver_id', user.id)
      .in('status', ['delivered', 'settled'])

    const totalEarnings = (earningsData || []).reduce(
      (sum, t) => sum + (t.driver_fee_millimes || 0), 0
    )

    if (profile && driverData) {
      setDriver({ ...profile, ...driverData, total_earnings: totalEarnings })
    }
  }

  function getNextTier() {
    if (!driver) return null
    if (driver.trust_tier >= 3) return null
    return TIER_REQUIREMENTS.find((r) => r.tier > driver.trust_tier) || null
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon profil</Text>

      {driver ? (
        <>
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
              <Text style={styles.value}>{driver.trust_score.toFixed(2)}/5</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Trajets</Text>
              <Text style={styles.value}>{driver.total_trips}</Text>
            </View>
            <View style={[styles.row, { borderBottomWidth: 0 }]}>
              <Text style={styles.label}>Gains totaux</Text>
              <Text style={[styles.value, { color: '#16a34a' }]}>
                {(driver.total_earnings / 1000).toFixed(3)} TND
              </Text>
            </View>
          </View>

          {(() => {
            const next = getNextTier()
            if (!next) {
              return (
                <View style={[styles.card, { marginTop: 16, backgroundColor: '#f0fdf4' }]}>
                  <Text style={styles.nextTierTitle}>Niveau maximum atteint</Text>
                  <Text style={styles.nextTierText}>Tier 3 — tous les avantages débloqués</Text>
                </View>
              )
            }
            return (
              <View style={[styles.card, { marginTop: 16, backgroundColor: '#fffbeb' }]}>
                <Text style={styles.nextTierTitle}>
                  Prochain palier : Tier {next.tier}
                </Text>
                <Text style={styles.nextTierText}>
                  {next.tier === 2
                    ? 'Avantages: cargaison max 350 TND, priorité sur les trajets'
                    : 'Avantages: cargaison max 500 TND, commission réduite'}
                </Text>
                <View style={styles.progressRow}>
                  <View style={styles.progressLabel}>
                    <Text style={styles.progressText}>Score: {driver.trust_score.toFixed(1)}/{next.minScore}</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(100, (driver.trust_score / next.minScore) * 100)}%`,
                          backgroundColor: driver.trust_score >= next.minScore ? '#16a34a' : '#f59e0b',
                        },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.progressRow}>
                  <View style={styles.progressLabel}>
                    <Text style={styles.progressText}>Trajets: {driver.total_trips}/{next.minTrips}</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(100, (driver.total_trips / next.minTrips) * 100)}%`,
                          backgroundColor: driver.total_trips >= next.minTrips ? '#16a34a' : '#f59e0b',
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            )
          })()}
        </>
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
  nextTierTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  nextTierText: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  progressLabel: { width: 100 },
  progressText: { fontSize: 12, color: '#6b7280' },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
})
