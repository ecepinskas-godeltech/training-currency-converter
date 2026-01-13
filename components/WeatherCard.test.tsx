import { render, screen } from "@testing-library/react";
import WeatherCard from "./WeatherCard";
import { ForecastTimestamp } from "@/types/weather";

describe("WeatherCard Component", () => {
  const mockForecast: ForecastTimestamp = {
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
    conditionCode: "partly-cloudy",
  };

  it("should render weather information", () => {
    render(<WeatherCard forecast={mockForecast} placeName="Vilnius" />);

    expect(screen.getByText("Vilnius")).toBeInTheDocument();
    expect(screen.getByText("15°C")).toBeInTheDocument();
    expect(screen.getByText(/Partly Cloudy/i)).toBeInTheDocument();
    expect(screen.getByText(/Feels like 13°C/i)).toBeInTheDocument();
  });

  it("should display wind information", () => {
    render(<WeatherCard forecast={mockForecast} placeName="Vilnius" />);

    expect(screen.getByText(/5 m\/s S/i)).toBeInTheDocument();
    expect(screen.getByText(/Gust: 8 m\/s/i)).toBeInTheDocument();
  });

  it("should display humidity and pressure", () => {
    render(<WeatherCard forecast={mockForecast} placeName="Vilnius" />);

    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("1013 hPa")).toBeInTheDocument();
  });

  it("should show current weather badge when isToday is true", () => {
    render(
      <WeatherCard forecast={mockForecast} placeName="Vilnius" isToday={true} />
    );

    expect(screen.getByText("Current Weather")).toBeInTheDocument();
  });

  it("should not show current weather badge when isToday is false", () => {
    render(
      <WeatherCard
        forecast={mockForecast}
        placeName="Vilnius"
        isToday={false}
      />
    );

    expect(screen.queryByText("Current Weather")).not.toBeInTheDocument();
  });

  it("should display precipitation", () => {
    render(<WeatherCard forecast={mockForecast} placeName="Vilnius" />);

    expect(screen.getByText("0 mm")).toBeInTheDocument();
  });

  it("should display cloud cover", () => {
    render(<WeatherCard forecast={mockForecast} placeName="Vilnius" />);

    expect(screen.getByText("50%")).toBeInTheDocument();
  });
});
