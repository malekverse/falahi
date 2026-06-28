import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native'
import { supabase } from '../services/supabase'
import { startBackgroundTracking, stopBackgroundTracking } from '../services/location'

interface Trip {
  id: string
  origin_location_name: string
  destination_location_name: string | null
  status: string
  otp_pickup: string
  otp_delivery: string
  cargo_value_millimes: number
  driver_fee_millimes: number
  last_known_lat: number | null
  last_known_lng: number | null
}

export function TripDetailScreen({ tripId, role, onBack }: { tripId: string; role: 'long_haul' | 'courier'; onBack: () => void }) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [otpInput, setOtpInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchTrip()
  }, [tripId])

  async function fetchTrip() {
    const { data } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single()

    setTrip(data)
    setLoading(false)
  }

  async function handleAcceptTrip() {
    setActionLoading(true)
    const { error } = await supabase
      .from('trips')
      .update({ status: 'accepted' })
      .eq('id', tripId)
      .eq('status', 'pending')

    if (error) {
      alert(error.message)
    } else {
      await startBackgroundTracking(tripId)
      fetchTrip()
    }
    setActionLoading(false)
  }

  async function handleValidateOTP() {
    if (!otpInput || otpInput.length !== 4) return
    setActionLoading(true)

    const { data, error } = await supabase.rpc('validate_pickup_otp', {
      trip_id: tripId,
      otp_input: otpInput,
    })

    const result = data as { success: boolean; error?: string } | null

    if (error || !result?.success) {
      Alert.alert('Erreur', result?.error || 'Code invalide')
    } else {
      await startBackgroundTracking(tripId)
      fetchTrip()
    }

    setOtpInput('')
    setActionLoading(false)
  }

  async function handleArriveHub() {
    setActionLoading(true)

    const { error } = await supabase
      .from('trips')
      .update({ status: 'arrived_hub' })
      .eq('id', tripId)
      .eq('status', 'in_transit')

    if (error) {
      alert(error.message)
    } else {
      fetchTrip()
    }
    setActionLoading(false)
  }

  async function handleDeliveryOTP() {
    if (!otpInput || otpInput.length !== 4) return
    setActionLoading(true)

    const { data, error } = await supabase.rpc('validate_delivery_otp', {
      trip_id: tripId,
      otp_input: otpInput,
    })

    const result = data as { success: boolean; error?: string } | null

    if (error || !result?.success) {
      Alert.alert('Erreur', result?.error || 'Code invalide')
    } else {
      await stopBackgroundTracking()
      fetchTrip()
    }

    setOtpInput('')
    setActionLoading(false)
  }

  function openNavigation() {
    if (trip?.last_known_lat && trip?.last_known_lng) {
      const url = `google.navigation:q=${trip.last_known_lat},${trip.last_known_lng}`
      Linking.openURL(url).catch(() => {
        const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${trip.last_known_lat},${trip.last_known_lng}`
        Linking.openURL(webUrl)
      })
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    )
  }

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Trajet introuvable</Text>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{trip.origin_location_name}</Text>
      {trip.destination_location_name && role === 'courier' && (
        <Text style={styles.destination}>→ {trip.destination_location_name}</Text>
      )}
      <Text style={styles.status}>Statut: {trip.status}</Text>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Valeur:</Text>
        <Text style={styles.value}>{(trip.cargo_value_millimes / 1000).toFixed(0)} TND</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Gain:</Text>
        <Text style={styles.value}>{(trip.driver_fee_millimes / 1000).toFixed(3)} TND</Text>
      </View>

      {/* Navigation button */}
      {['in_transit', 'arrived_hub'].includes(trip.status) && (
        <TouchableOpacity style={styles.navBtn} onPress={openNavigation}>
          <Text style={styles.navBtnText}>Ouvrir dans Google Maps</Text>
        </TouchableOpacity>
      )}

      {/* Accept trip */}
      {trip.status === 'pending' && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleAcceptTrip}
          disabled={actionLoading}
        >
          <Text style={styles.actionBtnText}>
            {actionLoading ? '...' : 'Accepter le trajet'}
          </Text>
        </TouchableOpacity>
      )}

      {/* OTP Input for pickup */}
      {trip.status === 'accepted' && (
        <View style={styles.otpSection}>
          <Text style={styles.otpLabel}>Code de ramassage</Text>
          <TextInput
            style={styles.otpInput}
            value={otpInput}
            onChangeText={setOtpInput}
            placeholder="0000"
            keyboardType="numeric"
            maxLength={4}
          />
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleValidateOTP}
            disabled={actionLoading || otpInput.length !== 4}
          >
            <Text style={styles.actionBtnText}>
              {actionLoading ? '...' : 'Confirmer le ramassage'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Arrive at hub — long-haul only */}
      {role === 'long_haul' && trip.status === 'in_transit' && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleArriveHub}
          disabled={actionLoading}
        >
          <Text style={styles.actionBtnText}>
            {actionLoading ? '...' : 'Arrivé au hub'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Courier: skip hub, go direct from in_transit to delivery OTP */}
      {role === 'courier' && trip.status === 'in_transit' && (
        <View style={styles.otpSection}>
          <Text style={styles.otpLabel}>Code de livraison (chez l'acheteur)</Text>
          <TextInput
            style={styles.otpInput}
            value={otpInput}
            onChangeText={setOtpInput}
            placeholder="0000"
            keyboardType="numeric"
            maxLength={4}
          />
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleDeliveryOTP}
            disabled={actionLoading || otpInput.length !== 4}
          >
            <Text style={styles.actionBtnText}>
              {actionLoading ? '...' : 'Confirmer la livraison'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* OTP Input for delivery — long-haul */}
      {role === 'long_haul' && trip.status === 'arrived_hub' && (
        <View style={styles.otpSection}>
          <Text style={styles.otpLabel}>Code de livraison</Text>
          <TextInput
            style={styles.otpInput}
            value={otpInput}
            onChangeText={setOtpInput}
            placeholder="0000"
            keyboardType="numeric"
            maxLength={4}
          />
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleDeliveryOTP}
            disabled={actionLoading || otpInput.length !== 4}
          >
            <Text style={styles.actionBtnText}>
              {actionLoading ? '...' : 'Confirmer la livraison'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  backBtn: { marginBottom: 12 },
  backBtnText: { color: '#16a34a', fontSize: 16 },
  loadingText: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  destination: { fontSize: 16, color: '#374151', marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  status: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 16, color: '#374151' },
  value: { fontSize: 16, fontWeight: '600' },
  navBtn: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginVertical: 16,
  },
  navBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  actionBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  otpSection: { marginTop: 20 },
  otpLabel: { fontSize: 16, fontWeight: '500', marginBottom: 8 },
  otpInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    backgroundColor: '#fff',
  },
})
