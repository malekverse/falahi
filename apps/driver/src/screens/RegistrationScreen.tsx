import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { supabase } from '../services/supabase'

const VEHICLE_TYPES = ['isuzu', 'dmax', 'scooter', 'berlingo', 'fiorino', 'other']
const DRIVER_ROLES = [
  { key: 'long_haul', label: 'Longue distance' },
  { key: 'courier', label: 'Coursier (dernier km)' },
]

export function RegistrationScreen({ onComplete }: { onComplete: () => void }) {
  const [fullName, setFullName] = useState('')
  const [cinNumber, setCinNumber] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [driverRole, setDriverRole] = useState<'long_haul' | 'courier'>('long_haul')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    if (!fullName || !cinNumber || !vehiclePlate || !vehicleType) return

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { error } = await supabase.from('driver_profiles').insert({
      id: user.id,
      cin_number: cinNumber,
      cin_photo_url: '',
      carte_grise_url: '',
      vehicle_type: vehicleType,
      vehicle_plate: vehiclePlate,
      role: driverRole,
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)

    onComplete()
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Inscription</Text>

      <Text style={styles.label}>Nom complet</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Votre nom"
      />

      <Text style={styles.label}>N° CIN</Text>
      <TextInput
        style={styles.input}
        value={cinNumber}
        onChangeText={setCinNumber}
        placeholder="00000000"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Immatriculation</Text>
      <TextInput
        style={styles.input}
        value={vehiclePlate}
        onChangeText={setVehiclePlate}
        placeholder="123 TN 10"
      />

      <Text style={styles.label}>Type de chauffeur</Text>
      <View style={styles.vehicleRow}>
        {DRIVER_ROLES.map((r) => (
          <TouchableOpacity
            key={r.key}
            style={[styles.vehicleBtn, driverRole === r.key && styles.vehicleBtnActive]}
            onPress={() => setDriverRole(r.key as 'long_haul' | 'courier')}
          >
            <Text style={[styles.vehicleBtnText, driverRole === r.key && styles.vehicleBtnTextActive]}>
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Type de véhicule</Text>
      <View style={styles.vehicleRow}>
        {VEHICLE_TYPES.map((vt) => (
          <TouchableOpacity
            key={vt}
            style={[styles.vehicleBtn, vehicleType === vt && styles.vehicleBtnActive]}
            onPress={() => setVehicleType(vt)}
          >
            <Text style={[styles.vehicleBtnText, vehicleType === vt && styles.vehicleBtnTextActive]}>
              {vt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.submitBtnText}>
          {loading ? 'Inscription...' : "S'inscrire"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  vehicleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  vehicleBtn: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  vehicleBtnActive: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  vehicleBtnText: { fontSize: 14, color: '#374151' },
  vehicleBtnTextActive: { color: '#16a34a', fontWeight: '600' },
  submitBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
