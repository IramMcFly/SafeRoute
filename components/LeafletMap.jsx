"use client"

import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useState } from "react"
import axios from "axios"

// Corrige íconos default de Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// Re-centra el mapa en la ubicación del usuario
const Recenter = ({ coords }) => {
  const map = useMap()
  useEffect(() => {
    if (coords) {
      map.setView(coords, 14)
      setTimeout(() => {
        map.invalidateSize()
      }, 0)
    }
  }, [coords, map])
  return null
}

// Detecta clics en el mapa y ejecuta callback
const ClickHandler = ({ onClick }) => {
  const map = useMap()

  useEffect(() => {
    const handleClick = (e) => {
      const { lat, lng } = e.latlng
      onClick([lat, lng])
    }

    map.on("click", handleClick)
    return () => map.off("click", handleClick)
  }, [map, onClick])

  return null
}

// Decodifica polilínea de ORS
function decodePolyline(encoded) {
  let points = []
  let index = 0, len = encoded.length
  let lat = 0, lng = 0

  while (index < len) {
    let b, shift = 0, result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlat = (result & 1) ? ~(result >> 1) : result >> 1
    lat += dlat

    shift = 0
    result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlng = (result & 1) ? ~(result >> 1) : result >> 1
    lng += dlng

    points.push([lat / 1e5, lng / 1e5])
  }

  return points
}

const isValidCoords = (coords) =>
  Array.isArray(coords) &&
  coords.length === 2 &&
  typeof coords[0] === "number" &&
  typeof coords[1] === "number"

export default function LeafletMap({ userLocation, assistantLocation, onMapClick, marcadorTemporal }) {
  const [rutas, setRutas] = useState([])
  const [infoRutas, setInfoRutas] = useState([])

  useEffect(() => {
    const fetchRuta = async () => {
      if (!isValidCoords(userLocation) || !isValidCoords(assistantLocation)) return

      const coordinates = [
        [assistantLocation[1], assistantLocation[0]],
        [userLocation[1], userLocation[0]],
      ]

      try {
        const response = await axios.post("/api/map/", {
          coordinates,
          alternative_routes: {
            target_count: 2,
            share_factor: 0.6,
          },
        })

        const rutasData = response.data.routes || []

        const rutasDecodificadas = rutasData.map((r) => {
          const geometry = r.geometry
          if (typeof geometry === "string") return decodePolyline(geometry)
          if (geometry?.coordinates) return geometry.coordinates.map(([lng, lat]) => [lat, lng])
          return []
        })

        const resumen = rutasData.map((r) => ({
          distancia: (r.summary.distance / 1000).toFixed(2),
          duracion: (r.summary.duration / 60).toFixed(1),
        }))

        setRutas(rutasDecodificadas)
        setInfoRutas(resumen)
      } catch (error) {
        console.error("❌ Error obteniendo rutas:", error.response?.data || error.message)
      }
    }

    fetchRuta()
  }, [userLocation, assistantLocation])

  return (
    <>
      <MapContainer center={userLocation || [0, 0]} zoom={13} scrollWheelZoom={false} className="w-full h-full z-0">
        <Recenter coords={userLocation} />
        <ClickHandler onClick={onMapClick} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {isValidCoords(userLocation) && <Marker position={userLocation} />}
        {isValidCoords(assistantLocation) && <Marker position={assistantLocation} />}
        {isValidCoords(marcadorTemporal) && !assistantLocation && (
          <Marker position={marcadorTemporal} />
        )}
        {rutas.map((ruta, i) => (
          <Polyline
            key={i}
            positions={ruta}
            pathOptions={{
              color: i === 0 ? "orange" : i === 1 ? "blue" : "green",
              weight: i === 0 ? 5 : 3,
              opacity: 0.8,
              dashArray: i === 0 ? null : "6",
            }}
          />
        ))}
      </MapContainer>

      {infoRutas.length > 0 && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white text-black rounded-lg shadow-lg p-4 z-[1000] w-[90%] max-w-sm text-sm">
          <h2 className="font-bold text-base mb-2">Opciones de ruta:</h2>
          {infoRutas.map((info, i) => (
            <div key={i} className="mb-2 border-b pb-1">
              <p className="text-sm font-medium">
                Ruta {i + 1}: <span className="font-semibold">{info.distancia} km</span> –{" "}
                <span className="font-semibold">{info.duracion} min</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
