'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface Zone {
  id: string
  name: string
  coordinates: number[][]
}

export default function AdminZonesPage() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [drawing, setDrawing] = useState(false)
  const [points, setPoints] = useState<number[][]>([])
  const [zoneName, setZoneName] = useState('')
  const [saving, setSaving] = useState(false)

  const drawPolygon = useCallback(() => {
    if (!mapRef.current || points.length < 3) return

    const sourceId = 'drawing-preview'
    const existing = mapRef.current.getSource(sourceId)
    if (existing) {
      ;(existing as maplibregl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [[...points, points[0]]],
        },
      })
    } else {
      mapRef.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [[...points, points[0]]],
          },
        },
      })
      mapRef.current.addLayer({
        id: 'drawing-fill',
        type: 'fill',
        source: sourceId,
        paint: { 'fill-color': '#16a34a', 'fill-opacity': 0.2 },
      })
      mapRef.current.addLayer({
        id: 'drawing-outline',
        type: 'line',
        source: sourceId,
        paint: { 'line-color': '#16a34a', 'line-width': 2 },
      })
    }
  }, [points])

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [10.1, 36.8],
      zoom: 10,
    })
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    drawPolygon()
  }, [points, drawPolygon])

  function handleMapClick(e: maplibregl.MapMouseEvent) {
    if (!drawing) return
    setPoints((prev) => [...prev, [e.lngLat.lng, e.lngLat.lat]])
    const markerEl = document.createElement('div')
    markerEl.className = 'w-3 h-3 bg-amber-500 rounded-full border-2 border-white'
    new maplibregl.Marker({ element: markerEl })
      .setLngLat([e.lngLat.lng, e.lngLat.lat])
      .addTo(mapRef.current!)
  }

  function startDrawing() {
    setDrawing(true)
    setPoints([])
    mapRef.current?.on('click', handleMapClick as unknown as (e: maplibregl.MapMouseEvent) => void)
  }

  function finishDrawing() {
    setDrawing(false)
    mapRef.current?.off('click', handleMapClick as unknown as (e: maplibregl.MapMouseEvent) => void)
  }

  function undoPoint() {
    setPoints((prev) => prev.slice(0, -1))
  }

  async function saveZone() {
    if (!zoneName || points.length < 3) return
    setSaving(true)

    const supabase = (await import('@/lib/supabase/client')).createClient()
    const { data: { session } } = await supabase.auth.getSession()

    await fetch('/api/admin/zones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        name: zoneName,
        coordinates: points,
        hubId: null,
      }),
    })

    setZoneName('')
    setPoints([])
    setSaving(false)
    finishDrawing()
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Zones de livraison</h1>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {!drawing ? (
          <button
            className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white"
            onClick={startDrawing}
          >
            Dessiner une zone
          </button>
        ) : (
          <>
            <button
              className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
              onClick={finishDrawing}
            >
              Annuler
            </button>
            <button
              className="rounded-lg bg-gray-600 px-4 py-2 text-sm text-white"
              onClick={undoPoint}
              disabled={points.length === 0}
            >
              Annuler point
            </button>
            <input
              type="text"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              placeholder="Nom de la zone (ex: La Marsa)"
            />
            <button
              className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              onClick={saveZone}
              disabled={saving || points.length < 3 || !zoneName}
            >
              {saving ? 'Enregistrement...' : `Enregistrer (${points.length} points)`}
            </button>
          </>
        )}
        <span className="text-sm text-gray-500">
          {drawing ? 'Cliquez sur la carte pour ajouter des points' : `${zones.length} zone(s)`}
        </span>
      </div>

      <div ref={mapContainer} className="h-[500px] w-full rounded-lg" />
    </div>
  )
}
