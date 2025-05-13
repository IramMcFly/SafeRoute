// app/api/map/route.js
import { NextResponse } from "next/server"

export async function POST(request) {
  const body = await request.json()
  const { coordinates, alternative_routes } = body

  try {
    const response = await fetch("https://api.openrouteservice.org/v2/directions/driving-car", {
      method: "POST",
      headers: {
        Authorization: process.env.LEAFLETMAP_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates,
        instructions: false,
        geometry: true,
        alternative_routes: alternative_routes || {
          target_count: 2,
          share_factor: 0.6,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: "Error en ORS", response: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Error interno", message: err.message }, { status: 500 })
  }
}
