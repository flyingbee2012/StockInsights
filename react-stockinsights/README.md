# StockInsights React TypeScript

This is a React TypeScript conversion of the original StockInsights application. The application maintains the same functionality for analyzing stock price drops while using modern React patterns and TypeScript for better type safety.

## Features

- **Max Drop Analysis**: Find the maximum percentage drop from peak to valley
- **Longest Drop Analysis**: Find the longest duration drop period (either recovered or ongoing)
- **Interactive Stock Chart**: Visualize stock price movements with ApexCharts
- **Multiple Summary Panels**: Compare analysis results across different stocks and time periods
- **Stock Management**: Add and remove stocks dynamically
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **React 18** with TypeScript
- **ApexCharts** for data visualization
- **Bootstrap 5** for UI components
- **Modern Fetch API** for data requests
- **CSS Grid** for responsive layouts

## Project Structure

```
src/
├── components/           # React components
│   ├── StockChart.tsx   # ApexCharts integration
│   ├── SummaryPanel.tsx # Analysis results display
│   ├── ControlPanel.tsx # User controls
│   └── AddStockModal.tsx# Stock symbol picker
├── services/            # Business logic
│   ├── StockAnalyser.ts # Drop analysis calculations
│   └── ApiService.ts    # API communication
├── types/               # TypeScript interfaces
│   └── index.ts         # Type definitions
├── App.tsx              # Main application component
├── App.css              # Global styles
└── index.tsx            # Application entry point
```

## Installation

1. Navigate to the project directory:

   ```bash
   cd react-stockinsights
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## API Requirements

The application expects a backend API running on `localhost:3000` with the following endpoints:

- `GET /getdefaultlist` - Returns default stock symbols
- `GET /getsymbols` - Returns all available stock symbols
- `GET /:symbol` - Returns historical price data for a symbol
- `PUT /addstock?symbol=:symbol` - Adds a new stock symbol
- `PUT /deletestock?symbol=:symbol` - Removes a stock symbol

## Key Differences from Original

1. **Component Architecture**: Modular React components instead of monolithic JavaScript classes
2. **Type Safety**: Full TypeScript support with interfaces and type checking
3. **Modern Patterns**: React hooks, state management, and functional components
4. **No jQuery**: Pure React DOM manipulation
5. **Modern API**: Fetch API instead of jQuery AJAX
6. **Responsive Grid**: CSS Grid for better mobile support
7. **Error Handling**: Comprehensive error handling and loading states

## Development

To build for production:

```bash
npm run build
```

To run tests:

```bash
npm test
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

The application uses modern JavaScript features and requires ES6+ support.
