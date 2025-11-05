# Live Stock Advice Platform - Testing Checklist

## 🔧 Server & Connection

### Server Startup
- [ ] Server starts without errors: `npm start`
- [ ] Server shows storage mode (MEMORY/JSON/CSV)
- [ ] Server displays correct port (default: 3000)
- [ ] Can access admin panel: http://localhost:3000/admin
- [ ] Can access user view: http://localhost:3000
- [ ] Can access completed trades: http://localhost:3000/completed

### Admin Authentication
- [ ] Login with correct key (default: "changeme")
- [ ] Shows "Signed in" toast notification
- [ ] Admin console becomes visible
- [ ] Online counter shows correct count
- [ ] Invalid key shows error message
- [ ] Auto-login works after refresh (session storage)

---

## 📊 Admin Panel - Broadcasting Trades

### Category Selection (All 5 Categories)

#### 1. Stocks
- [ ] Select "Stocks" category
- [ ] Option Type (CE/PE) fields hidden
- [ ] Strike Price field hidden
- [ ] Select Trade Type (Scalping/Intraday/Swing/Positional)
- [ ] Select Order Side (BUY/SELL)
- [ ] Enter Symbol (e.g., RELIANCE)
- [ ] Select Order Type (Market/Limit)
- [ ] Enter Stop Loss (optional)
- [ ] Enter Take Profit (optional)
- [ ] Click "Broadcast"
- [ ] Trade appears in card view
- [ ] Trade appears in Current Trades table
- [ ] Trade appears in user view
- [ ] Format: `[Stocks] RELIANCE BUY @ Market | SL: ₹2450 | TP: ₹2600`

#### 2. Options
- [ ] Select "Options" category
- [ ] Option Type (CE/PE) fields visible
- [ ] Strike Price field visible
- [ ] Select Trade Type
- [ ] Select Order Side (BUY/SELL)
- [ ] Select Option Type (CE/PE)
- [ ] Enter Symbol
- [ ] Enter Strike Price
- [ ] Select Order Type
- [ ] Click "Broadcast"
- [ ] Format: `[Options] RELIANCE 2500 CE BUY @ Market | SL: ₹24 | TP: ₹28`

#### 3. Futures
- [ ] Select "Futures" category
- [ ] Option Type fields hidden
- [ ] Strike Price field hidden
- [ ] All other fields work correctly
- [ ] Format: `[Futures] NIFTY SELL @ ₹18500 | SL: ₹18600 | TP: ₹18300`

#### 4. Options Hedge
- [ ] Select "Options Hedge" category
- [ ] Scalping option is hidden
- [ ] Second option leg fields appear
- [ ] Enter first option details
- [ ] Enter Order Side 2 (BUY/SELL)
- [ ] Enter Option Type 2 (CE/PE)
- [ ] Enter Strike Price 2
- [ ] Click "Broadcast"
- [ ] Format: `[Options Hedge] NIFTY 18000 CE BUY + NIFTY 18500 CE SELL @ Market`

#### 5. F&O Hedge
- [ ] Select "F&O Hedge" category
- [ ] Scalping option is hidden
- [ ] Futures leg fields appear
- [ ] Enter option details
- [ ] Select Futures Side (BUY/SELL)
- [ ] Click "Broadcast"
- [ ] Format: `[Futures & Options Hedge] NIFTY 18000 CE BUY + NIFTY FUT SELL @ Market`

### Order Types
- [ ] Market Price: Shows "@ Market"
- [ ] Limit Price: Shows limit price field
- [ ] Limit Price: Shows "@ ₹[price]" in broadcast

### Symbol Search
- [ ] Typing shows dropdown with matches
- [ ] Clicking symbol fills input
- [ ] Dropdown closes on outside click
- [ ] Dropdown shows max 50 results
- [ ] Search is case-insensitive

---

## 📋 Current Trades Table

### Display
- [ ] Table shows when trades exist
- [ ] Shows "No active trades" when empty
- [ ] Columns: Checkbox, Time, Category, Type, Symbol, Details, Actions
- [ ] Time formatted correctly (DD MMM, HH:MM)
- [ ] Category badges color-coded correctly
  - [ ] Stocks = Yellow
  - [ ] Options = Blue
  - [ ] Futures = Purple
  - [ ] Options Hedge = Pink
  - [ ] F&O Hedge = Teal

