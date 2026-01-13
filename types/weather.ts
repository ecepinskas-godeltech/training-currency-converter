// Weather API response types based on api.meteo.lt documentation

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Place {
  code: string;
  name: string;
  administrativeDivision: string;
  country: string;
  countryCode: string;
  coordinates: Coordinates;
}

export type ConditionCode =
  | "clear"
  | "partly-cloudy"
  | "cloudy-with-sunny-intervals"
  | "cloudy"
  | "light-rain"
  | "rain"
  | "heavy-rain"
  | "thunder"
  | "isolated-thunderstorms"
  | "thunderstorms"
  | "heavy-rain-with-thunderstorms"
  | "light-sleet"
  | "sleet"
  | "freezing-rain"
  | "hail"
  | "light-snow"
  | "snow"
  | "heavy-snow"
  | "fog"
  | null;

export interface ForecastTimestamp {
  forecastTimeUtc: string;
  airTemperature: number;
  feelsLikeTemperature: number;
  windSpeed: number;
  windGust: number;
  windDirection: number;
  cloudCover: number;
  seaLevelPressure: number;
  relativeHumidity: number;
  totalPrecipitation: number;
  conditionCode: ConditionCode;
}

export interface WeatherForecast {
  place: Place;
  forecastType: string;
  forecastCreationTimeUtc: string;
  forecastTimestamps: ForecastTimestamp[];
}

export interface PlaceListItem {
  code: string;
  name: string;
  administrativeDivision: string;
  countryCode: string;
  coordinates: Coordinates;
}

// Local storage types
export interface SearchHistory {
  cityCode: string;
  cityName: string;
  timestamp: number;
}

// UI component props types
export interface WeatherCardProps {
  forecast: ForecastTimestamp;
  placeName: string;
  isToday?: boolean;
}

export interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading?: boolean;
}

export interface HistoryListProps {
  history: SearchHistory[];
  onSelect: (cityCode: string) => void;
  onClear: () => void;
}

export interface ForecastListProps {
  forecasts: ForecastTimestamp[];
  placeName: string;
}
