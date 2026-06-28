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
  onSignalLost?: (driverId: string) => boolean
}

export function LiveDriverMap({ drivers, onSignalLost }: LiveDriverMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map())

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

      const isLost = onSignalLost?.(driver.id)
      if (isLost) {
        el.style.borderColor = '#ef4444'
        el.style.opacity = '0.6'
      }

      el.title = driver.label

      el.addEventListener('click', () => {
        alert(`Chauffeur: ${driver.label}\nPosition: ${driver.lat.toFixed(4)}, ${driver.lng.toFixed(4)}`)
      })

      const existing = markersRef.current.get(driver.id)
      if (existing) {
        existing.setLngLat([driver.lng, driver.lat])
        existing.getElement().style.borderColor = isLost ? '#ef4444' : '#16a34a'
        existing.getElement().style.opacity = isLost ? '0.6' : '1'
      } else {
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([driver.lng, driver.lat])
          .addTo(mapRef.current!)

        markersRef.current.set(driver.id, marker)
      }
    }
  }, [drivers, onSignalLost])

  return <div ref={mapContainer} className="h-[500px] w-full rounded-lg" />
}
