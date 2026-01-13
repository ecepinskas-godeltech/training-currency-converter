"use client";

import { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import WeatherCard from "@/components/WeatherCard";
import ForecastList from "@/components/ForecastList";
import HistoryList from "@/components/HistoryList";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "@/components/LoadingSpinner";
import { WeatherForecast, PlaceListItem, SearchHistory } from "@/types/weather";
import {
  getSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
} from "@/utils/storage";

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherForecast | null>(null);
  const [places, setPlaces] = useState<PlaceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SearchHistory[]>([]);

  // Load search history on mount
  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  // Fetch places list on mount
  useEffect(() => {
    async function fetchPlaces() {
      try {
        const response = await fetch("/api/places");
        if (response.ok) {
          const data = await response.json();
          setPlaces(data);
        }
      } catch (err) {
        console.error("Failed to fetch places:", err);
      }
    }
    fetchPlaces();
  }, []);

  const fetchWeather = async (cityName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Find matching place (case-insensitive)
      let placeCode: string;
      let placeName: string;

      const place = places.find(
        (p) => p.name.toLowerCase() === cityName.toLowerCase()
      );

      if (place) {
        // Use the matched place
        placeCode = place.code;
        placeName = place.name;
      } else {
        // If places not loaded yet or not found, try using city name directly as code
        placeCode = cityName.toLowerCase().trim();
        placeName = cityName;
      }

      const response = await fetch(`/api/weather/${placeCode}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError(
            `City "${cityName}" not found. Please enter a valid Lithuanian city name (e.g., Vilnius, Kaunas, Klaipėda).`
          );
        } else {
          setError("Failed to fetch weather data. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      const data: WeatherForecast = await response.json();
      setWeatherData(data);

      // Add to search history
      addToSearchHistory(data.place.code, data.place.name);
      setHistory(getSearchHistory());
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (cityName: string) => {
    fetchWeather(cityName);
  };

  const handleHistorySelect = async (cityCode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/weather/${cityCode}`);

      if (!response.ok) {
        setError("Failed to fetch weather data. Please try again.");
        setIsLoading(false);
        return;
      }

      const data: WeatherForecast = await response.json();
      setWeatherData(data);

      // Update history (moves to top)
      addToSearchHistory(data.place.code, data.place.name);
      setHistory(getSearchHistory());
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setHistory([]);
  };

  const currentWeather = weatherData?.forecastTimestamps[0];

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            🌤️ Weather Forecast
          </h1>
          <p className="text-lg text-gray-600">
            Get weather forecasts for Lithuanian cities
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          <HistoryList
            history={history}
            onSelect={handleHistorySelect}
            onClear={handleClearHistory}
          />
        </div>

        {/* Loading State */}
        {isLoading && <LoadingSpinner />}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex justify-center mb-8">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Weather Display */}
        {weatherData && !isLoading && !error && (
          <div className="space-y-8">
            {/* Current Weather */}
            {currentWeather && (
              <div className="flex justify-center">
                <div className="w-full max-w-2xl">
                  <WeatherCard
                    forecast={currentWeather}
                    placeName={weatherData.place.name}
                    isToday={true}
                  />
                </div>
              </div>
            )}

            {/* 5-Day Forecast */}
            {weatherData.forecastTimestamps.length > 1 && (
              <ForecastList
                forecasts={weatherData.forecastTimestamps}
                placeName={weatherData.place.name}
              />
            )}
          </div>
        )}

        {/* Initial State */}
        {!weatherData && !isLoading && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌍</div>
            <p className="text-xl text-gray-600">
              Search for a Lithuanian city to see the weather forecast
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Try: Vilnius, Kaunas, Klaipėda, Šiauliai, Panevėžys
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
