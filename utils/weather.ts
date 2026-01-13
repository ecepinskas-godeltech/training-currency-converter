import { ConditionCode } from "@/types/weather";

/**
 * Get weather condition description in English
 */
export function getConditionDescription(code: ConditionCode): string {
  const descriptions: Record<string, string> = {
    clear: "Clear",
    "partly-cloudy": "Partly Cloudy",
    "cloudy-with-sunny-intervals": "Cloudy with Sunny Intervals",
    cloudy: "Cloudy",
    "light-rain": "Light Rain",
    rain: "Rain",
    "heavy-rain": "Heavy Rain",
    thunder: "Thunder",
    "isolated-thunderstorms": "Isolated Thunderstorms",
    thunderstorms: "Thunderstorms",
    "heavy-rain-with-thunderstorms": "Heavy Rain with Thunderstorms",
    "light-sleet": "Light Sleet",
    sleet: "Sleet",
    "freezing-rain": "Freezing Rain",
    hail: "Hail",
    "light-snow": "Light Snow",
    snow: "Snow",
    "heavy-snow": "Heavy Snow",
    fog: "Fog",
  };

  return code ? descriptions[code] || "Unknown" : "Unknown";
}

/**
 * Get weather icon emoji based on condition code
 */
export function getWeatherIcon(code: ConditionCode): string {
  const icons: Record<string, string> = {
    clear: "☀️",
    "partly-cloudy": "⛅",
    "cloudy-with-sunny-intervals": "🌤️",
    cloudy: "☁️",
    "light-rain": "🌦️",
    rain: "🌧️",
    "heavy-rain": "⛈️",
    thunder: "⚡",
    "isolated-thunderstorms": "🌩️",
    thunderstorms: "⛈️",
    "heavy-rain-with-thunderstorms": "⛈️",
    "light-sleet": "🌨️",
    sleet: "🌨️",
    "freezing-rain": "🌧️",
    hail: "🌨️",
    "light-snow": "🌨️",
    snow: "❄️",
    "heavy-snow": "❄️",
    fog: "🌫️",
  };

  return code ? icons[code] || "🌡️" : "🌡️";
}

/**
 * Get wind direction as text
 */
export function getWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format time for display
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Check if a date is today
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Group forecast timestamps by day
 */
export function groupForecastsByDay(
  timestamps: Array<{ forecastTimeUtc: string; [key: string]: any }>
): Map<string, Array<{ forecastTimeUtc: string; [key: string]: any }>> {
  const grouped = new Map();

  timestamps.forEach((timestamp) => {
    const date = new Date(timestamp.forecastTimeUtc);
    const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey).push(timestamp);
  });

  return grouped;
}

/**
 * Get daily average or representative forecast from hourly data
 */
export function getDailyForecast(
  hourlyForecasts: Array<{ forecastTimeUtc: string; [key: string]: any }>
): any {
  if (hourlyForecasts.length === 0) return null;

  // Use midday forecast (around 12:00) if available, otherwise use the middle one
  const middayForecast = hourlyForecasts.find((f) => {
    const hour = new Date(f.forecastTimeUtc).getHours();
    return hour >= 11 && hour <= 13;
  });

  return (
    middayForecast || hourlyForecasts[Math.floor(hourlyForecasts.length / 2)]
  );
}
