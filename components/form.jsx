// app/form.jsx
"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function FormularioEvaktrafik() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    edad: "",
    vehiculo: "",
    motivo: "",
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    localStorage.setItem("evaktrafik_usuario", JSON.stringify(formData))
    router.push("/selector")
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-[#001f3f] p-6 rounded-xl shadow-lg w-full max-w-lg space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-[#87CEEB]">Evaktrafik</h1>
        <p className="text-sm text-center text-gray-300 mb-4">
          Ayúdanos a calcular tus mejores rutas alternativas
        </p>

        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Nombre"
          required
          className="w-full p-3 rounded bg-[#0a0a0a] border border-[#87CEEB] placeholder-gray-400"
        />
        <input
          type="text"
          name="apellido"
          value={formData.apellido}
          onChange={handleChange}
          placeholder="Apellido"
          required
          className="w-full p-3 rounded bg-[#0a0a0a] border border-[#87CEEB] placeholder-gray-400"
        />
        <input
          type="number"
          name="edad"
          value={formData.edad}
          onChange={handleChange}
          placeholder="Edad"
          required
          className="w-full p-3 rounded bg-[#0a0a0a] border border-[#87CEEB] placeholder-gray-400"
        />
        <input
          type="text"
          name="vehiculo"
          value={formData.vehiculo}
          onChange={handleChange}
          placeholder="¿Qué tipo de vehículo usas?"
          required
          className="w-full p-3 rounded bg-[#0a0a0a] border border-[#87CEEB] placeholder-gray-400"
        />
        <select
          name="motivo"
          value={formData.motivo}
          onChange={handleChange}
          required
          className="w-full p-3 rounded bg-[#0a0a0a] border border-[#87CEEB] text-white"
        >
          <option value="">¿Para qué te mueves?</option>
          <option value="trabajo">Trabajo</option>
          <option value="escuela">Escuela</option>
          <option value="otro">Otro</option>
        </select>

        <button
          type="submit"
          className="w-full bg-[#87CEEB] hover:bg-[#00bfff] text-black font-bold py-2 rounded"
        >
          Continuar
        </button>
      </form>
    </div>
  )
}