### Actions (Per Trade)
- [ ] **Edit** button opens prompt
- [ ] Can modify trade text
- [ ] Changes reflected immediately
- [ ] **Profit** button opens prompt
- [ ] Enter profit price (e.g., 3000)
- [ ] Trade moves to Trade History
- [ ] Shows green border in history
- [ ] **Loss** button opens prompt
- [ ] Enter loss price
- [ ] Trade moves to Trade History
- [ ] Shows red border in history
- [ ] **Delete** button removes trade
- [ ] Deleted from all views

### Bulk Operations
- [ ] Header checkbox selects all
- [ ] Individual checkboxes work
- [ ] Indeterminate state works (some selected)
- [ ] Toolbar checkbox syncs with table
- [ ] **Delete selected** removes checked trades
- [ ] Shows toast if none selected
- [ ] **Delete all** button opens confirmation
- [ ] Type "DELETE" to confirm
- [ ] All current trades cleared

---

## 📊 Trade History Section

### Performance Statistics
- [ ] Total Trades count correct
- [ ] Winning Trades count correct (profit booked)
- [ ] Losing Trades count correct (loss booked)
- [ ] Accuracy percentage correct (winning/total * 100)
- [ ] Stats update in real-time
- [ ] Shows 0% accuracy when no trades

### Card Display
- [ ] Shows "No completed trades" when empty
- [ ] Cards appear when profit/loss booked
- [ ] Green left border for profit trades
- [ ] Red left border for loss trades
- [ ] Shows category badge
- [ ] Shows formatted timestamp with date
- [ ] Profit price in green: `₹3000`
- [ ] Loss price in red: `₹2500`
- [ ] Newest trades first (reversed order)

### Clear History
- [ ] **Clear History** button visible
- [ ] Click opens confirmation modal
- [ ] Shows count of trades to delete
- [ ] Type "DELETE" to confirm
- [ ] All history trades removed
- [ ] Stats reset to 0
- [ ] Shows "No history to clear" if empty

---

## 👥 User View (Audience)

### Live Trades Display
- [ ] Shows 3 sections: Scalping/Intraday, Swing, Positional
- [ ] Trades appear in correct section based on type
- [ ] Card layout matches admin style
- [ ] Real-time updates when admin broadcasts
- [ ] Shows colored chips (BUY=green, SELL=red, CE=blue, PE=orange)
- [ ] Completed trades disappear from view
- [ ] Shows "No messages yet" in empty sections

### Category Filter (Navbar)
- [ ] All button shows all categories
- [ ] Stocks button filters to stocks only
- [ ] Options button filters to options only
- [ ] Futures button filters to futures only
- [ ] Options Hedge button works
- [ ] F&O Hedge button works
- [ ] Active button highlighted
- [ ] Filtering happens instantly

### Connection Status
- [ ] "Connected" toast on page load
- [ ] "Disconnected" toast if server stops
- [ ] Reconnects automatically

---

## 📈 View Performance Page

### Performance Statistics
- [ ] Total Trades displays correctly
- [ ] Winning Trades count
- [ ] Losing Trades count
- [ ] Accuracy percentage

### Filters

#### Date Range Filter
- [ ] Date From input works
- [ ] Date To input works
- [ ] Apply button filters trades
- [ ] Clear button resets dates
- [ ] Stats recalculate after filter

#### Category Filter
- [ ] All button shows all
- [ ] Individual category buttons work
- [ ] Active button highlighted
- [ ] Stats recalculate

#### Trade Type Filter
- [ ] All, Scalping, Intraday, Swing, Positional buttons
- [ ] Filters work correctly
- [ ] Stats recalculate

#### Result Filter
- [ ] All, Profit, Loss buttons work
- [ ] Shows only matching trades
- [ ] Stats recalculate

### Trade Display
- [ ] Completed trades show in cards
- [ ] Profit trades have green border
- [ ] Loss trades have red border
- [ ] All chips display correctly
- [ ] Profit/Loss prices colored correctly

