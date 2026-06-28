import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Linking, Alert, useColorScheme } from 'react-native'
import { supabase } from '../services/supabase'
import { startBackgroundTracking, stopBackgroundTracking } from '../services/location'
import * as Haptics from 'expo-haptics'

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
  const isDark = useColorScheme() === 'dark'
  const theme = isDark ? darkStyles : styles
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
      await Haptics.notificationAsync('error').catch(() => {})
    } else {
      await Haptics.notificationAsync('success').catch(() => {})
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
      await Haptics.notificationAsync('error').catch(() => {})
    } else {
      await Haptics.notificationAsync('success').catch(() => {})
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
        <Text style={theme.loadingText}>Chargement...</Text>
      </View>
    )
  }

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text style={theme.loadingText}>Trajet introuvable</Text>
        <TouchableOpacity onPress={onBack} style={theme.backBtn}>
          <Text style={theme.backBtnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={theme.container}>
      <TouchableOpacity onPress={onBack} style={theme.backBtn}>
        <Text style={theme.backBtnText}>← Retour</Text>
      </TouchableOpacity>

      <Text style={theme.title}>{trip.origin_location_name}</Text>
      {trip.destination_location_name && role === 'courier' && (
        <Text style={theme.destination}>→ {trip.destination_location_name}</Text>
      )}
      <Text style={theme.status}>Statut: {trip.status}</Text>

      <View style={theme.detailRow}>
        <Text style={theme.label}>Valeur:</Text>
        <Text style={theme.value}>{(trip.cargo_value_millimes / 1000).toFixed(0)} TND</Text>
      </View>
      <View style={theme.detailRow}>
        <Text style={theme.label}>Gain:</Text>
        <Text style={theme.value}>{(trip.driver_fee_millimes / 1000).toFixed(3)} TND</Text>
      </View>

      {/* Navigation button */}
      {['in_transit', 'arrived_hub'].includes(trip.status) && (
        <TouchableOpacity style={theme.navBtn} onPress={openNavigation}>
          <Text style={theme.navBtnText}>Ouvrir dans Google Maps</Text>
        </TouchableOpacity>
      )}

      {/* Accept trip */}
      {trip.status === 'pending' && (
        <TouchableOpacity
          style={theme.actionBtn}
          onPress={handleAcceptTrip}
          disabled={actionLoading}
        >
          <Text style={theme.actionBtnText}>
            {actionLoading ? '...' : 'Accepter le trajet'}
          </Text>
        </TouchableOpacity>
      )}

      {/* OTP Input for pickup */}
      {trip.status === 'accepted' && (
        <View style={theme.otpSection}>
          <Text style={theme.otpLabel}>Code de ramassage</Text>
          <TextInput
            style={theme.otpInput}
            value={otpInput}
            onChangeText={setOtpInput}
            placeholder="0000"
            keyboardType="numeric"
            maxLength={4}
          />
          <TouchableOpacity
            style={theme.actionBtn}
            onPress={handleValidateOTP}
            disabled={actionLoading || otpInput.length !== 4}
          >
            <Text style={theme.actionBtnText}>
              {actionLoading ? '...' : 'Confirmer le ramassage'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Arrive at hub — long-haul only */}
      {role === 'long_haul' && trip.status === 'in_transit' && (
        <TouchableOpacity
          style={theme.actionBtn}
          onPress={handleArriveHub}
          disabled={actionLoading}
        >
          <Text style={theme.actionBtnText}>
            {actionLoading ? '...' : 'Arrivé au hub'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Courier: skip hub, go direct from in_transit to delivery OTP */}
      {role === 'courier' && trip.status === 'in_transit' && (
        <View style={theme.otpSection}>
          <Text style={theme.otpLabel}>Code de livraison (chez l'acheteur)</Text>
          <TextInput
            style={theme.otpInput}
            value={otpInput}
            onChangeText={setOtpInput}
            placeholder="0000"
            keyboardType="numeric"
            maxLength={4}
          />
          <TouchableOpacity
            style={theme.actionBtn}
            onPress={handleDeliveryOTP}
            disabled={actionLoading || otpInput.length !== 4}
          >
            <Text style={theme.actionBtnText}>
              {actionLoading ? '...' : 'Confirmer la livraison'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* OTP Input for delivery — long-haul */}
      {role === 'long_haul' && trip.status === 'arrived_hub' && (
        <View style={theme.otpSection}>
          <Text style={theme.otpLabel}>Code de livraison</Text>
          <TextInput
            style={theme.otpInput}
            value={otpInput}
            onChangeText={setOtpInput}
            placeholder="0000"
            keyboardType="numeric"
            maxLength={4}
          />
          <TouchableOpacity
            style={theme.actionBtn}
            onPress={handleDeliveryOTP}
            disabled={actionLoading || otpInput.length !== 4}
          >
            <Text style={theme.actionBtnText}>
              {actionLoading ? '...' : 'Confirmer la livraison'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const baseStyles = {
  backBtn: { marginBottom: 12 } as const,
  backBtnText: { color: '#16a34a', fontSize: 16 } as const,
  loadingText: { textAlign: 'center' as const, marginTop: 40 },
  destination: { fontSize: 16, marginBottom: 4 } as const,
  title: { fontSize: 24, fontWeight: '700' as const, marginBottom: 4 },
  status: { fontSize: 14, marginBottom: 20 },
  detailRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, marginBottom: 8 },
  label: { fontSize: 16 },
  value: { fontSize: 16, fontWeight: '600' as const },
  navBtn: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center' as const,
    marginVertical: 16,
  },
  navBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' as const },
  actionBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center' as const,
    marginTop: 16,
  },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' as const },
  otpSection: { marginTop: 20 },
  otpLabel: { fontSize: 16, fontWeight: '500' as const, marginBottom: 8 },
  otpInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    textAlign: 'center' as const,
    letterSpacing: 8,
  },
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  ...baseStyles,
  loadingText: { ...baseStyles.loadingText, color: '#9ca3af' },
  destination: { ...baseStyles.destination, color: '#374151' },
  status: { ...baseStyles.status, color: '#6b7280' },
  label: { ...baseStyles.label, color: '#374151' },
  navBtn: { ...baseStyles.navBtn, backgroundColor: '#1f2937' },
  otpInput: { ...baseStyles.otpInput, borderColor: '#d1d5db', backgroundColor: '#fff' },
})

const darkStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827', padding: 16 },
  ...baseStyles,
  loadingText: { ...baseStyles.loadingText, color: '#6b7280' },
  destination: { ...baseStyles.destination, color: '#d1d5db' },
  status: { ...baseStyles.status, color: '#9ca3af' },
  label: { ...baseStyles.label, color: '#d1d5db' },
  navBtn: { ...baseStyles.navBtn, backgroundColor: '#374151' },
  otpInput: { ...baseStyles.otpInput, borderColor: '#4b5563', backgroundColor: '#1f2937', color: '#f9fafb' },
})
