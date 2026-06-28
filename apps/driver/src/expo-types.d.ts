declare module 'expo-location' {
  export interface LocationObject {
    coords: {
      latitude: number
      longitude: number
      altitude: number | null
      accuracy: number | null
      altitudeAccuracy: number | null
      heading: number | null
      speed: number | null
    }
    timestamp: number
  }

  export enum Accuracy {
    Balanced = 3,
    High = 5,
    Low = 1,
    Lowest = 0,
  }

  export interface LocationPermissionResponse {
    granted: boolean
    canAskAgain: boolean
    status: 'undetermined' | 'granted' | 'denied'
  }

  export interface LocationTaskOptions {
    accuracy?: Accuracy
    timeInterval?: number
    distanceInterval?: number
    foregroundService?: {
      notificationTitle: string
      notificationBody: string
      notificationColor?: string
    }
    showsBackgroundLocationIndicator?: boolean
    pausesUpdatesAutomatically?: boolean
  }

  export function requestForegroundPermissionsAsync(): Promise<LocationPermissionResponse>
  export function requestBackgroundPermissionsAsync(): Promise<LocationPermissionResponse>
  export function startLocationUpdatesAsync(
    taskName: string,
    options?: LocationTaskOptions,
  ): Promise<void>
  export function stopLocationUpdatesAsync(taskName: string): Promise<void>
  export function hasStartedLocationUpdatesAsync(taskName: string): Promise<boolean>
}

declare module 'expo-task-manager' {
  export function defineTask(
    taskName: string,
    callback: (event: { data: unknown; error: Error | null }) => void,
  ): void
  export function isTaskRegisteredAsync(taskName: string): Promise<boolean>
  export function unregisterTaskAsync(taskName: string): Promise<void>
}

declare module 'expo-secure-store' {
  export function getItemAsync(key: string): Promise<string | null>
  export function setItemAsync(key: string, value: string): Promise<void>
  export function deleteItemAsync(key: string): Promise<void>
}
