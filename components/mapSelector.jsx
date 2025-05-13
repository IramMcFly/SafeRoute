"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), { ssr: false });

export default function MapSelector() {
  const [ubicacion, setUbicacion] = useState(null);
  const [destinoTemporal, setDestinoTemporal] = useState(null);
  const [destinoConfirmado, setDestinoConfirmado] = useState(null);
  const tipoRuta = "segura"; // o "rapida"
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUbicacion(coords);
      },
      (err) => {
        console.error("Error obteniendo ubicación:", err);
      }
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

  return (
    <div className="relative w-full h-[100dvh] bg-[#0e1e2b] text-white">
      {ubicacion ? (
        <>
          {/* Contenedor estilizado del mapa */}
          <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-white w-full h-full">
            <LeafletMap
              userLocation={ubicacion}
              assistantLocation={destinoConfirmado}
              marcadorTemporal={destinoTemporal}
              onMapClick={handleMapClick}
              tipoRuta={tipoRuta}
            />
          </div>

          {/* Botones uniformes de acción */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex gap-4">
            {destinoTemporal && !destinoConfirmado && (
              <button
                onClick={confirmarDestino}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-sm w-[170px]"
              >
                Confirmar destino
              </button>
            )}

            <button
              onClick={() => setMostrarModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-sm w-[170px]"
            >
              Reportar incidente
            </button>
          </div>

          {/* Modal de reporte */}
          {mostrarModal && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1100]">
              <div className="bg-white text-black rounded-lg p-6 w-80">
                <h2 className="text-lg font-bold mb-4">Reportar incidente</h2>
                <label className="block mb-2">Tipo:</label>
                <select className="w-full border p-2 rounded mb-4">
                  <option>Robo</option>
                  <option>Asalto</option>
                  <option>Acoso</option>
                  <option>Zona sin luz</option>
                  <option>Otros</option>
                </select>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="w-full bg-blue-600 text-white rounded py-2"
                >
                  Enviar (modo anónimo)
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-center mt-10 text-gray-400">Obteniendo ubicación...</p>
      )}
    </div>
  );
}
