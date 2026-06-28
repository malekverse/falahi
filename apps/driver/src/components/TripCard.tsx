import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native'
import { lightTheme, darkTheme, type ThemeColors } from '../services/theme'

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
  const isDark = useColorScheme() === 'dark'
  const t = isDark ? darkTheme : lightTheme
  const s = createStyles(t, isDark)

  return (
    <TouchableOpacity style={s.card} onPress={onPress}>
      <View style={s.header}>
        <Text style={s.location}>{originLocation}</Text>
        <Text style={[s.statusBadge, status === 'pending' && s.pendingBadge]}>
          {STATUS_LABELS[status] || status}
        </Text>
      </View>

      <View style={s.details}>
        <Text style={s.detailText}>
          Valeur: {(cargoValue / 1000).toFixed(0)} TND
        </Text>
        <Text style={s.detailText}>
          Gain: {(driverFee / 1000).toFixed(3)} TND
        </Text>
      </View>

      <Text style={s.id}>#{id.slice(0, 8)}</Text>
    </TouchableOpacity>
  )
}

const createStyles = (t: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: t.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: t.border,
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.2 : 0.05,
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
      color: t.text,
    },
    statusBadge: {
      fontSize: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: t.border,
      color: t.textSecondary,
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
      color: t.textSecondary,
    },
    id: {
      fontSize: 11,
      color: t.textSecondary,
    },
  })
