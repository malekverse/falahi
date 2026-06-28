import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import AsyncStorage from '@react-native-async-storage/async-storage'

const LOCATION_TASK_NAME = 'DRIVER_LOCATION_TASK'
const OFFLINE_QUEUE_KEY = 'offline_location_queue'
const PING_INTERVAL_MS = 45000

interface LocationData {
  tripId: string
  lat: number
  lng: number
  timestamp: string
}

TaskManager.defineTask(LOCATION_TASK_NAME, async (event) => {
  if (event.error) {
    console.error('Location task error:', event.error)
    return
  }

  const taskData = event.data as { locations: Location.LocationObject[] } | null
  if (!taskData) return

  const location = taskData.locations[0]

  if (!location) return

  const locationData: LocationData = {
    tripId: '',
    lat: location.coords.latitude,
    lng: location.coords.longitude,
    timestamp: new Date(location.timestamp).toISOString(),
  }

  try {
    const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY)
    const queue: LocationData[] = stored ? JSON.parse(stored) : []
    queue.push(locationData)
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
  } catch (err) {
    console.error('Failed to cache location:', err)
  }
})

export async function requestLocationPermissions(): Promise<boolean> {
  const foreground = await Location.requestForegroundPermissionsAsync()
  if (!foreground.granted) return false

  const background = await Location.requestBackgroundPermissionsAsync()
  return background.granted
}

export async function startBackgroundTracking(tripId: string) {
  const hasPermission = await requestLocationPermissions()
  if (!hasPermission) {
    throw new Error('Location permission not granted')
  }

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: PING_INTERVAL_MS,
    distanceInterval: 0,
    foregroundService: {
      notificationTitle: 'Filahi',
      notificationBody: 'Suivi de livraison actif',
      notificationColor: '#16a34a',
    },
    showsBackgroundLocationIndicator: true,
    pausesUpdatesAutomatically: false,
  })
}

export async function stopBackgroundTracking() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME)
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
  }
}

export async function flushOfflineQueue(tripId: string): Promise<LocationData[]> {
  try {
    const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY)
    if (!stored) return []

    const queue: LocationData[] = JSON.parse(stored)
    const tripPings = queue
      .filter((p) => p.tripId === tripId || !p.tripId)
      .map((p) => ({ ...p, tripId }))

    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify([]))

    return tripPings
  } catch (err) {
    console.error('Failed to flush queue:', err)
    return []
  }
}