---

## 💾 Data Persistence

### Memory Mode (Default)
- [ ] Data lost on server restart
- [ ] Fast performance
- [ ] No file created

### JSON Mode
- [ ] Set `STORAGE=json`
- [ ] Creates `data/messages.json`
- [ ] Data persists after restart
- [ ] File updates on every change
- [ ] Loads on startup

### CSV Mode
- [ ] Set `STORAGE=csv`
- [ ] Creates `data/messages.csv`
- [ ] Columns: ID, Timestamp, Date, Time, Author, Category, Text
- [ ] Opens in Excel/Sheets
- [ ] Proper CSV escaping (commas, quotes)
- [ ] Data persists after restart

---

## 🎨 Theme & UI

### Theme Toggle
- [ ] Theme button in header
- [ ] Switches between dark/light
- [ ] Preference persists (localStorage)
- [ ] All colors adapt correctly
- [ ] Text remains readable

### Responsive Design
- [ ] Works on desktop
- [ ] Works on tablet
- [ ] Works on mobile
- [ ] Tables scroll horizontally if needed
- [ ] Buttons stack on small screens

---

## 🔌 Real-time Features

### Socket.IO
- [ ] Multiple users can connect
- [ ] Online counter updates
- [ ] All users see broadcasts instantly
- [ ] Updates propagate to all tabs
- [ ] Reconnection works after network loss

### Updates
- [ ] New trade appears everywhere
- [ ] Edit updates all views
- [ ] Delete removes from all views
- [ ] Profit/Loss booking moves to history
- [ ] Clear all works for all users

---

## 🐛 Error Handling

### Form Validation
- [ ] "Select trade type" if not selected
- [ ] "Select order side" if not selected
- [ ] "Select symbol" if empty
- [ ] "Select option type" only for options/hedges
- [ ] "Enter numeric strike" for invalid strike
- [ ] "Enter limit price" if limit order without price
- [ ] "Enter valid limit price" for non-numeric
- [ ] "Enter valid stop loss" for non-numeric
- [ ] "Enter valid take profit" for non-numeric

### Edge Cases
- [ ] Works with 0 trades
- [ ] Works with 200 trades (MAX_MESSAGES)
- [ ] Handles special characters in symbol
- [ ] Handles very long trade text (truncates at 2000)
- [ ] Handles rapid broadcasting
- [ ] Handles multiple deletes simultaneously

---

## 🧪 Test Scenarios

### Complete Trade Workflow
1. [ ] Admin broadcasts 5 different trades (all categories)
2. [ ] All appear in Current Trades table
3. [ ] All appear in user view
4. [ ] Book profit on 2 trades
5. [ ] Book loss on 1 trade
6. [ ] Trade History shows 3 trades
7. [ ] Stats show: 5 total, 2 winning, 1 losing, 40% accuracy
8. [ ] Current Trades shows 2 remaining
9. [ ] Delete 1 current trade
10. [ ] Clear Trade History
11. [ ] Stats reset to 0
12. [ ] User view shows remaining 1 trade

### Multi-User Test
1. [ ] Open admin in Browser 1
2. [ ] Open user view in Browser 2
3. [ ] Open user view in Browser 3
4. [ ] Broadcast from Browser 1
5. [ ] Verify appears in Browser 2 & 3 instantly
6. [ ] Book profit from Browser 1
7. [ ] Verify disappears from Browser 2 & 3

### Persistence Test (JSON/CSV)
1. [ ] Set storage mode
2. [ ] Broadcast 10 trades
3. [ ] Book profit on 3
4. [ ] Stop server
5. [ ] Check data file exists
6. [ ] Start server
7. [ ] Verify all 10 trades loaded
8. [ ] Verify 3 in history, 7 in current

---

## ✅ Test Result Summary

**Date Tested:** __________  
**Tester:** __________  
**Storage Mode:** __________  

**Total Tests:** __________  
**Passed:** __________  
**Failed:** __________  
**Accuracy:** __________%

### Critical Issues Found:
1. 
2. 
3. 

### Minor Issues Found:
1. 
2. 
3. 

### Notes:

