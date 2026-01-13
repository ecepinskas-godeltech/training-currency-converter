import { GET } from "./route";

// Mock fetch
global.fetch = jest.fn();

describe("/api/weather/[placeCode] API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockWeatherData = {
    place: {
      code: "vilnius",
      name: "Vilnius",
      administrativeDivision: "Vilniaus miestas",
      country: "Lithuania",
      countryCode: "LT",
      coordinates: { latitude: 54.6872, longitude: 25.2797 },
    },
    forecastType: "long-term",
    forecastCreationTimeUtc: "2024-01-15T10:00:00Z",
    forecastTimestamps: [
      {
        forecastTimeUtc: "2024-01-15T12:00:00Z",
        airTemperature: 15,
        feelsLikeTemperature: 13,
        windSpeed: 5,
        windGust: 8,
        windDirection: 180,
        cloudCover: 50,
        seaLevelPressure: 1013,
        relativeHumidity: 75,
        totalPrecipitation: 0,
        conditionCode: "partly-cloudy" as const,
      },
    ],
  };

  it("should return weather data successfully", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockWeatherData,
      status: 200,
    });

    const mockRequest = new Request("http://localhost/api/weather/vilnius");
    const response = await GET(mockRequest, {
      params: { placeCode: "vilnius" },
    });
    const data = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.meteo.lt/v1/places/vilnius/forecasts/long-term",
      expect.objectContaining({
        next: { revalidate: 3600 },
      })
    );
    expect(data).toEqual(mockWeatherData);
  });

  it("should handle 404 for non-existent place", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const mockRequest = new Request("http://localhost/api/weather/invalid");
    const response = await GET(mockRequest, {
      params: { placeCode: "invalid" },
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty("error", "Place not found");
  });

  it("should handle API errors", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const mockRequest = new Request("http://localhost/api/weather/vilnius");
    const response = await GET(mockRequest, {
      params: { placeCode: "vilnius" },
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty("error");
  });

  it("should normalize place code to lowercase", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockWeatherData,
      status: 200,
    });

    const mockRequest = new Request("http://localhost/api/weather/VILNIUS");
    await GET(mockRequest, { params: { placeCode: "VILNIUS" } });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.meteo.lt/v1/places/vilnius/forecasts/long-term",
      expect.any(Object)
    );
  });
});
