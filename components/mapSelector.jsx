"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Menu, X, AlertCircle, Clock } from "lucide-react";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), { ssr: false });

export default function MapSelector() {
  const [ubicacion, setUbicacion] = useState(null);
  const [destinoTemporal, setDestinoTemporal] = useState(null);
  const [destinoConfirmado, setDestinoConfirmado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [reportes, setReportes] = useState([]);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [historialRutas, setHistorialRutas] = useState([]);

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

      // Guardar en historial
      setHistorialRutas((prev) => [
        ...prev,
        {
          id: Date.now(),
          origen: ubicacion,
          destino: destinoTemporal,
          timestamp: new Date().toLocaleString(),
        },
      ]);
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
    <div className="relative w-full h-[100dvh] bg-[#0e1e2b] text-white overflow-hidden">
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
          </div>

          {/* Botón para abrir sidebar (solo cuando está cerrado) */}
          {!sidebarAbierto && (
            <button
              onClick={() => setSidebarAbierto(true)}
              className="absolute top-6 left-6 z-[1001] bg-black/60 hover:bg-black/80 p-3 rounded-full shadow-lg"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Sidebar izquierdo bien organizado */}
          <div
            className={`absolute top-0 left-0 z-[1000] bg-[#1e2e3e] h-full w-64 flex flex-col justify-between transition-transform duration-300 ${sidebarAbierto ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            {/* Encabezado dentro del sidebar */}
            <div>
              <div className="flex items-center justify-between px-6 pt-6">
                <h2 className="text-lg font-bold text-white">Opciones</h2>
                <button onClick={() => setSidebarAbierto(false)}>
                  <X className="w-5 h-5 text-white hover:text-red-400" />
                </button>
              </div>
              <hr className="border-white/20 my-3 mx-6" />

              {/* Opciones */}
              <div className="px-6 space-y-4">
                <button
                  onClick={() => {
                    setMostrarModal(true);
                    setSidebarAbierto(false);
                  }}
                  className="flex items-center gap-3 text-white hover:text-yellow-300 transition"
                >
                  <AlertCircle className="w-5 h-5" /> Reportar incidente
                </button>

                <button
                  onClick={() => {
                    setMostrarHistorial(!mostrarHistorial);
                    setSidebarAbierto(false);
                  }}
                  className="flex items-center gap-3 text-white hover:text-yellow-300 transition"
                >
                  <Clock className="w-5 h-5" /> Historial de rutas
                </button>
              </div>
            </div>

            {/* Usuario (parte inferior) */}
            <div className="p-4 bg-[#162430] border-t border-white/10 flex items-center gap-3">
              <img
                src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                alt="avatar"
                className="w-10 h-10 rounded-full border border-white"
              />
              <div>
                <p className="text-white font-semibold text-sm">Carlos López</p>
                <p className="text-white text-xs opacity-80">carlos.lopez@example.com</p>
              </div>
            </div>
          </div>

          {/* Modal para reporte */}
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

          {/* Historial modal simple */}
          {mostrarHistorial && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1100]">
              <div className="bg-white text-black rounded-lg p-6 w-[90%] max-w-lg max-h-[80vh] overflow-auto">
                <h2 className="text-lg font-bold mb-4">Historial de rutas</h2>
                {historialRutas.length === 0 ? (
                  <p className="text-sm text-gray-600">No hay rutas registradas aún.</p>
                ) : (
                  <ul className="text-sm space-y-3">
                    {historialRutas.map((ruta) => (
                      <li key={ruta.id} className="border-b pb-2">
                        <p><strong>Fecha:</strong> {ruta.timestamp}</p>
                        <p><strong>Desde:</strong> {ruta.origen.join(", ")}</p>
                        <p><strong>Hasta:</strong> {ruta.destino.join(", ")}</p>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => setMostrarHistorial(false)}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
                >
                  Cerrar
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
