import {
  getConditionDescription,
  getWeatherIcon,
  getWindDirection,
  formatDate,
  formatTime,
  isToday,
  groupForecastsByDay,
  getDailyForecast,
} from "../weather";
import { ConditionCode } from "@/types/weather";

describe("Weather Utils", () => {
  describe("getConditionDescription", () => {
    it("should return correct description for clear weather", () => {
      expect(getConditionDescription("clear")).toBe("Clear");
    });

    it("should return correct description for rain", () => {
      expect(getConditionDescription("rain")).toBe("Rain");
    });

    it("should return Unknown for null", () => {
      expect(getConditionDescription(null)).toBe("Unknown");
    });
  });

  describe("getWeatherIcon", () => {
    it("should return sun emoji for clear weather", () => {
      expect(getWeatherIcon("clear")).toBe("☀️");
    });

    it("should return rain emoji for rain", () => {
      expect(getWeatherIcon("rain")).toBe("🌧️");
    });

    it("should return default icon for null", () => {
      expect(getWeatherIcon(null)).toBe("🌡️");
    });
  });

  describe("getWindDirection", () => {
    it("should return N for 0 degrees", () => {
      expect(getWindDirection(0)).toBe("N");
    });

    it("should return E for 90 degrees", () => {
      expect(getWindDirection(90)).toBe("E");
    });

    it("should return S for 180 degrees", () => {
      expect(getWindDirection(180)).toBe("S");
    });

    it("should return W for 270 degrees", () => {
      expect(getWindDirection(270)).toBe("W");
    });

    it("should return NE for 45 degrees", () => {
      expect(getWindDirection(45)).toBe("NE");
    });
  });

  describe("formatDate", () => {
    it("should format date correctly", () => {
      const date = "2024-01-15T12:00:00Z";
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Mon|Tue|Wed|Thu|Fri|Sat|Sun/);
      expect(formatted).toMatch(
        /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/
      );
    });
  });

  describe("formatTime", () => {
    it("should format time correctly", () => {
      const date = "2024-01-15T12:00:00Z";
      const formatted = formatTime(date);
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe("isToday", () => {
    it("should return true for today's date", () => {
      const today = new Date().toISOString();
      expect(isToday(today)).toBe(true);
    });

    it("should return false for yesterday", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday.toISOString())).toBe(false);
    });
  });

  describe("groupForecastsByDay", () => {
    it("should group forecasts by day", () => {
      const forecasts = [
        { forecastTimeUtc: "2024-01-15T12:00:00Z", temp: 10 },
        { forecastTimeUtc: "2024-01-15T15:00:00Z", temp: 12 },
        { forecastTimeUtc: "2024-01-16T12:00:00Z", temp: 8 },
      ];

      const grouped = groupForecastsByDay(forecasts);
      expect(grouped.size).toBe(2);
      expect(grouped.get("2024-01-15")).toHaveLength(2);
      expect(grouped.get("2024-01-16")).toHaveLength(1);
    });
  });

  describe("getDailyForecast", () => {
    it("should return midday forecast when available", () => {
      const forecasts = [
        { forecastTimeUtc: "2024-01-15T09:00:00Z", temp: 10 },
        { forecastTimeUtc: "2024-01-15T12:00:00Z", temp: 15 },
        { forecastTimeUtc: "2024-01-15T18:00:00Z", temp: 12 },
      ];

      const daily = getDailyForecast(forecasts);
      expect(daily.temp).toBe(15);
    });

    it("should return middle forecast when no midday available", () => {
      const forecasts = [
        { forecastTimeUtc: "2024-01-15T06:00:00Z", temp: 8 },
        { forecastTimeUtc: "2024-01-15T09:00:00Z", temp: 10 },
        { forecastTimeUtc: "2024-01-15T15:00:00Z", temp: 12 },
      ];

      const daily = getDailyForecast(forecasts);
      expect(daily).toBeDefined();
    });

    it("should return null for empty array", () => {
      const daily = getDailyForecast([]);
      expect(daily).toBeNull();
    });
  });
});
