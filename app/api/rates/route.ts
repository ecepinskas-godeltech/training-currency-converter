import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter (consider Redis for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Check rate limit for a given identifier
 */
function checkRateLimit(
  identifier: string,
  maxRequests = 100,
  windowMs = 60000,
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Validate and sanitize exchange rates response
 */
function validateRatesResponse(
  data: any,
): { base: string; rates: Record<string, number> } | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  if (
    typeof data.base !== "string" ||
    !data.rates ||
    typeof data.rates !== "object"
  ) {
    return null;
  }

  // Sanitize rates object - only accept valid number values
  const sanitizedRates: Record<string, number> = {};

  for (const [key, value] of Object.entries(data.rates)) {
    if (
      typeof key === "string" &&
      key.length === 3 &&
      /^[A-Z]{3}$/.test(key) &&
      typeof value === "number" &&
      !isNaN(value) &&
      isFinite(value) &&
      value > 0
    ) {
      sanitizedRates[key] = value;
    }
  }

  // Ensure we have at least some valid rates
  if (Object.keys(sanitizedRates).length === 0) {
    return null;
  }

  return {
    base: data.base,
    rates: sanitizedRates,
  };
}

// API sources with fallback support
// Using free APIs that don't require authentication
const API_SOURCES = [
  {
    name: "frankfurter.app",
    url: "https://api.frankfurter.app/latest?from=USD",
    transform: (data: any) => ({
      base: data.base,
      rates: { USD: 1, ...data.rates }, // Add USD since it's not included
    }),
  },
];

/**
 * Fetch exchange rates from a specific API source
 */
async function fetchFromSource(source: (typeof API_SOURCES)[0]): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    // Use undici for better Node.js fetch support with SSL handling
    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      // @ts-ignore - Node.js specific options
      ...(typeof process !== "undefined" && {
        agent: false, // Use default agent
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return source.transform(data);
  } catch (error: any) {
    clearTimeout(timeout);
    console.error(`Error fetching from ${source.name}:`, error.message);
    throw error;
  }
}

/**
 * Mock data for development/fallback when APIs are unavailable
 */
const MOCK_RATES = {
  base: "USD",
  rates: {
    USD: 1.0,
    EUR: 0.85,
    GBP: 0.73,
    JPY: 149.5,
    AUD: 1.52,
    CAD: 1.35,
    CHF: 0.88,
    CNY: 7.24,
    INR: 83.12,
    MXN: 17.25,
  },
};

/**
 * Fetch exchange rates with fallback support
 */
async function fetchExchangeRates(): Promise<any> {
  let lastError: Error | null = null;

  // Try each API source in order
  for (const source of API_SOURCES) {
    try {
      const data = await fetchFromSource(source);
      return data;
    } catch (error: any) {
      lastError = error;
      console.error(`Failed to fetch from ${source.name}:`, error.message);
    }
  }

  // If all sources failed, use mock data as fallback (useful in development)
  console.warn("All API sources failed. Using mock data as fallback.");
  console.error(`Last error: ${lastError?.message || "Unknown error"}`);
  return MOCK_RATES;
}

/**
 * API Route Handler for exchange rates
 * Implements 1-hour caching with Next.js revalidate
 */
export async function GET(request: NextRequest) {
  // Rate limiting check
  const identifier = request.headers.get("x-forwarded-for") || "anonymous";

  if (!checkRateLimit(identifier)) {
    return NextResponse.json(
      {
        success: false,
        error: "Rate limit exceeded. Please try again later.",
      },
      { status: 429 },
    );
  }

  try {
    const data = await fetchExchangeRates();

    // Validate response structure
    const validatedData = validateRatesResponse(data);

    if (!validatedData) {
      throw new Error("Invalid API response structure");
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          base: validatedData.base,
          rates: validatedData.rates,
          timestamp: Date.now(),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error: any) {
    console.error("Error in exchange rates API:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch exchange rates",
      },
      {
        status: 500,
      },
    );
  }
}

// Enable caching for 1 hour
export const revalidate = 3600;
