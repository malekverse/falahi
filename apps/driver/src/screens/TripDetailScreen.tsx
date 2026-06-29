import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native'
import { supabase } from '../services/supabase'
import { startBackgroundTracking, stopBackgroundTracking } from '../services/location'
import { useTheme } from '../services/theme'
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

const STATUS_TRANSITIONS: Record<string, string> = {
  pending: 'accepted',
  accepted: 'in_transit',
  in_transit: 'arrived_hub',
  arrived_hub: 'delivered',
}

export function TripDetailScreen({ tripId, role, onBack }: { tripId: string; role: 'long_haul' | 'courier'; onBack: () => void }) {
  const t = useTheme()
  const s = createStyles(t)
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
      await Haptics.notificationAsync('success').catch(() => {})
      await startBackgroundTracking(tripId)
      fetchTrip()
    }
    setActionLoading(false)
  }

  async function handleValidateOTP(type: 'pickup' | 'delivery') {
    if (!otpInput || otpInput.length !== 4) return
    setActionLoading(true)

    const rpcName = type === 'pickup' ? 'validate_pickup_otp' : 'validate_delivery_otp'
    const { data, error } = await supabase.rpc(rpcName, {
      trip_id: tripId,
      otp_input: otpInput,
    })

    const result = data as { success: boolean; error?: string } | null

    if (error || !result?.success) {
      Alert.alert('Erreur', result?.error || 'Code invalide')
      await Haptics.notificationAsync('error').catch(() => {})
    } else {
      await Haptics.notificationAsync('success').catch(() => {})
      if (type === 'pickup') {
        await startBackgroundTracking(tripId)
      } else {
        await stopBackgroundTracking()
      }
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
      <View style={s.container}>
        <Text style={s.loadingText}>Chargement...</Text>
      </View>
    )
  }

  if (!trip) {
    return (
      <View style={s.container}>
        <Text style={s.loadingText}>Trajet introuvable</Text>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backBtnText}>← Retour</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={s.container}>
      <TouchableOpacity onPress={onBack} style={s.backBtn}>
        <Text style={s.backBtnText}>← Retour</Text>
      </TouchableOpacity>

      <Text style={s.locationText}>{trip.origin_location_name}</Text>
      {trip.destination_location_name && role === 'courier' && (
        <Text style={s.destinationText}>→ {trip.destination_location_name}</Text>
      )}
      <View style={[s.statusBadge, { backgroundColor: t.accentLight }]}>
        <Text style={[s.statusText, { color: t.accent }]}>{trip.status}</Text>
      </View>

      <View style={s.card}>
        <View style={s.detailRow}>
          <Text style={s.detailLabel}>Valeur</Text>
          <Text style={s.detailValue}>{(trip.cargo_value_millimes / 1000).toFixed(0)} TND</Text>
        </View>
        <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
          <Text style={s.detailLabel}>Gain</Text>
          <Text style={s.gainValue}>+{(trip.driver_fee_millimes / 1000).toFixed(3)} TND</Text>
        </View>
      </View>

      {['in_transit', 'arrived_hub'].includes(trip.status) && (
        <TouchableOpacity style={s.navBtn} onPress={openNavigation}>
          <Text style={s.navBtnText}>Ouvrir dans Google Maps</Text>
        </TouchableOpacity>
      )}

      {trip.status === 'pending' && (
        <TouchableOpacity style={s.actionBtn} onPress={handleAcceptTrip} disabled={actionLoading}>
          <Text style={s.actionBtnText}>{actionLoading ? '...' : 'Accepter le trajet'}</Text>
        </TouchableOpacity>
      )}

      {trip.status === 'accepted' && (
        <View style={s.otpSection}>
          <Text style={s.otpLabel}>Code de ramassage</Text>
          <TextInput
            style={s.otpInput}
            value={otpInput}
            onChangeText={setOtpInput}
            placeholder="0000"
            placeholderTextColor={t.textMuted}
            keyboardType="number-pad"
            maxLength={4}
          />
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => handleValidateOTP('pickup')}
            disabled={actionLoading || otpInput.length !== 4}
          >
            <Text style={s.actionBtnText}>{actionLoading ? '...' : 'Confirmer le ramassage'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {role === 'long_haul' && trip.status === 'in_transit' && (
        <TouchableOpacity style={s.actionBtn} onPress={async () => {
          setActionLoading(true); const { error } = await supabase.from('trips').update({ status: 'arrived_hub' }).eq('id', tripId).eq('status', 'in_transit'); if (!error) { await Haptics.notificationAsync('success').catch(() => {}); fetchTrip(); } setActionLoading(false)
        }} disabled={actionLoading}>
          <Text style={s.actionBtnText}>{actionLoading ? '...' : 'Arrivé au hub'}</Text>
        </TouchableOpacity>
      )}

      {((role === 'courier' && trip.status === 'in_transit') || (role === 'long_haul' && trip.status === 'arrived_hub')) && (
        <View style={s.otpSection}>
          <Text style={s.otpLabel}>Code de livraison</Text>
          <TextInput
            style={s.otpInput}
            value={otpInput}
            onChangeText={setOtpInput}
            placeholder="0000"
            placeholderTextColor={t.textMuted}
            keyboardType="number-pad"
            maxLength={4}
          />
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => handleValidateOTP('delivery')}
            disabled={actionLoading || otpInput.length !== 4}
          >
            <Text style={s.actionBtnText}>{actionLoading ? '...' : 'Confirmer la livraison'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const createStyles = (t: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.background, padding: 16 },
    backBtn: { marginBottom: 16, alignSelf: 'flex-start' },
    backBtnText: { color: t.accent, fontSize: 15, fontWeight: '600' },
    loadingText: { textAlign: 'center', color: t.textMuted, marginTop: 40, fontSize: 15 },
    locationText: { fontSize: 24, fontWeight: '700', color: t.text, marginBottom: 4 },
    destinationText: { fontSize: 16, color: t.textSecondary, marginBottom: 8 },
    statusBadge: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 20 },
    statusText: { fontSize: 12, fontWeight: '600' },
    card: {
      backgroundColor: t.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: t.border,
      marginBottom: 16,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    detailLabel: { fontSize: 15, color: t.textSecondary },
    detailValue: { fontSize: 15, fontWeight: '600', color: t.text },
    gainValue: { fontSize: 15, fontWeight: '700', color: t.accent },
    navBtn: {
      backgroundColor: t.accent,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 12,
    },
    navBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    actionBtn: {
      backgroundColor: t.accent,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 12,
    },
    actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    otpSection: { marginTop: 12 },
    otpLabel: { fontSize: 15, fontWeight: '600', color: t.text, marginBottom: 8 },
    otpInput: {
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 28,
      textAlign: 'center',
      letterSpacing: 10,
      backgroundColor: t.card,
      color: t.text,
      marginBottom: 4,
    },
  })
