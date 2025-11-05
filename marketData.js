const axios = require('axios');

// NSE symbols for ticker
const tickerSymbols = [
  { symbol: "^NSEI", name: "NIFTY 50" },
  { symbol: "^NSEBANK", name: "BANK NIFTY" },
  { symbol: "RELIANCE.NS", name: "RELIANCE" },
  { symbol: "TCS.NS", name: "TCS" },
  { symbol: "INFY.NS", name: "INFY" },
  { symbol: "HDFCBANK.NS", name: "HDFC BANK" },
  { symbol: "ICICIBANK.NS", name: "ICICI BANK" },
  { symbol: "SBIN.NS", name: "SBI" },
  { symbol: "BHARTIARTL.NS", name: "BHARTI AIRTEL" },
  { symbol: "ITC.NS", name: "ITC" },
  { symbol: "KOTAKBANK.NS", name: "KOTAK BANK" },
  { symbol: "LT.NS", name: "L&T" },
  { symbol: "AXISBANK.NS", name: "AXIS BANK" },
  { symbol: "WIPRO.NS", name: "WIPRO" },
  { symbol: "MARUTI.NS", name: "MARUTI" }
];

// Cache for market data
let marketDataCache = null;
let lastUpdateTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

async function fetchMarketData() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (marketDataCache && (now - lastUpdateTime) < CACHE_DURATION) {
    return marketDataCache;
  }

  try {
    // Yahoo Finance API endpoint
    const symbols = tickerSymbols.map(s => s.symbol).join(',');
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const quotes = response.data?.quoteResponse?.result || [];
    
    const marketData = quotes.map(quote => {
      const symbolInfo = tickerSymbols.find(s => s.symbol === quote.symbol);
      const price = quote.regularMarketPrice || quote.postMarketPrice || 0;
      const prevClose = quote.regularMarketPreviousClose || price;
      const change = price - prevClose;
      const changePercent = prevClose !== 0 ? ((change / prevClose) * 100) : 0;
      
      // Check if market is open
      const marketState = quote.marketState || 'CLOSED';
      const isOpen = marketState === 'REGULAR' || marketState === 'PRE' || marketState === 'POST';

      return {
        symbol: symbolInfo?.name || quote.symbol,
        price: price.toFixed(2),
        change: change.toFixed(2),
        changePercent: changePercent.toFixed(2),
        isPositive: change >= 0,
        marketState: isOpen ? 'OPEN' : 'CLOSED',
        timestamp: Date.now()
      };
    });

    marketDataCache = marketData;
    lastUpdateTime = now;
    
    return marketData;
  } catch (error) {
    console.error('Error fetching market data:', error.message);
    
    // Return fallback data if API fails
    return tickerSymbols.map(item => ({
      symbol: item.name,
      price: '0.00',
      change: '0.00',
      changePercent: '0.00',
      isPositive: true,
      marketState: 'UNAVAILABLE',
      timestamp: Date.now()
    }));
  }
}

module.exports = { fetchMarketData, tickerSymbols };

