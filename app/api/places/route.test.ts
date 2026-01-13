import { GET } from "./route";
import { NextResponse } from "next/server";

// Mock fetch
global.fetch = jest.fn();

describe("/api/places API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return places data successfully", async () => {
    const mockPlaces = [
      {
        code: "vilnius",
        name: "Vilnius",
        administrativeDivision: "Vilniaus miestas",
        countryCode: "LT",
        coordinates: { latitude: 54.6872, longitude: 25.2797 },
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlaces,
    });

    const response = await GET();
    const data = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.meteo.lt/v1/places",
      expect.objectContaining({
        next: { revalidate: 3600 },
      })
    );
    expect(data).toEqual(mockPlaces);
  });

  it("should handle API errors", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty("error");
  });

  it("should handle network errors", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty("error");
  });
});
