
# Market Data Setup Instructions

## Installation

1. Install the required axios dependency:
```bash
npm install axios
```

## Features Implemented

### 1. Real-time Market Data Ticker
- Fetches live data from Yahoo Finance API
- Shows: NIFTY 50, BANK NIFTY, and top stocks
- Updates every 30 seconds
- Displays:
  - Symbol name
  - Current price (₹)
  - Change percentage with arrows (▲/▼)
  - Green for positive, Red for negative
  - "(LTP)" indicator when market is closed

### 2. Category Filter in Navbar
- Filter trades by category in real-time
- Categories: All, Stocks, Options, Futures, Options Hedge, F&O Hedge
- Color-coded buttons with icons
- Sticky navigation

### 3. Scalping Removed from Hedge Categories
- Admin form automatically hides "Scalping" button
- When "Options Hedge" or "F&O Hedge" is selected
- Only shows: Intraday, Swing, Positional

### 4. Admin Delete Functionality
- Admin can delete individual trades (Delete button)
- Admin can delete multiple trades (Select + Delete Selected)
- Admin can clear all trades (Delete All)
- All delete operations are already implemented and working

## API Endpoint

### GET /api/market-data
Returns real-time market data for all symbols.

**Response format:**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "NIFTY 50",
      "price": "19450.25",
      "change": "125.50",
      "changePercent": "0.65",
      "isPositive": true,
      "marketState": "OPEN|CLOSED",
      "timestamp": 1699123456789
    }
  ]
}
```

## Market Data Features

### When Market is OPEN:
- Shows real-time prices
- Updates every 30 seconds
- No special indicator

### When Market is CLOSED:
- Shows Last Traded Price (LTP)
- Adds "(LTP)" label next to symbol name
- Shows previous day's closing data
- Change % shows difference from previous close

## Error Handling

- If API fails, shows fallback message
- Cached data prevents excessive API calls
- 30-second cache duration
- Automatic retry on next update cycle

## Stock Symbols in Ticker

1. NIFTY 50
2. BANK NIFTY
3. RELIANCE
4. TCS
5. INFY
6. HDFC BANK
7. ICICI BANK
8. SBI
9. BHARTI AIRTEL
10. ITC
11. KOTAK BANK
12. L&T
13. AXIS BANK
14. WIPRO
15. MARUTI

You can modify the list in `marketData.js` file.

## Usage

1. Start the server:
```bash
npm start
```

2. The ticker will automatically load on the index page
3. Market data updates every 30 seconds
4. Click category filters to filter trades
5. Admin can delete trades using Delete buttons

## Notes

- Yahoo Finance API is free and doesn't require API key
- Data is cached for 30 seconds to reduce API calls
- Falls back gracefully if API is unavailable
- Works in both market hours and after hours
=======
# Market Data Setup Instructions

## Installation

1. Install the required axios dependency:
```bash
npm install axios
```

## Features Implemented

### 1. Real-time Market Data Ticker
- Fetches live data from Yahoo Finance API
- Shows: NIFTY 50, BANK NIFTY, and top stocks
- Updates every 30 seconds
- Displays:
  - Symbol name
  - Current price (₹)
  - Change percentage with arrows (▲/▼)
  - Green for positive, Red for negative
  - "(LTP)" indicator when market is closed

### 2. Category Filter in Navbar
- Filter trades by category in real-time
- Categories: All, Stocks, Options, Futures, Options Hedge, F&O Hedge
- Color-coded buttons with icons
- Sticky navigation

### 3. Scalping Removed from Hedge Categories
- Admin form automatically hides "Scalping" button
- When "Options Hedge" or "F&O Hedge" is selected
- Only shows: Intraday, Swing, Positional

### 4. Admin Delete Functionality
- Admin can delete individual trades (Delete button)
- Admin can delete multiple trades (Select + Delete Selected)
- Admin can clear all trades (Delete All)
- All delete operations are already implemented and working

## API Endpoint

### GET /api/market-data
Returns real-time market data for all symbols.

**Response format:**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "NIFTY 50",
      "price": "19450.25",
      "change": "125.50",
      "changePercent": "0.65",
      "isPositive": true,
      "marketState": "OPEN|CLOSED",
      "timestamp": 1699123456789
    }
  ]
}
```

## Market Data Features

### When Market is OPEN:
- Shows real-time prices
- Updates every 30 seconds
- No special indicator

### When Market is CLOSED:
- Shows Last Traded Price (LTP)
- Adds "(LTP)" label next to symbol name
- Shows previous day's closing data
- Change % shows difference from previous close

## Error Handling

- If API fails, shows fallback message
- Cached data prevents excessive API calls
- 30-second cache duration
- Automatic retry on next update cycle

## Stock Symbols in Ticker

1. NIFTY 50
2. BANK NIFTY
3. RELIANCE
4. TCS
5. INFY
6. HDFC BANK
7. ICICI BANK
8. SBI
9. BHARTI AIRTEL
10. ITC
11. KOTAK BANK
12. L&T
13. AXIS BANK
14. WIPRO
15. MARUTI

You can modify the list in `marketData.js` file.

## Usage

1. Start the server:
```bash
npm start
```

2. The ticker will automatically load on the index page
3. Market data updates every 30 seconds
4. Click category filters to filter trades
5. Admin can delete trades using Delete buttons

## Notes

- Yahoo Finance API is free and doesn't require API key
- Data is cached for 30 seconds to reduce API calls
- Falls back gracefully if API is unavailable
- Works in both market hours and after hours

