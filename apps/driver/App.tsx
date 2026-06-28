import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from './src/services/supabase'
import { HomeScreen } from './src/screens/HomeScreen'
import { TripDetailScreen } from './src/screens/TripDetailScreen'
import { HistoryScreen } from './src/screens/HistoryScreen'
import { ProfileScreen } from './src/screens/ProfileScreen'
import { RegistrationScreen } from './src/screens/RegistrationScreen'
import { OnboardingScreen } from './src/screens/OnboardingScreen'
import { lightTheme, darkTheme } from './src/services/theme'

const ONBOARDING_DONE_KEY = 'filahi_onboarding_done'

type Screen = 'home' | 'tripDetail' | 'history' | 'profile' | 'registration'

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home')
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null)
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null)
  const [driverRole, setDriverRole] = useState<'long_haul' | 'courier'>('long_haul')
  const isDark = useColorScheme() === 'dark'
  const t = isDark ? darkTheme : lightTheme

  useEffect(() => {
    init()
  }, [])

  async function init() {
    const done = await AsyncStorage.getItem(ONBOARDING_DONE_KEY)
    setShowOnboarding(done !== 'true')
    await checkRegistration()
  }

  async function checkRegistration() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsRegistered(false)
      return
    }

    const { data } = await supabase
      .from('driver_profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    setIsRegistered(!!data)
    if (data?.role) setDriverRole(data.role as 'long_haul' | 'courier')
  }

  async function handleOnboardingDone() {
    await AsyncStorage.setItem(ONBOARDING_DONE_KEY, 'true')
    setShowOnboarding(false)
  }

  function handleTripPress(tripId: string) {
    setSelectedTripId(tripId)
    setCurrentScreen('tripDetail')
  }

  if (showOnboarding === true) {
    return (
      <>
        <OnboardingScreen onComplete={handleOnboardingDone} />
        <StatusBar style="auto" />
      </>
    )
  }

  if (isRegistered === null || showOnboarding === null) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: t.background }]}>
        <Text style={{ color: t.textSecondary }}>Chargement...</Text>
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
            role={driverRole}
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
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <View style={styles.content}>{renderScreen()}</View>

      <View style={[styles.tabBar, { backgroundColor: t.card, borderTopColor: t.border }]}>
        <TabButton
          label="Trajets"
          active={currentScreen === 'home'}
          onPress={() => setCurrentScreen('home')}
          isDark={isDark}
        />
        <TabButton
          label="Historique"
          active={currentScreen === 'history'}
          onPress={() => setCurrentScreen('history')}
          isDark={isDark}
        />
        <TabButton
          label="Profil"
          active={currentScreen === 'profile'}
          onPress={() => setCurrentScreen('profile')}
          isDark={isDark}
        />
      </View>

      <StatusBar style={isDark ? 'light' : 'dark'} />
    </View>
  )
}

function TabButton({
  label,
  active,
  onPress,
  isDark,
}: {
  label: string
  active: boolean
  onPress: () => void
  isDark: boolean
}) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && { borderTopWidth: 2, borderTopColor: '#16a34a' }]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, { color: isDark ? '#9ca3af' : '#6b7280' }, active && { color: '#16a34a', fontWeight: '600' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: { fontSize: 13 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})
