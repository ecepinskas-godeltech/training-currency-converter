"use client";

import { ForecastListProps } from "@/types/weather";
import {
  getConditionDescription,
  getWeatherIcon,
  formatDate,
  groupForecastsByDay,
  getDailyForecast,
} from "@/utils/weather";

export default function ForecastList({
  forecasts,
  placeName,
}: ForecastListProps) {
  // Group forecasts by day
  const groupedForecasts = groupForecastsByDay(forecasts);

  // Convert to array and skip today (first day)
  const dailyForecasts = Array.from(groupedForecasts.entries())
    .slice(1, 6) // Skip today, get next 5 days
    .map(([date, hourlyForecasts]) => ({
      date,
      forecast: getDailyForecast(hourlyForecasts),
    }))
    .filter((item) => item.forecast !== null);

  if (dailyForecasts.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No forecast data available for upcoming days.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">5-Day Forecast</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {dailyForecasts.map(({ date, forecast }) => (
          <div
            key={date}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                {formatDate(forecast.forecastTimeUtc)}
              </p>
              <div className="text-4xl mb-2">
                {getWeatherIcon(forecast.conditionCode)}
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {Math.round(forecast.airTemperature)}°C
              </div>
              <p className="text-xs text-gray-600 mb-2">
                {getConditionDescription(forecast.conditionCode)}
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>💨 {forecast.windSpeed} m/s</p>
                <p>💧 {forecast.relativeHumidity}%</p>
                <p>🌧️ {forecast.totalPrecipitation} mm</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
