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

## Data Format Specification

### Expected Raw Data Format from API

The `GET /:symbol` endpoint must return data in this exact format:

```json
[
  "{\"Date\":\"12/2/2022\",\"Open\":20,\"High\":20.3799991607666,\"Low\":20,\"Close\":20.200000762939453,\"Volume\":1383500}",
  "{\"Date\":\"12/5/2022\",\"Open\":20.06999969482422,\"High\":20.100000381469727,\"Low\":19.899999618530273,\"Close\":19.93199920654297,\"Volume\":17900}",
  "{\"Date\":\"12/6/2022\",\"Open\":19.90999984741211,\"High\":19.975000381469727,\"Low\":19.84000015258789,\"Close\":19.91900062561035,\"Volume\":165200}",
  "{\"Date\":\"12/7/2022\",\"Open\":19.850000381469727,\"High\":19.940000534057617,\"Low\":19.799999237060547,\"Close\":19.86199951171875,\"Volume\":28900}",
  "{\"Date\":\"12/8/2022\",\"Open\":20.059999465942383,\"High\":20.059999465942383,\"Low\":19.979999542236328,\"Close\":20.027999877929688,\"Volume\":75600}"
]
```

**Format Requirements:**
- **Array of JSON Strings**: Each array element is a stringified JSON object
- **All Data Elements**: Every element contains actual price data (no header element)
- **Data Elements**: All elements should have consistent field structure
- **Required Fields**: Each data object must contain: `Date`, `Open`, `High`, `Low`, `Close`, `Volume`
- **Date Format**: MM/dd/yyyy string format
- **Price Fields**: Numeric values (can be integers or decimals)
- **Volume**: Integer representing trading volume

**Critical Notes:**
- The parser expects ALL data objects to have the same number of fields for consistency
- Missing fields will cause the entire data point to be skipped
- Date strings must be parseable by JavaScript's Date constructor  
- This format is parsed by `ApiService.convertRawDataToList()` method

⚠️ **For complete API documentation and format specifications, see [docs/API_DATA_FORMAT.md](docs/API_DATA_FORMAT.md)**

**Mock Data:** Reference implementation available at `src/data/mockApiData.json` for testing when API is unavailable.

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
