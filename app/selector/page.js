// app/selector/page.js
"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// ⚠️ Importa como componente cliente y muestra fallback mientras carga
const MapSelector = dynamic(() => import("@/components/mapSelector"), {
  ssr: false,
  loading: () => <div className="text-white p-4">Cargando mapa...</div>,
})

export default function SelectorPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Suspense fallback={<div className="text-white p-4">Preparando mapa...</div>}>
        <MapSelector />
      </Suspense>
    </div>
  )
}
