import { NextResponse } from "next/server";
import { PlaceListItem } from "@/types/weather";
import https from "https";
import fetch from "node-fetch";

const API_BASE_URL = "https://api.meteo.lt/v1";

// Create an https agent that doesn't reject unauthorized certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export const revalidate = 3600; // Cache for 1 hour

/**
 * GET /api/places
 * Fetches the list of all available places from the weather API
 */
export async function GET() {
  try {
    console.log("Fetching places from:", `${API_BASE_URL}/places`);

    const response = await fetch(`${API_BASE_URL}/places`, {
      agent: httpsAgent,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
    });

    console.log("Places API Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Places API error (${response.status}):`, errorText);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const places: PlaceListItem[] = await response.json();
    console.log(`Fetched ${places.length} places successfully`);

    return NextResponse.json(places);
  } catch (error) {
    console.error("Error fetching places:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        error: "Failed to fetch places",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
