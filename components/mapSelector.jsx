// ✅ 1. MapSelector.jsx actualizado con popup animado y formulario completo
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), { ssr: false });

export default function MapSelector() {
  const [ubicacion, setUbicacion] = useState(null);
  const [destinoTemporal, setDestinoTemporal] = useState(null);
  const [destinoConfirmado, setDestinoConfirmado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [reportes, setReportes] = useState([]);

  const tipoRuta = "segura";

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUbicacion(coords);
      },
      (err) => console.error("Error obteniendo ubicación:", err)
    );
  }, []);

  const handleMapClick = (coords) => {
    setDestinoTemporal(coords);
  };

  const confirmarDestino = () => {
    if (destinoTemporal) {
      setDestinoConfirmado(destinoTemporal);
    }
  };

  const enviarReporte = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const tipo = formData.get("tipo");
    const descripcion = formData.get("descripcion");
    const archivo = formData.get("archivo");

    if (!ubicacion) return;

    const nuevoReporte = {
      tipo,
      descripcion,
      archivo: archivo.name || null,
      coords: ubicacion,
      iconUrl: "https://cdn-icons-png.flaticon.com/512/929/929426.png",
    };

    setReportes((prev) => [...prev, nuevoReporte]);
    setMostrarModal(false);
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#0e1e2b] text-white">
      {ubicacion ? (
        <>
          <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-white w-full h-full">
            <LeafletMap
              userLocation={ubicacion}
              assistantLocation={destinoConfirmado}
              marcadorTemporal={destinoTemporal}
              onMapClick={handleMapClick}
              tipoRuta={tipoRuta}
              reportesExternos={reportes}
            />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex gap-4 flex-wrap justify-center">
            {destinoTemporal && !destinoConfirmado && (
              <button
                onClick={confirmarDestino}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-sm w-[170px]"
              >
                Confirmar destino
              </button>
            )}

            {destinoConfirmado && (
              <button
                onClick={() => {
                  setDestinoTemporal(null);
                  setDestinoConfirmado(null);
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-sm w-[170px]"
              >
                Reiniciar ruta
              </button>
            )}

            <button
              onClick={() => setMostrarModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-sm w-[170px]"
            >
              Reportar incidente
            </button>
          </div>

          {mostrarModal && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1100]">
              <form
                onSubmit={enviarReporte}
                className="bg-white text-black rounded-lg p-6 w-80 scale-100 animate-fade-in transition-all duration-300"
              >
                <h2 className="text-lg font-bold mb-4">Reportar incidente</h2>

                <label className="block mb-1 text-sm font-medium">Tipo:</label>
                <select name="tipo" className="w-full border p-2 rounded mb-3" required>
                  <option>Robo</option>
                  <option>Asalto</option>
                  <option>Acoso</option>
                  <option>Zona sin luz</option>
                  <option>Otros</option>
                </select>

                <label className="block mb-1 text-sm font-medium">Descripción:</label>
                <textarea
                  name="descripcion"
                  className="w-full border p-2 rounded mb-3"
                  rows={3}
                  placeholder="Agrega detalles..."
                ></textarea>

                <label className="block mb-1 text-sm font-medium">Archivo (opcional):</label>
                <input
                  type="file"
                  name="archivo"
                  accept="image/*,video/*"
                  className="w-full border p-2 rounded mb-4"
                />

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 font-semibold"
                >
                  Enviar reporte
                </button>
              </form>
            </div>
          )}
        </>
      ) : (
        <p className="text-center mt-10 text-gray-400">Obteniendo ubicación...</p>
      )}
    </div>
  );
}
