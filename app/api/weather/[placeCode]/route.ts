import { NextResponse } from "next/server";
import { WeatherForecast } from "@/types/weather";
import https from "https";
import fetch from "node-fetch";

const API_BASE_URL = "https://api.meteo.lt/v1";

// Create an https agent that doesn't reject unauthorized certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export const revalidate = 3600; // Cache for 1 hour

/**
 * GET /api/weather/[placeCode]
 * Fetches weather forecast for a specific place
 */
export async function GET(
  request: Request,
  { params }: { params: { placeCode: string } }
) {
  try {
    const { placeCode } = params;

    if (!placeCode) {
      return NextResponse.json(
        { error: "Place code is required" },
        { status: 400 }
      );
    }

    // Normalize place code to lowercase
    const normalizedCode = placeCode.toLowerCase();

    const apiUrl = `${API_BASE_URL}/places/${normalizedCode}/forecasts/long-term`;
    console.log("Fetching weather from:", apiUrl);

    const response = await fetch(apiUrl, {
      agent: httpsAgent,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
    });

    console.log("API Response status:", response.status);

    if (response.status === 404) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const forecast: WeatherForecast = await response.json();
    console.log("Weather data fetched successfully for:", normalizedCode);

    return NextResponse.json(forecast);
  } catch (error) {
    console.error("Error fetching weather:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        error: "Failed to fetch weather data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
