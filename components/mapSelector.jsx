"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), { ssr: false })

export default function MapSelector() {
  const [ubicacion, setUbicacion] = useState(null)
  const [destinoTemporal, setDestinoTemporal] = useState(null)
  const [destinoConfirmado, setDestinoConfirmado] = useState(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude]
        setUbicacion(coords)
      },
      (err) => {
        console.error("Error obteniendo ubicación:", err)
      }
    )
  }, [])

  const handleMapClick = (coords) => {
    setDestinoTemporal(coords)
  }

  const confirmarDestino = () => {
    if (destinoTemporal) {
      setDestinoConfirmado(destinoTemporal)
    }
  }

  return (
    <div className="relative w-full h-[100dvh] bg-black text-white">
      {ubicacion ? (
        <>
          <LeafletMap
            userLocation={ubicacion}
            assistantLocation={destinoConfirmado}
            marcadorTemporal={destinoTemporal}
            onMapClick={handleMapClick}
          />
          {destinoTemporal && !destinoConfirmado && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[1000]">
              <button
                onClick={confirmarDestino}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition"
              >
                Confirmar destino
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center mt-10 text-gray-400">Obteniendo ubicación...</p>
      )}
    </div>
  )
}
