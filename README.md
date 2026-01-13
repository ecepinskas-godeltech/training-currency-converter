# Weather Forecast App

A modern, responsive weather forecast application built with Next.js, TypeScript, and Tailwind CSS. Get accurate weather forecasts for Lithuanian cities using the free Meteo.lt API.

## 🌟 Features

- **Real-time Weather Data**: Fetch current weather conditions for Lithuanian cities
- **5-Day Forecast**: View detailed weather predictions for the next 5 days
- **Search History**: Automatically saves your last 3 searched cities for quick access
- **Responsive Design**: Beautiful UI that works seamlessly on mobile and desktop
- **Type-Safe**: Built with TypeScript for robust, maintainable code
- **Fast & Efficient**: Implements 1-hour caching for optimal performance
- **Comprehensive Testing**: Full test coverage with Jest and React Testing Library

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm

### Installation

1. **Clone or navigate to the project directory**

```bash
cd 1-challenge
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the development server**

```bash
npm run dev
```

4. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
1-challenge/
├── app/                        # Next.js App Router
│   ├── api/                   # API routes
│   │   ├── places/           # Places list endpoint
│   │   └── weather/          # Weather data endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page
├── components/                # React components
│   ├── ErrorMessage.tsx      # Error display component
│   ├── ForecastList.tsx      # 5-day forecast display
│   ├── HistoryList.tsx       # Search history display
│   ├── LoadingSpinner.tsx    # Loading state component
│   ├── SearchBar.tsx         # City search input
│   └── WeatherCard.tsx       # Current weather display
├── types/                     # TypeScript type definitions
│   └── weather.ts            # Weather-related types
├── utils/                     # Utility functions
│   ├── storage.ts            # LocalStorage helpers
│   └── weather.ts            # Weather formatting helpers
├── __tests__/                 # Test files (co-located with source)
├── jest.config.js            # Jest configuration
├── jest.setup.js             # Jest setup file
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies
```

## 🧪 Testing

The project includes comprehensive unit tests for components, utilities, and API routes.

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage

- ✅ Component tests (SearchBar, WeatherCard, HistoryList)
- ✅ Utility function tests (storage, weather helpers)
- ✅ API route tests (places, weather endpoints)

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library
- **API**: Meteo.lt Weather API
- **State Management**: React Hooks

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## 🌐 API Integration

The application uses the free [Meteo.lt API](https://api.meteo.lt) to fetch weather data:

- **GET /api/places** - Fetches list of available Lithuanian cities
- **GET /api/weather/[placeCode]** - Fetches weather forecast for a specific city

All API calls are cached for 1 hour to optimize performance.

## 📱 Features in Detail

### Current Weather Display

- Temperature (actual and "feels like")
- Weather condition with emoji icons
- Wind speed and direction
- Humidity levels
- Atmospheric pressure
- Precipitation
- Cloud cover

### 5-Day Forecast

- Daily weather predictions
- Temperature trends
- Weather conditions
- Wind and precipitation data

### Search History

- Automatically saves last 3 searches
- Quick access to recently viewed cities
- Clear history option
- Persistent storage using localStorage

## 🎯 Error Handling

The application includes robust error handling:

- Invalid city name validation
- API error handling with user-friendly messages
- Network timeout handling
- Graceful degradation when services are unavailable

## 🔐 Security

- No API keys required (uses free, public API)
- Input validation to prevent malicious inputs
- Sanitized user inputs
- Secure localStorage implementation

## 🌍 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

Built as a technical challenge project

---

**Note**: This application uses the Lithuanian Meteorological Service API and is designed specifically for Lithuanian cities.
