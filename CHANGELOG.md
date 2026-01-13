# Changelog

All notable changes to the Weather Forecast App will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-13

### Added

#### Core Features

- **City Search**: Search functionality for Lithuanian cities with input validation
- **Current Weather Display**: Real-time weather conditions with detailed metrics
  - Temperature (actual and "feels like")
  - Weather condition with emoji icons
  - Wind speed, direction, and gusts
  - Humidity percentage
  - Atmospheric pressure
  - Precipitation levels
  - Cloud cover percentage
- **5-Day Forecast**: Extended weather predictions for the next 5 days
  - Daily weather summaries
  - Temperature trends
  - Weather conditions with icons
  - Wind and precipitation data
- **Search History**: Automatic saving of last 3 searched cities
  - Quick access buttons for recent searches
  - Clear history functionality
  - Persistent storage using localStorage

#### Technical Implementation

- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for responsive styling
- API integration with Meteo.lt Weather API
- 1-hour caching for optimal performance
- Server-side API routes for weather data

#### Components

- `SearchBar`: City search input with validation
- `WeatherCard`: Current weather display
- `ForecastList`: 5-day forecast grid
- `HistoryList`: Recent searches display
- `ErrorMessage`: User-friendly error handling
- `LoadingSpinner`: Loading state indicator

#### Utilities

- `storage.ts`: LocalStorage management functions
- `weather.ts`: Weather data formatting and helper functions
  - Condition descriptions and icons
  - Wind direction conversion
  - Date/time formatting
  - Forecast grouping by day

#### Testing

- Jest + React Testing Library setup
- Unit tests for all components
- Utility function tests
- API route tests
- Test coverage reporting

#### Documentation

- Comprehensive README.md
- Setup instructions
- Feature documentation
- API documentation
- Testing guidelines

### Technical Details

#### API Endpoints

- `GET /api/places` - Fetch list of available cities
- `GET /api/weather/[placeCode]` - Fetch weather forecast for specific city

#### Error Handling

- Input validation with user feedback
- API error handling
- Network timeout handling
- Graceful degradation

#### Performance Optimizations

- Next.js revalidation (1-hour cache)
- Optimized component rendering
- Efficient state management

### Dependencies

- next: ^14.2.0
- react: ^18.3.0
- typescript: ^5.4.0
- tailwindcss: ^3.4.0
- jest: ^29.7.0
- @testing-library/react: ^14.2.0

---

## Future Enhancements (Planned)

### Version 1.1.0 (Potential)

- [ ] Hourly forecast view
- [ ] Weather alerts and warnings
- [ ] Temperature unit toggle (Celsius/Fahrenheit)
- [ ] Favorite cities feature
- [ ] Weather maps integration
- [ ] PWA support for offline access
- [ ] Dark mode theme
- [ ] Multi-language support
- [ ] Location-based auto-detection
- [ ] Weather comparison between cities

### Version 1.2.0 (Potential)

- [ ] Historical weather data
- [ ] Weather statistics and trends
- [ ] Export weather data
- [ ] Social sharing features
- [ ] Weather widgets
- [ ] Integration with other weather APIs
- [ ] Advanced filtering options
- [ ] Accessibility improvements

---

## Version History Summary

- **1.0.0** (2026-01-13): Initial release with core features, full testing suite, and documentation
