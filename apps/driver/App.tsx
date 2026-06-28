import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { supabase } from './src/services/supabase'
import { HomeScreen } from './src/screens/HomeScreen'
import { TripDetailScreen } from './src/screens/TripDetailScreen'
import { HistoryScreen } from './src/screens/HistoryScreen'
import { ProfileScreen } from './src/screens/ProfileScreen'
import { RegistrationScreen } from './src/screens/RegistrationScreen'

type Screen = 'home' | 'tripDetail' | 'history' | 'profile' | 'registration'

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home')
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null)

  useEffect(() => {
    checkRegistration()
  }, [])

  async function checkRegistration() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsRegistered(false)
      return
    }

    const { data } = await supabase
      .from('driver_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    setIsRegistered(!!data)
  }

  function handleTripPress(tripId: string) {
    setSelectedTripId(tripId)
    setCurrentScreen('tripDetail')
  }

  if (isRegistered === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement...</Text>
        <StatusBar style="auto" />
      </View>
    )
  }

  if (isRegistered === false) {
    return (
      <>
        <RegistrationScreen onComplete={checkRegistration} />
        <StatusBar style="auto" />
      </>
    )
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'tripDetail':
        return selectedTripId ? (
          <TripDetailScreen
            tripId={selectedTripId}
            onBack={() => setCurrentScreen('home')}
          />
        ) : (
          <HomeScreen onTripPress={handleTripPress} />
        )
      case 'history':
        return <HistoryScreen />
      case 'profile':
        return <ProfileScreen />
      default:
        return <HomeScreen onTripPress={handleTripPress} />
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderScreen()}</View>

      <View style={styles.tabBar}>
        <TabButton
          label="Trajets"
          active={currentScreen === 'home'}
          onPress={() => setCurrentScreen('home')}
        />
        <TabButton
          label="Historique"
          active={currentScreen === 'history'}
          onPress={() => setCurrentScreen('history')}
        />
        <TabButton
          label="Profil"
          active={currentScreen === 'profile'}
          onPress={() => setCurrentScreen('profile')}
        />
      </View>

      <StatusBar style="auto" />
    </View>
  )
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabActive: {
    borderTopWidth: 2,
    borderTopColor: '#16a34a',
  },
  tabText: { fontSize: 13, color: '#6b7280' },
  tabTextActive: { color: '#16a34a', fontWeight: '600' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})
