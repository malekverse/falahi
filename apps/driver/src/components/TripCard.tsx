import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme, type ThemeColors } from '../services/theme'

interface TripCardProps {
  id: string
  originLocation: string
  status: string
  cargoValue: number
  driverFee: number
  onPress: () => void
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'En attente', bg: '#fdf4d8', text: '#8B6914' },
  accepted: { label: 'Acceptée', bg: '#d8f3dc', text: '#23523a' },
  in_transit: { label: 'En transit', bg: '#dbeafe', text: '#1e40af' },
  arrived_hub: { label: 'Arrivé au hub', bg: '#ebf8f0', text: '#2d6a4f' },
  delivered: { label: 'Livrée', bg: '#d8f3dc', text: '#23523a' },
  settled: { label: 'Réglée', bg: '#ebf8f0', text: '#1a3c2a' },
  disputed: { label: 'Litige', bg: '#fce4ec', text: '#c0392b' },
}

export function TripCard({ id, originLocation, status, cargoValue, driverFee, onPress }: TripCardProps) {
  const t = useTheme()
  const s = createStyles(t)
  const statusCfg = STATUS_CONFIG[status] ?? { label: status, bg: t.border, text: t.textMuted }

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.7}>
      <View style={s.topBorder} />
      <View style={s.content}>
        <View style={s.header}>
          <Text style={s.location} numberOfLines={1}>{originLocation}</Text>
          <View style={[s.badge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[s.badgeText, { color: statusCfg.text }]}>{statusCfg.label}</Text>
          </View>
        </View>

        <View style={s.details}>
          <Text style={s.detailText}>Valeur: {(cargoValue / 1000).toFixed(0)} TND</Text>
          <Text style={s.gainText}>+{(driverFee / 1000).toFixed(3)} TND</Text>
        </View>

        <Text style={s.idText}>#{id.slice(0, 8)}</Text>
      </View>
    </TouchableOpacity>
  )
}

const createStyles = (t: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: t.card,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: t.border,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    topBorder: {
      height: 3,
      backgroundColor: t.accent,
      opacity: 0.6,
    },
    content: {
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    location: {
      fontSize: 16,
      fontWeight: '700',
      flex: 1,
      marginRight: 8,
      color: t.text,
    },
    badge: {
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '600',
    },
    details: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    detailText: {
      fontSize: 14,
      color: t.textSecondary,
    },
    gainText: {
      fontSize: 14,
      fontWeight: '700',
      color: t.accent,
    },
    idText: {
      fontSize: 11,
      color: t.textMuted,
      marginTop: 2,
    },
  })
