"use client";

import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import axios from "axios";

// Corrige íconos default
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Función para calcular distancia entre dos coordenadas (Haversine)
function calcularDistanciaKm(coord1, coord2) {
  const toRad = (deg) => deg * (Math.PI / 180);
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371; // km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const isValidCoords = (coords) =>
  Array.isArray(coords) &&
  coords.length === 2 &&
  typeof coords[0] === "number" &&
  typeof coords[1] === "number";

const Recenter = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 14);
      setTimeout(() => map.invalidateSize(), 0);
    }
  }, [coords, map]);
  return null;
};

const ClickHandler = ({ onMapClick }) => {
  const map = useMap();
  useEffect(() => {
    const handleClick = (e) => {
      const { lat, lng } = e.latlng;
      onMapClick([lat, lng]);
    };
    map.on("click", handleClick);
    return () => map.off("click", handleClick);
  }, [map, onMapClick]);
  return null;
};

export default function LeafletMap({
  userLocation,
  assistantLocation,
  onMapClick,
  marcadorTemporal,
  tipoRuta,
}) {
  const [rutas, setRutas] = useState([]);
  const [hoveredRouteIndex, setHoveredRouteIndex] = useState(null);

  // Incidentes simulados con íconos personalizados
  const todosLosIncidentes = [
    {
      tipo: "Robo",
      descripcion: "Robo en Calle José María Mari",
      coords: [28.6445, -106.0875],
      iconUrl: "https://cdn-icons-png.flaticon.com/512/565/565547.png", // ícono de alerta
    },
    {
      tipo: "Choque",
      descripcion: "Choque en Av. División del Norte",
      coords: [28.6482, -106.0961],
      iconUrl: "https://cdn-icons-png.flaticon.com/512/5956/5956595.png", // ícono de choque
    },
  ];

  const incidentes = todosLosIncidentes
    .map((inc) => {
      const distancia = isValidCoords(userLocation)
        ? calcularDistanciaKm(userLocation, inc.coords)
        : Infinity;
      return { ...inc, distancia };
    })
    .filter((inc) => inc.distancia <= 5);

  useEffect(() => {
    if (!isValidCoords(userLocation) || !isValidCoords(assistantLocation)) {
      setRutas([]); // ← Borra la línea si se reinicia la ruta
      return;
    }

    const fetchRuta = async () => {
      try {
        const coordinates = [
          [assistantLocation[1], assistantLocation[0]],
          [userLocation[1], userLocation[0]],
        ];

        const response = await axios.post("/api/map/", {
          coordinates,
          alternative_routes: {
            target_count: 2,
            share_factor: 0.6,
          },
        });

        const rutasData = response.data.routes || [];

        const rutasDecodificadas = rutasData.map((r) =>
          typeof r.geometry === "string"
            ? decodePolyline(r.geometry)
            : (r.geometry?.coordinates || []).map(([lng, lat]) => [lat, lng])
        );

        setRutas(rutasDecodificadas);
      } catch (error) {
        console.error("❌ Error obteniendo rutas:", error.response?.data || error.message);
      }
    };

    fetchRuta();
  }, [userLocation, assistantLocation]);

  return (
    <MapContainer
      center={userLocation || [0, 0]}
      zoom={13}
      scrollWheelZoom={false}
      className="w-full h-full z-0"
    >
      <Recenter coords={userLocation} />
      <ClickHandler onMapClick={onMapClick} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {isValidCoords(userLocation) && <Marker position={userLocation} />}
      {isValidCoords(assistantLocation) && <Marker position={assistantLocation} />}
      {isValidCoords(marcadorTemporal) && !assistantLocation && (
        <Marker position={marcadorTemporal} />
      )}

      {rutas.map((ruta, i) => {
        const defaultColor =
          i === 0
            ? tipoRuta === "segura"
              ? "#2ecc71"
              : "#3498db"
            : "#e67e22";

        const label =
          i === 0
            ? tipoRuta === "segura"
              ? "Ruta segura"
              : "Ruta rápida"
            : "Ruta peligrosa";

        const isHovered = hoveredRouteIndex === i;

        return (
          <Polyline
            key={i}
            positions={ruta}
            eventHandlers={{
              mouseover: () => setHoveredRouteIndex(i),
              mouseout: () => setHoveredRouteIndex(null),
            }}
            pathOptions={{
              color: isHovered ? "#f1c40f" : defaultColor,
              weight: isHovered ? 8 : i === 0 ? 6 : 5,
              opacity: 0.95,
              dashArray: i === 0 ? null : "6",
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
              <span className="font-semibold text-sm">{label}</span>
            </Tooltip>
          </Polyline>
        );
      })}

      {incidentes.map((inc, idx) => (
        <Marker
          key={`inc-${idx}`}
          position={inc.coords}
          icon={L.icon({
            iconUrl: inc.iconUrl,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          })}
        >
          <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
            <span className="text-sm font-semibold">
              {inc.tipo}: {inc.descripcion} (a {inc.distancia.toFixed(2)} km)
            </span>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}

// Decodificador de polilínea (al final)
function decodePolyline(encoded) {
  let points = [], index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : result >> 1;
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : result >> 1;
    lng += dlng;
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}
