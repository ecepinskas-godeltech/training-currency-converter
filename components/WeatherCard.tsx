"use client";

import { WeatherCardProps } from "@/types/weather";
import {
  getConditionDescription,
  getWeatherIcon,
  getWindDirection,
  formatDate,
  formatTime,
} from "@/utils/weather";

export default function WeatherCard({
  forecast,
  placeName,
  isToday = false,
}: WeatherCardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-6 ${
        isToday ? "border-4 border-primary-500" : ""
      }`}
    >
      {isToday && (
        <div className="bg-primary-500 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-3">
          Current Weather
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{placeName}</h3>
          <p className="text-gray-600">
            {formatDate(forecast.forecastTimeUtc)} at{" "}
            {formatTime(forecast.forecastTimeUtc)}
          </p>
        </div>
        <div className="text-5xl">{getWeatherIcon(forecast.conditionCode)}</div>
      </div>

      <div className="mb-4">
        <div className="text-5xl font-bold text-gray-800 mb-2">
          {Math.round(forecast.airTemperature)}°C
        </div>
        <p className="text-lg text-gray-600 capitalize">
          {getConditionDescription(forecast.conditionCode)}
        </p>
        <p className="text-sm text-gray-500">
          Feels like {Math.round(forecast.feelsLikeTemperature)}°C
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-500">Wind</p>
          <p className="text-lg font-semibold text-gray-800">
            {forecast.windSpeed} m/s {getWindDirection(forecast.windDirection)}
          </p>
          <p className="text-xs text-gray-500">Gust: {forecast.windGust} m/s</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Humidity</p>
          <p className="text-lg font-semibold text-gray-800">
            {forecast.relativeHumidity}%
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Pressure</p>
          <p className="text-lg font-semibold text-gray-800">
            {forecast.seaLevelPressure} hPa
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Precipitation</p>
          <p className="text-lg font-semibold text-gray-800">
            {forecast.totalPrecipitation} mm
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Cloud Cover</p>
          <p className="text-lg font-semibold text-gray-800">
            {forecast.cloudCover}%
          </p>
        </div>
      </div>
    </div>
  );
}
