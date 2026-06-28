'use client'

import { useRef, useEffect } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface DriverMarker {
  id: string
  lat: number
  lng: number
  label: string
}

interface LiveDriverMapProps {
  drivers: DriverMarker[]
  hubCoords?: { lat: number; lng: number }
  onSignalLost?: (driverId: string) => boolean
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function LiveDriverMap({ drivers, hubCoords, onSignalLost }: LiveDriverMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map())
  const styleElRef = useRef<HTMLStyleElement | null>(null)

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [10.1, 36.8],
      zoom: 8,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    mapRef.current = map

    if (!styleElRef.current) {
      const style = document.createElement('style')
      style.textContent = `
        @keyframes driver-pulse {
          0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.5); }
          70% { box-shadow: 0 0 0 12px rgba(22, 163, 74, 0); }
          100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
        }
        .driver-marker-pulse {
          animation: driver-pulse 2s infinite;
        }
      `
      document.head.appendChild(style)
      styleElRef.current = style
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    const currentMarkerIds = new Set(markersRef.current.keys())
    const newDriverIds = new Set(drivers.map((d) => d.id))

    for (const id of currentMarkerIds) {
      if (!newDriverIds.has(id)) {
        markersRef.current.get(id)?.remove()
        markersRef.current.delete(id)
      }
    }

    for (const driver of drivers) {
      const el = document.createElement('div')
      el.style.width = '24px'
      el.style.height = '24px'
      el.style.borderRadius = '50%'
      el.style.border = '3px solid #16a34a'
      el.style.backgroundColor = '#fff'
      el.style.cursor = 'pointer'
      el.style.transition = 'border-color 0.3s, opacity 0.3s'

      const isLost = onSignalLost?.(driver.id)
      if (isLost) {
        el.style.borderColor = '#ef4444'
        el.style.opacity = '0.6'
      }

      const isNearHub = hubCoords
        && haversineKm(driver.lat, driver.lng, hubCoords.lat, hubCoords.lng) < 1

      if (isNearHub) {
        el.classList.add('driver-marker-pulse')
        el.style.borderColor = '#f59e0b'
      }

      el.title = driver.label

      el.addEventListener('click', () => {
        alert(`Chauffeur: ${driver.label}\nPosition: ${driver.lat.toFixed(4)}, ${driver.lng.toFixed(4)}`)
      })

      const existing = markersRef.current.get(driver.id)
      if (existing) {
        existing.setLngLat([driver.lng, driver.lat])
        const exEl = existing.getElement()
        exEl.style.borderColor = isNearHub ? '#f59e0b' : isLost ? '#ef4444' : '#16a34a'
        exEl.style.opacity = isLost ? '0.6' : '1'
        exEl.classList.toggle('driver-marker-pulse', !!isNearHub)
      } else {
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([driver.lng, driver.lat])
          .addTo(mapRef.current!)

        markersRef.current.set(driver.id, marker)
      }
    }
  }, [drivers, hubCoords, onSignalLost])

  return <div ref={mapContainer} className="h-[500px] w-full rounded-lg" />
}
