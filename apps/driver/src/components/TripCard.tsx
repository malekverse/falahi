import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

interface TripCardProps {
  id: string
  originLocation: string
  status: string
  cargoValue: number
  driverFee: number
  onPress: () => void
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  in_transit: 'En transit',
  arrived_hub: 'Arrivé au hub',
  delivered: 'Livrée',
  settled: 'Réglée',
  disputed: 'Litige',
}

export function TripCard({ id, originLocation, status, cargoValue, driverFee, onPress }: TripCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.location}>{originLocation}</Text>
        <Text style={[styles.statusBadge, status === 'pending' && styles.pendingBadge]}>
          {STATUS_LABELS[status] || status}
        </Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailText}>
          Valeur: {(cargoValue / 1000).toFixed(0)} TND
        </Text>
        <Text style={styles.detailText}>
          Gain: {(driverFee / 1000).toFixed(3)} TND
        </Text>
      </View>

      <Text style={styles.id}>#{id.slice(0, 8)}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  id: {
    fontSize: 11,
    color: '#9ca3af',
  },
})
