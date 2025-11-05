
# Quick Test Guide - 5 Minutes

## Prerequisites
```bash
npm start
```

## Test 1: Basic Broadcasting (2 min)

### Stocks Trade
1. Open http://localhost:3000/admin
2. Login with key: `changeme`
3. Select: **Stocks** → **Intraday** → **BUY** → Enter `RELIANCE` → **Market**
4. Click **Broadcast**
5. ✅ Check: Trade appears in card AND table

### Options Trade
1. Select: **Options** → **Swing** → **SELL** → **PE**
2. Enter: Symbol `NIFTY`, Strike `18000`
3. Click **Broadcast**
4. ✅ Check: Both trades visible

## Test 2: Current Trades Table (1 min)

1. Find trade in **Current Trades** table
2. Click **Profit** button → Enter `3000`
3. ✅ Check: Trade disappears from table
4. ✅ Check: Trade appears in **Trade History** below with green border

## Test 3: Trade History Stats (1 min)

1. Book profit on another trade
2. Book loss on a third trade (enter `2500`)
3. ✅ Check Statistics:
   - Total Trades: 3
   - Winning: 2
   - Losing: 1
   - Accuracy: 67%

## Test 4: User View (1 min)

1. Open http://localhost:3000 in another tab
2. ✅ Check: Active trades visible
3. ✅ Check: Completed trades NOT visible
4. Click **Stocks** filter
5. ✅ Check: Only stocks trades shown

## Test 5: Clear Data

1. Back to admin
2. Click **Delete all** → Type `DELETE`
3. ✅ Check: Current trades cleared
4. Click **Clear History** → Type `DELETE`
5. ✅ Check: History cleared, stats = 0

---

## ✅ All Tests Pass?

**If YES:** System is working! 🎉

**If NO:** Check browser console (F12) for errors and refer to TESTING_CHECKLIST.md for detailed testing.

---

## Storage Persistence Test (Optional)

### Test JSON Storage:
```bash
$env:STORAGE="json"
npm start
```
1. Broadcast 3 trades
2. Stop server (Ctrl+C)
3. Check `data/messages.json` exists
4. Start server again
5. ✅ Trades should reload

### Test CSV Storage:
```bash
$env:STORAGE="csv"
npm start
```
1. Broadcast 3 trades
2. Open `data/messages.csv` in Excel
3. ✅ See formatted data with columns

---

## URLs Quick Reference

- **Admin Panel:** http://localhost:3000/admin
- **User View:** http://localhost:3000
- **Performance:** http://localhost:3000/completed
- **Admin Key:** `changeme`
=======
# Quick Test Guide - 5 Minutes

## Prerequisites
```bash
npm start
```

## Test 1: Basic Broadcasting (2 min)

### Stocks Trade
1. Open http://localhost:3000/admin
2. Login with key: `changeme`
3. Select: **Stocks** → **Intraday** → **BUY** → Enter `RELIANCE` → **Market**
4. Click **Broadcast**
5. ✅ Check: Trade appears in card AND table

### Options Trade
1. Select: **Options** → **Swing** → **SELL** → **PE**
2. Enter: Symbol `NIFTY`, Strike `18000`
3. Click **Broadcast**
4. ✅ Check: Both trades visible

## Test 2: Current Trades Table (1 min)

1. Find trade in **Current Trades** table
2. Click **Profit** button → Enter `3000`
3. ✅ Check: Trade disappears from table
4. ✅ Check: Trade appears in **Trade History** below with green border

## Test 3: Trade History Stats (1 min)

1. Book profit on another trade
2. Book loss on a third trade (enter `2500`)
3. ✅ Check Statistics:
   - Total Trades: 3
   - Winning: 2
   - Losing: 1
   - Accuracy: 67%

## Test 4: User View (1 min)

1. Open http://localhost:3000 in another tab
2. ✅ Check: Active trades visible
3. ✅ Check: Completed trades NOT visible
4. Click **Stocks** filter
5. ✅ Check: Only stocks trades shown

## Test 5: Clear Data

1. Back to admin
2. Click **Delete all** → Type `DELETE`
3. ✅ Check: Current trades cleared
4. Click **Clear History** → Type `DELETE`
5. ✅ Check: History cleared, stats = 0

---

## ✅ All Tests Pass?

**If YES:** System is working! 🎉

**If NO:** Check browser console (F12) for errors and refer to TESTING_CHECKLIST.md for detailed testing.

---

## Storage Persistence Test (Optional)

### Test JSON Storage:
```bash
$env:STORAGE="json"
npm start
```
1. Broadcast 3 trades
2. Stop server (Ctrl+C)
3. Check `data/messages.json` exists
4. Start server again
5. ✅ Trades should reload

### Test CSV Storage:
```bash
$env:STORAGE="csv"
npm start
```
1. Broadcast 3 trades
2. Open `data/messages.csv` in Excel
3. ✅ See formatted data with columns

---

## URLs Quick Reference

- **Admin Panel:** http://localhost:3000/admin
- **User View:** http://localhost:3000
- **Performance:** http://localhost:3000/completed
- **Admin Key:** `changeme`

