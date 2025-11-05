const socket = io();

// Message data store
let messagesData = [];

// Elements
const consoleWrap = document.getElementById("console");
const alist = document.getElementById("alist"); // Optional legacy admin list; may be absent
const advMsg = document.getElementById("advMsg");
const advForm = document.getElementById("advForm");
const advSymbol = document.getElementById("advSymbol");
const symbolDropdown = document.getElementById("symbolDropdown");
const advStrike = document.getElementById("advStrike");
const advLimitPrice = document.getElementById("advLimitPrice");
const advStopLoss = document.getElementById("advStopLoss");
const advTakeProfit = document.getElementById("advTakeProfit");
const limitPriceLabel = document.getElementById("limitPriceLabel");
const btnStocks = document.getElementById("btnStocks");
const btnOptions = document.getElementById("btnOptions");
const btnFutures = document.getElementById("btnFutures");
const btnOptionsHedge = document.getElementById("btnOptionsHedge");
const btnFuturesOptionsHedge = document.getElementById("btnFuturesOptionsHedge");
const btnScalping = document.getElementById("btnScalping");
const btnIntraday = document.getElementById("btnIntraday");
const btnSwing = document.getElementById("btnSwing");
const btnPositional = document.getElementById("btnPositional");
const btnBuy2 = document.getElementById("btnBuy2");
const btnSell2 = document.getElementById("btnSell2");
const btnCE2 = document.getElementById("btnCE2");
const btnPE2 = document.getElementById("btnPE2");
const btnFuturesBuy = document.getElementById("btnFuturesBuy");
const btnFuturesSell = document.getElementById("btnFuturesSell");
const advStrike2 = document.getElementById("advStrike2");
const optionTypeLabel = document.getElementById("optionTypeLabel");
const strikePriceLabel = document.getElementById("strikePriceLabel");
const symbolLabel = document.getElementById("symbolLabel");
const optionsHedgeFields = document.getElementById("optionsHedgeFields");
const foHedgeFields = document.getElementById("foHedgeFields");
const btnBuy = document.getElementById("btnBuy");
const btnSell = document.getElementById("btnSell");
const btnCE = document.getElementById("btnCE");
const btnPE = document.getElementById("btnPE");
const btnMarket = document.getElementById("btnMarket");
const btnLimit = document.getElementById("btnLimit");
const loginPanel = document.getElementById("loginPanel");
const loginForm = document.getElementById("loginForm");
const loginKey = document.getElementById("loginKey");
const loginMsg = document.getElementById("loginMsg");
const toastWrap = document.getElementById("toastWrap");
const online = document.getElementById("online");
const chkSelectAll = document.getElementById("chkSelectAll");
const btnDeleteSelected = document.getElementById("btnDeleteSelected");
const btnClearAll = document.getElementById("btnClearAll");
// Modal elements
const confirmModal = document.getElementById("confirmModal");
const confirmText = document.getElementById("confirmText");
const confirmInput = document.getElementById("confirmInput");
const confirmOk = document.getElementById("confirmOk");
const confirmCancel = document.getElementById("confirmCancel");

// Connection indicators
socket.on("connect", () => { toast("Connected"); try { if (advMsg) advMsg.textContent = "Connected"; } catch (_) {} });
socket.on("disconnect", () => { toast("Disconnected — check server"); try { if (advMsg) advMsg.textContent = "Disconnected — check server"; } catch (_) {} });

// Online count (admin only UI)
socket.on("server:info", (info) => {
  if (online && info && typeof info.online === "number") {
    online.textContent = `Online: ${info.online}`;
  }
});

// Auth flow
if (loginForm) loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const key = (loginKey?.value || "").toString();
  if (!key) { if (loginMsg) loginMsg.textContent = "Enter admin key"; return; }
  if (loginMsg) loginMsg.textContent = "Signing in...";
  sessionStorage.setItem("adminKey", key);
  socket.emit("admin:login", key);
});

socket.on("auth:ok", () => {
  loginMsg.textContent = "";
  loginPanel.classList.add("hidden");
  consoleWrap.classList.remove("hidden");
  toast("Signed in");
});

socket.on("auth:failed", () => {
  consoleWrap.classList.add("hidden");
  loginPanel.classList.remove("hidden");
  loginMsg.textContent = "Invalid key. Try again.";
  toast("Auth failed");
});

// Try auto-login if stored
(function tryAutoLogin(){
  const cached = sessionStorage.getItem("adminKey");
  if (cached) socket.emit("admin:login", cached);
})();

// Data events
socket.on("advice:init", (items) => {
  if (Array.isArray(items)) {
    messagesData = items || [];
    if (alist) renderAdminList(items);
    renderTradeTable();
  }
});

socket.on("advice", (msg) => {
  messagesData.unshift(msg);
  if (alist) addAdminItem(msg);
  renderTradeTable();
  try { if (advMsg) advMsg.textContent = "Broadcast delivered"; } catch (_) {}
});

socket.on("advice:delete", (data) => {
  if (!data || data.id == null) return;
  messagesData = messagesData.filter(m => m.id !== data.id);
  if (alist) {
    const el = alist.querySelector(`[data-id="${data.id}"]`);
    if (el) el.remove();
  }
  renderTradeTable();
});

socket.on("advice:clear", () => {
  messagesData = [];
  if (alist) alist.innerHTML = "";
  if (chkSelectAll) chkSelectAll.checked = false;
  renderTradeTable();
  if (chkSelectAllCurrentTable) chkSelectAllCurrentTable.checked = false;
  if (chkSelectAllCurrent) chkSelectAllCurrent.checked = false;
  if (chkSelectAllHistoryTable) chkSelectAllHistoryTable.checked = false;
  if (chkSelectAllHistory) chkSelectAllHistory.checked = false;
});

// Mass actions
if (chkSelectAll && alist) chkSelectAll.addEventListener("change", (e) => {
  const on = chkSelectAll.checked;
  alist.querySelectorAll('.sel').forEach((cb) => { cb.checked = on; });
});
if (btnDeleteSelected && alist) btnDeleteSelected.addEventListener("click", () => {
  const ids = Array.from(alist.querySelectorAll('.sel:checked'))
    .map((cb) => Number(cb.closest('.card')?.getAttribute('data-id')))
    .filter((n) => Number.isFinite(n));
  if (!ids.length) { toast("No items selected"); return; }
  socket.emit("admin:deleteMany", ids);
});
if (btnClearAll) btnClearAll.addEventListener("click", () => {
  openConfirmModal({
    text: "Delete all messages? This cannot be undone.",
    onConfirm: () => socket.emit("admin:clear"),
  });
});

// Symbol list
const symbols = [
  "AARTIIND", "ABB", "ABBOTINDIA", "ABCAPITAL", "ABFRL", "ACC", "ADANIENT", "ADANIPORTS",
  "ALKEM", "AMARAJABAT", "AMBUJACEM", "APOLLOHOSP", "APOLLOTYRE", "ASHOKLEY", "ASIANPAINT",
  "ASTRAL", "ATUL", "AUBANK", "AUROPHARMA", "AXISBANK", "BAJAJ-AUTO", "BAJAJFINSV", "BAJFINANCE",
  "BALKRISIND", "BALRAMCHIN", "BANDHANBNK", "BANKBARODA", "BANK NIFTY", "BATAINDIA", "BEL",
  "BERGEPAINT", "BHARATFORG", "BHARTIARTL", "BHEL", "BIOCON", "BOSCHLTD", "BPCL", "BRITANNIA",
  "BSOFT", "CANBK", "CANFINHOME", "CHAMBLFERT", "CHOLAFIN", "CIPLA", "COALINDIA", "COFORGE",
  "COLPAL", "CONCOR", "COROMANDEL", "CROMPTON", "CUB", "CUMMINSIND", "DABUR", "DALBHARAT",
  "DEEPAKNTR", "DELTACORP", "DIVISLAB", "DIXON", "DLF", "DRREDDY", "EICHERMOT", "ESCORTS",
  "EXIDEIND", "FEDERALBNK", "FINNIFTY", "FSL", "GAIL", "GLENMARK", "GMRINFRA", "GNFC",
  "GODREJCP", "GODREJPROP", "GRANULES", "GRASIM", "GSPL", "GUJGASLTD", "HAL", "HAVELLS",
  "HCLTECH", "HDFC", "HDFCAMC", "HDFCBANK", "HDFCLIFE", "HEROMOTOCO", "HINDALCO", "HINDCOPPER",
  "HINDPETRO", "HINDUNILVR", "HONAUT", "IBULHSGFIN", "ICICIBANK", "ICICIGI", "ICICIPRULI",
  "IDEA", "IDFC", "IDFCFIRSTB", "IEX", "IGL", "INDHOTEL", "INDIACEM", "INDIAMART", "INDIGO",
  "INDUSINDBK", "INDUSTOWER", "INFY", "INTELLECT", "IOC", "IPCALAB", "IRCTC", "ITC",
  "JINDALSTEL", "JKCEMENT", "JSWSTEEL", "JUBLFOOD", "KOTAKBANK", "L&TFH", "LALPATHLAB",
  "LAURUSLABS", "LICHSGFIN", "LT", "LTI", "LTTS", "LUPIN", "M&M", "M&MFIN", "MANAPPURAM",
  "MARICO", "MARUTI", "MCDOWELL-N", "MCX", "METROPOLIS", "MFSL", "MGL", "MIDCAP NIFTY",
  "MINDTREE", "MOTHERSON", "MPHASIS", "MRF", "MUTHOOTFIN", "NATIONALUM", "NAUKRI", "NAVINFLUOR",
  "NESTLEIND", "NIFTY", "NMDC", "NTPC", "OBEROIRLTY", "OFSS", "ONGC", "PAGEIND", "PEL",
  "PERSISTENT", "PETRONET", "PFC", "PIDILITIND", "PIIND", "PNB", "POLYCAB", "POWERGRID",
  "PVR", "RAIN", "RAMCOCEM", "RBLBANK", "RECLTD", "RELIANCE", "SAIL", "SBICARD", "SBILIFE",
  "SBIN", "SHREECEM", "SIEMENS", "SRF", "SRTRANSFIN", "SUNPHARMA", "SUNTV", "SYNGENE",
  "TATACHEM", "TATACOMM", "TATACONSUM", "TATAMOTORS", "TATAPOWER", "TATASTEEL", "TCS", "TECHM",
  "TITAN", "TORNTPHARM", "TORNTPOWER", "TRENT", "TVSMOTOR", "UBL", "ULTRACEMCO", "UPL", "VEDL",
  "VOLTAS", "WHIRLPOOL", "WIPRO", "ZEEL", "ZYDUSLIFE"
];

let selectedSymbol = "";

// Symbol search functionality
if (advSymbol && symbolDropdown) {
  advSymbol.addEventListener("input", (e) => {
    const search = e.target.value.toUpperCase().trim();
    if (!search) {
      symbolDropdown.classList.add("hidden");
      return;
    }
    const filtered = symbols.filter(s => s.includes(search));
    if (filtered.length === 0) {
      symbolDropdown.classList.add("hidden");
      return;
    }
    symbolDropdown.innerHTML = filtered.slice(0, 50).map(s => 
      `<div class="symbol-item" data-symbol="${s}">${s}</div>`
    ).join("");
    symbolDropdown.classList.remove("hidden");
    
    // Add click handlers
    symbolDropdown.querySelectorAll(".symbol-item").forEach(item => {
      item.addEventListener("click", () => {
        selectedSymbol = item.getAttribute("data-symbol");
        advSymbol.value = selectedSymbol;
        symbolDropdown.classList.add("hidden");
      });
    });
  });
  
  advSymbol.addEventListener("focus", () => {
    if (advSymbol.value.trim()) {
      advSymbol.dispatchEvent(new Event("input"));
    }
  });
  
  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!advSymbol.contains(e.target) && !symbolDropdown.contains(e.target)) {
      symbolDropdown.classList.add("hidden");
    }
  });
}

// Button toggle handlers
let selectedCategory = "options"; // Default to options
let selectedTradeType = null;
let selectedSide = null;
let selectedType = null;
let selectedOrderType = "MARKET"; // Default to Market
let selectedSide2 = null;
let selectedType2 = null;
let selectedFuturesSide = null;

// Set defaults on load
if (btnMarket) {
  btnMarket.classList.add("active");
}
if (btnOptions) {
  btnOptions.classList.add("active");
}

// Initialize form fields for default category
updateFormFields();

// Category buttons
const categoryButtons = [btnStocks, btnOptions, btnFutures, btnOptionsHedge, btnFuturesOptionsHedge];

function updateTradeTypeButtons() {
  const isHedge = selectedCategory === "options-hedge" || selectedCategory === "futures-options-hedge";
  if (btnScalping) {
    btnScalping.style.display = isHedge ? "none" : "";
    if (isHedge && selectedTradeType === "Scalping Trade") {
      selectedTradeType = null;
      btnScalping.classList.remove("active");
    }
  }
}

function updateFormFields() {
  // Hide all special fields first
  if (optionsHedgeFields) optionsHedgeFields.style.display = "none";
  if (foHedgeFields) foHedgeFields.style.display = "none";
  
  // Show/hide fields based on category
  switch(selectedCategory) {
    case "stocks":
      // Stocks: Hide Option Type and Strike Price
      if (optionTypeLabel) optionTypeLabel.style.display = "none";
      if (strikePriceLabel) strikePriceLabel.style.display = "none";
      if (symbolLabel) symbolLabel.style.display = "grid";
      break;
      
    case "futures":
      // Futures: Hide Option Type and Strike Price
      if (optionTypeLabel) optionTypeLabel.style.display = "none";
      if (strikePriceLabel) strikePriceLabel.style.display = "none";
      if (symbolLabel) symbolLabel.style.display = "grid";
      break;
      
    case "options":
      // Options: Show all fields
      if (optionTypeLabel) optionTypeLabel.style.display = "grid";
      if (strikePriceLabel) strikePriceLabel.style.display = "grid";
      if (symbolLabel) symbolLabel.style.display = "grid";
      break;
      
    case "options-hedge":
      // Options Hedge: Show second option fields
      if (optionTypeLabel) optionTypeLabel.style.display = "grid";
      if (strikePriceLabel) strikePriceLabel.style.display = "grid";
      if (symbolLabel) symbolLabel.style.display = "grid";
      if (optionsHedgeFields) optionsHedgeFields.style.display = "block";
      break;
      
    case "futures-options-hedge":
      // F&O Hedge: Show option fields + futures leg
      if (optionTypeLabel) optionTypeLabel.style.display = "grid";
      if (strikePriceLabel) strikePriceLabel.style.display = "grid";
      if (symbolLabel) symbolLabel.style.display = "grid";
      if (foHedgeFields) foHedgeFields.style.display = "block";
      break;
  }
  
  updateTradeTypeButtons();
}

if (btnStocks) btnStocks.addEventListener("click", () => {
  selectedCategory = "stocks";
  categoryButtons.forEach(btn => btn?.classList.remove("active"));
  btnStocks.classList.add("active");
  updateFormFields();
});
if (btnOptions) btnOptions.addEventListener("click", () => {
  selectedCategory = "options";
  categoryButtons.forEach(btn => btn?.classList.remove("active"));
  btnOptions.classList.add("active");
  updateFormFields();
});
if (btnFutures) btnFutures.addEventListener("click", () => {
  selectedCategory = "futures";
  categoryButtons.forEach(btn => btn?.classList.remove("active"));
  btnFutures.classList.add("active");
  updateFormFields();
});
if (btnOptionsHedge) btnOptionsHedge.addEventListener("click", () => {
  selectedCategory = "options-hedge";
  categoryButtons.forEach(btn => btn?.classList.remove("active"));
  btnOptionsHedge.classList.add("active");
  updateFormFields();
});
if (btnFuturesOptionsHedge) btnFuturesOptionsHedge.addEventListener("click", () => {
  selectedCategory = "futures-options-hedge";
  categoryButtons.forEach(btn => btn?.classList.remove("active"));
  btnFuturesOptionsHedge.classList.add("active");
  updateFormFields();
});

// Trade Type buttons
const tradeTypeButtons = [btnScalping, btnIntraday, btnSwing, btnPositional];
if (btnScalping) btnScalping.addEventListener("click", () => {
  selectedTradeType = "Scalping Trade";
  tradeTypeButtons.forEach(btn => btn?.classList.remove("active"));
  btnScalping.classList.add("active");
});
if (btnIntraday) btnIntraday.addEventListener("click", () => {
  selectedTradeType = "Intraday Trade";
  tradeTypeButtons.forEach(btn => btn?.classList.remove("active"));
  btnIntraday.classList.add("active");
});
if (btnSwing) btnSwing.addEventListener("click", () => {
  selectedTradeType = "Swing Trade";
  tradeTypeButtons.forEach(btn => btn?.classList.remove("active"));
  btnSwing.classList.add("active");
});
if (btnPositional) btnPositional.addEventListener("click", () => {
  selectedTradeType = "Positional Trade";
  tradeTypeButtons.forEach(btn => btn?.classList.remove("active"));
  btnPositional.classList.add("active");
});

if (btnBuy) btnBuy.addEventListener("click", () => {
  selectedSide = "BUY";
  btnBuy.classList.add("active");
  btnSell.classList.remove("active");
});

if (btnSell) btnSell.addEventListener("click", () => {
  selectedSide = "SELL";
  btnSell.classList.add("active");
  btnBuy.classList.remove("active");
});

if (btnCE) btnCE.addEventListener("click", () => {
  selectedType = "CE";
  btnCE.classList.add("active");
  btnPE.classList.remove("active");
});

if (btnPE) btnPE.addEventListener("click", () => {
  selectedType = "PE";
  btnPE.classList.add("active");
  btnCE.classList.remove("active");
});

// Options Hedge - Second leg buttons
if (btnBuy2) btnBuy2.addEventListener("click", () => {
  selectedSide2 = "BUY";
  btnBuy2.classList.add("active");
  btnSell2.classList.remove("active");
});
if (btnSell2) btnSell2.addEventListener("click", () => {
  selectedSide2 = "SELL";
  btnSell2.classList.add("active");
  btnBuy2.classList.remove("active");
});
if (btnCE2) btnCE2.addEventListener("click", () => {
  selectedType2 = "CE";
  btnCE2.classList.add("active");
  btnPE2.classList.remove("active");
});
if (btnPE2) btnPE2.addEventListener("click", () => {
  selectedType2 = "PE";
  btnPE2.classList.add("active");
  btnCE2.classList.remove("active");
});

// F&O Hedge - Futures leg buttons
if (btnFuturesBuy) btnFuturesBuy.addEventListener("click", () => {
  selectedFuturesSide = "BUY";
  btnFuturesBuy.classList.add("active");
  btnFuturesSell.classList.remove("active");
});
if (btnFuturesSell) btnFuturesSell.addEventListener("click", () => {
  selectedFuturesSide = "SELL";
  btnFuturesSell.classList.add("active");
  btnFuturesBuy.classList.remove("active");
});

if (btnMarket) btnMarket.addEventListener("click", () => {
  selectedOrderType = "MARKET";
  btnMarket.classList.add("active");
  btnLimit.classList.remove("active");
  if (limitPriceLabel) limitPriceLabel.style.display = "none";
  if (advLimitPrice) advLimitPrice.value = "";
});

if (btnLimit) btnLimit.addEventListener("click", () => {
  selectedOrderType = "LIMIT";
  btnLimit.classList.add("active");
  btnMarket.classList.remove("active");
  if (limitPriceLabel) limitPriceLabel.style.display = "grid";
});

// Broadcast form submission
advForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const symbol = (advSymbol.value || "").toString().trim().toUpperCase();
  const strikeRaw = advStrike.value.toString().trim();
  const limitPrice = advLimitPrice.value.toString().trim();
  const stopLoss = advStopLoss.value.toString().trim();
  const takeProfit = advTakeProfit.value.toString().trim();
  
  if (!selectedTradeType) { advMsg.textContent = "Select trade type"; return; }
  if (!selectedSide) { advMsg.textContent = "Select order side (BUY/SELL)"; return; }
  if (!symbol) { advMsg.textContent = "Select symbol"; return; }
  
  // Validate option type and strike only for categories that need them
  if (selectedCategory === "options" || selectedCategory === "options-hedge" || selectedCategory === "futures-options-hedge") {
    if (!selectedType) { advMsg.textContent = "Select option type (CE/PE)"; return; }
    if (!/^\d+(?:\.\d+)?$/.test(strikeRaw)) { advMsg.textContent = "Enter numeric strike"; return; }
  }
  
  if (!selectedOrderType) { advMsg.textContent = "Select order type (Market/Limit)"; return; }
  if (selectedOrderType === "LIMIT" && !limitPrice) { advMsg.textContent = "Enter limit price"; return; }
  if (selectedOrderType === "LIMIT" && limitPrice && !/^\d+(?:\.\d+)?$/.test(limitPrice)) { advMsg.textContent = "Enter valid limit price"; return; }
  if (stopLoss && !/^\d+(?:\.\d+)?$/.test(stopLoss)) { advMsg.textContent = "Enter valid stop loss"; return; }
  if (takeProfit && !/^\d+(?:\.\d+)?$/.test(takeProfit)) { advMsg.textContent = "Enter valid take profit"; return; }
  
  const author = selectedTradeType;
  const categoryLabel = getCategoryLabel(selectedCategory);
  let text = "";
  
  // Build text based on category
  switch(selectedCategory) {
    case "stocks":
    case "futures":
      // Stocks/Futures: Symbol + Side
      text = `[${categoryLabel}] ${symbol} ${selectedSide}`;
      break;
      
    case "options":
      // Options: Symbol + Strike + Type + Side
      if (!selectedType) { advMsg.textContent = "Select option type"; return; }
      text = `[${categoryLabel}] ${symbol} ${strikeRaw} ${selectedType} ${selectedSide}`;
      break;
      
    case "options-hedge":
      // Options Hedge: Two option legs
      if (!selectedType) { advMsg.textContent = "Select option type"; return; }
      const strike2Raw = advStrike2.value.toString().trim();
      if (!/^\d+(?:\.\d+)?$/.test(strike2Raw)) { advMsg.textContent = "Enter numeric strike 2"; return; }
      if (!selectedSide2) { advMsg.textContent = "Select order side 2"; return; }
      if (!selectedType2) { advMsg.textContent = "Select option type 2"; return; }
      text = `[${categoryLabel}] ${symbol} ${strikeRaw} ${selectedType} ${selectedSide} + ${symbol} ${strike2Raw} ${selectedType2} ${selectedSide2}`;
      break;
      
    case "futures-options-hedge":
      // F&O Hedge: Option + Futures
      if (!selectedType) { advMsg.textContent = "Select option type"; return; }
      if (!selectedFuturesSide) { advMsg.textContent = "Select futures side"; return; }
      text = `[${categoryLabel}] ${symbol} ${strikeRaw} ${selectedType} ${selectedSide} + ${symbol} FUT ${selectedFuturesSide}`;
      break;
  }
  
  // Add order type and price
  if (selectedOrderType === "MARKET") {
    text += " @ Market";
  } else if (selectedOrderType === "LIMIT" && limitPrice) {
    text += ` @ ₹${limitPrice}`;
  }
  
  // Add stop loss and take profit if provided
  if (stopLoss) text += ` | SL: ₹${stopLoss}`;
  if (takeProfit) text += ` | TP: ₹${takeProfit}`;
  
  socket.emit("admin:advice", { author, text: text.slice(0, 2000) });
  
  // Reset form
  advSymbol.value = "";
  advStrike.value = "";
  advLimitPrice.value = "";
  advStopLoss.value = "";
  advTakeProfit.value = "";
  selectedSymbol = "";
  categoryButtons.forEach(btn => btn?.classList.remove("active"));
  btnOptions.classList.add("active"); // Reset to Options default
  tradeTypeButtons.forEach(btn => btn?.classList.remove("active"));
  btnBuy.classList.remove("active");
  btnSell.classList.remove("active");
  btnCE.classList.remove("active");
  btnPE.classList.remove("active");
  btnLimit.classList.remove("active");
  btnMarket.classList.add("active"); // Reset to Market default
  if (limitPriceLabel) limitPriceLabel.style.display = "none";
  selectedCategory = "options"; // Reset to Options default
  selectedTradeType = null;
  selectedSide = null;
  selectedType = null;
  selectedOrderType = "MARKET"; // Reset to Market default
  
  advMsg.textContent = "Broadcast sent";
  toast("Broadcast sent");
});

function renderAdminList(items) {
  if (!alist) return;
  alist.innerHTML = "";
  for (const m of items.slice().reverse()) addAdminItem(m);
}

function addAdminItem(m) {
  if (!alist || !m || !m.text) return;
  const item = document.createElement("div");
  item.className = "card";
  item.setAttribute("data-id", String(m.id));
  const when = m.ts ? new Date(m.ts).toLocaleTimeString() : "";
  const tokens = (m.text || "").trim().split(/\s+/);
  const symbol = tokens[0] || "";
  const strike = tokens[1] || "";
  const optType = tokens[2] || "";
  const side = tokens[3] || "";
  const sideClass = side.toUpperCase() === 'BUY' ? 'buy' : side.toUpperCase() === 'SELL' ? 'sell' : '';
  const optClass = optType.toUpperCase() === 'CE' ? 'ce' : optType.toUpperCase() === 'PE' ? 'pe' : '';
  
  // Check if trade is completed
  const isCompleted = (m.text || "").includes("| Booked Profit is") || (m.text || "").includes("| Book Loss is");
  const isProfit = (m.text || "").includes("| Booked Profit is");
  const isLoss = (m.text || "").includes("| Book Loss is");
  
  if (sideClass === 'buy') item.classList.add('is-buy');
  if (sideClass === 'sell') item.classList.add('is-sell');
  
  // Add background color for completed trades
  if (isProfit) {
    item.classList.add('is-profit');
  } else if (isLoss) {
    item.classList.add('is-loss');
  }
  item.innerHTML = `
    <div class="meta">
      <span class="badge">${escapeHtml(m.author || "Admin")}</span>
      <span>${when}</span>
    </div>
    <div class="chips">
      ${symbol ? `<span class="chip">${escapeHtml(symbol)}</span>` : ''}
      ${strike ? `<span class="chip">${escapeHtml(strike)}</span>` : ''}
      ${optType ? `<span class="chip ${optClass}">${escapeHtml(optType)}</span>` : ''}
      ${side ? `<span class="chip ${sideClass}">${escapeHtml(side)}</span>` : ''}
    </div>
    <div class="text">${colorizeBookedPrice(linkify(escapeHtml(m.text || "")))}</div>
    <div style="margin-top:8px; display:flex; gap:8px; align-items:center;">
      <label style="display:inline-flex; gap:6px; align-items:center; font-size:12px; color:var(--muted);">
        <input type="checkbox" class="sel" /> Select
      </label>
      <button class="btn" data-action="edit">Edit</button>
      <button class="btn" data-action="book-profit" style="background-color: #10b981; color: white;">Book Profit</button>
      <button class="btn" data-action="book-loss" style="background-color: #ef4444; color: white;">Book Loss</button>
      <button class="btn btn-danger" data-action="delete">Delete</button>
    </div>
  `;
  item.querySelector('[data-action="delete"]').addEventListener("click", () => {
    const id = m.id;
    if (id != null) socket.emit("admin:delete", id);
  });
  item.querySelector('[data-action="edit"]').addEventListener("click", () => {
    const id = m.id;
    const current = m.text || "";
    const next = prompt("Edit message text", current);
    if (next && next.trim()) {
      socket.emit("admin:edit", { id, text: next.trim().slice(0, 2000) });
    }
  });
  item.querySelector('[data-action="book-profit"]').addEventListener("click", () => {
    const id = m.id;
    const current = m.text || "";
    // Check if already booked to prevent duplicates
    if (current.includes("| Booked Profit is") || current.includes("| Book Loss is")) {
      toast("Trade already booked");
      return;
    }
    const price = prompt("Enter profit booked price:", "");
    if (price === null) return; // User cancelled
    if (!price.trim()) {
      toast("Please enter a price");
      return;
    }
    const updatedText = `${current} | Booked Profit is ${price.trim()}`;
    socket.emit("admin:edit", { id, text: updatedText.slice(0, 2000) });
    toast("Profit booked");
  });
  item.querySelector('[data-action="book-loss"]').addEventListener("click", () => {
    const id = m.id;
    const current = m.text || "";
    // Check if already booked to prevent duplicates
    if (current.includes("| Booked Profit is") || current.includes("| Book Loss is")) {
      toast("Trade already booked");
      return;
    }
    const price = prompt("Enter loss booked price:", "");
    if (price === null) return; // User cancelled
    if (!price.trim()) {
      toast("Please enter a price");
      return;
    }
    const updatedText = `${current} | Book Loss is ${price.trim()}`;
    socket.emit("admin:edit", { id, text: updatedText.slice(0, 2000) });
    toast("Loss booked");
  });
  
  // Add to list (hide completed trades)
  if (!isCompleted) {
    alist.prepend(item);
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll(/&/g, "&amp;")
    .replaceAll(/</g, "&lt;")
    .replaceAll(/>/g, "&gt;")
    .replaceAll(/\"/g, "&quot;")
    .replaceAll(/'/g, "&#039;");
}

function linkify(str) {
  return str.replace(/(https?:\/\/[^\s]+)/g, '<a href=\"$1\" target=\"_blank\" rel=\"noopener\">$1<\/a>');
}

function colorizeBookedPrice(str) {
  // Color the profit price in green
  str = str.replace(/\| Booked Profit is (\S+)/g, '| Booked Profit is <span class="profit-price">₹$1</span>');
  // Color the loss price in red
  str = str.replace(/\| Book Loss is (\S+)/g, '| Book Loss is <span class="loss-price">₹$1</span>');
  return str;
}

// Advice update handler (admin list)
socket.on("advice:update", (m) => {
  if (!m || m.id == null) return;
  
  // Update messagesData array
  const idx = messagesData.findIndex(msg => msg.id === m.id);
  if (idx !== -1) {
    messagesData[idx] = m;
  }
  
  const el = alist.querySelector(`[data-id="${m.id}"]`);
  if (!el) return;
  
  // Check if trade is now completed
  const isCompleted = (m.text || "").includes("| Booked Profit is") || (m.text || "").includes("| Book Loss is");
  const isProfit = (m.text || "").includes("| Booked Profit is");
  const isLoss = (m.text || "").includes("| Book Loss is");
  
  // Update table
  renderTradeTable();
  
  // If completed, just remove from card list
  if (isCompleted) {
    el.remove();
    return;
  }
  
  // Rebuild content region similar to addAdminItem
  const when = m.ts ? new Date(m.ts).toLocaleTimeString() : "";
  const tokens = (m.text || "").trim().split(/\s+/);
  const symbol = tokens[0] || "";
  const strike = tokens[1] || "";
  const optType = tokens[2] || "";
  const side = tokens[3] || "";
  const sideClass = side.toUpperCase() === 'BUY' ? 'buy' : side.toUpperCase() === 'SELL' ? 'sell' : '';
  const optClass = optType.toUpperCase() === 'CE' ? 'ce' : optType.toUpperCase() === 'PE' ? 'pe' : '';
  el.classList.remove('is-buy','is-sell','is-profit','is-loss');
  if (sideClass === 'buy') el.classList.add('is-buy');
  if (sideClass === 'sell') el.classList.add('is-sell');
  
  // Update background color
  if (isProfit) {
    el.classList.add('is-profit');
  } else if (isLoss) {
    el.classList.add('is-loss');
  }
  
  el.querySelector('.meta').innerHTML = `<span class="badge">${escapeHtml(m.author || "Admin")}</span><span>${when}</span>`;
  el.querySelector('.chips').innerHTML = `
      ${symbol ? `<span class="chip">${escapeHtml(symbol)}</span>` : ''}
      ${strike ? `<span class="chip">${escapeHtml(strike)}</span>` : ''}
      ${optType ? `<span class=\"chip ${optClass}\">${escapeHtml(optType)}</span>` : ''}
      ${side ? `<span class=\"chip ${sideClass}\">${escapeHtml(side)}</span>` : ''}`;
  el.querySelector('.text').innerHTML = `${colorizeBookedPrice(linkify(escapeHtml(m.text || "")))}`;
});

function openConfirmModal({ text = "Are you sure?", onConfirm = null } = {}) {
  if (!confirmModal) { if (onConfirm) onConfirm(); return; }
  confirmText.textContent = text;
  confirmInput.value = "";
  confirmOk.disabled = true;
  confirmModal.classList.add('show');
  const onInput = () => { confirmOk.disabled = (confirmInput.value !== 'DELETE'); };
  const onCancel = () => cleanup();
  const onOk = () => { if (onConfirm) onConfirm(); cleanup(); };
  function cleanup(){
    confirmModal.classList.remove('show');
    confirmInput.removeEventListener('input', onInput);
    confirmCancel.removeEventListener('click', onCancel);
    confirmOk.removeEventListener('click', onOk);
  }
  confirmInput.addEventListener('input', onInput);
  confirmCancel.addEventListener('click', onCancel);
  confirmOk.addEventListener('click', onOk);
  setTimeout(() => confirmInput.focus(), 50);
}

function getCategoryLabel(category) {
  switch(category) {
    case "stocks": return "Stocks";
    case "options": return "Options";
    case "futures": return "Futures";
    case "options-hedge": return "Options Hedge";
    case "futures-options-hedge": return "Futures & Options Hedge";
    default: return "Options";
  }
}

function toast(message, ms = 2000) {
  if (!toastWrap) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  toastWrap.appendChild(el);
  setTimeout(() => { el.remove(); }, ms);
}

// Trade Tables Management - Move to top to ensure they're available
let currentTradeTableBody = null;
let historyFeed = null;
let historyEmpty = null;
let chkSelectAllCurrentTable = null;
let chkSelectAllCurrent = null;
let btnDeleteSelectedCurrent = null;
let btnClearHistory = null;
let historyTotalTrades = null;
let historyWinningTrades = null;
let historyLosingTrades = null;
let historyAccuracy = null;

// Initialize table elements when DOM is ready
function initTableElements() {
  currentTradeTableBody = document.getElementById("currentTradeTableBody");
  historyFeed = document.getElementById("historyFeed");
  historyEmpty = document.getElementById("historyEmpty");
  chkSelectAllCurrentTable = document.getElementById("chkSelectAllCurrentTable");
  chkSelectAllCurrent = document.getElementById("chkSelectAllCurrent");
  btnDeleteSelectedCurrent = document.getElementById("btnDeleteSelectedCurrent");
  btnClearHistory = document.getElementById("btnClearHistory");
  historyTotalTrades = document.getElementById("historyTotalTrades");
  historyWinningTrades = document.getElementById("historyWinningTrades");
  historyLosingTrades = document.getElementById("historyLosingTrades");
  historyAccuracy = document.getElementById("historyAccuracy");
  
  // Setup event listeners after elements are initialized
  setupTableEventListeners();
}

// Call initialization
initTableElements();

// Setup table event listeners
function setupTableEventListeners() {
  // Select all checkbox handlers for Current Trades table
  if (chkSelectAllCurrentTable) {
    chkSelectAllCurrentTable.addEventListener("change", (e) => {
      const checked = e.target.checked;
      if (currentTradeTableBody) {
        currentTradeTableBody.querySelectorAll('.table-sel').forEach((cb) => {
          cb.checked = checked;
        });
      }
    });
  }
  
  if (chkSelectAllCurrent) {
    chkSelectAllCurrent.addEventListener("change", (e) => {
      const checked = e.target.checked;
      if (currentTradeTableBody) {
        currentTradeTableBody.querySelectorAll('.table-sel').forEach((cb) => {
          cb.checked = checked;
        });
      }
    });
  }
  
  // Delete selected current trades
  if (btnDeleteSelectedCurrent) {
    btnDeleteSelectedCurrent.addEventListener("click", () => {
      if (!currentTradeTableBody) return;
      const ids = Array.from(currentTradeTableBody.querySelectorAll('.table-sel:checked'))
        .map((cb) => Number(cb.closest('tr')?.getAttribute('data-id')))
        .filter((n) => Number.isFinite(n));
      if (!ids.length) { toast("No items selected"); return; }
      socket.emit("admin:deleteMany", ids);
    });
  }
  
  // Clear all history trades
  if (btnClearHistory) {
    btnClearHistory.addEventListener("click", () => {
      // Get all completed trade IDs
      const historyTrades = messagesData.filter(m => {
        const text = m.text || "";
        return text.includes("| Booked Profit is") || text.includes("| Book Loss is");
      });
      
      if (historyTrades.length === 0) {
        toast("No history to clear");
        return;
      }
      
      openConfirmModal({
        text: `Delete all ${historyTrades.length} completed trades? This cannot be undone.`,
        onConfirm: () => {
          const ids = historyTrades.map(m => m.id).filter(id => id != null);
          if (ids.length > 0) {
            socket.emit("admin:deleteMany", ids);
            toast("History cleared");
          }
        }
      });
    });
  }
}

// Render table rows from messages - split into current and history
function renderTradeTable() {
  if (!currentTradeTableBody || !historyFeed) {
    return;
  }
  
  // Split messages into current (active) and history (completed)
  const currentTrades = messagesData.filter(m => {
    const text = m.text || "";
    return !text.includes("| Booked Profit is") && !text.includes("| Book Loss is");
  });
  
  const historyTrades = messagesData.filter(m => {
    const text = m.text || "";
    return text.includes("| Booked Profit is") || text.includes("| Book Loss is");
  });
  
  // Render current trades table
  if (currentTrades.length === 0) {
    currentTradeTableBody.innerHTML = '<tr><td colspan="7" class="empty-table">No active trades</td></tr>';
  } else {
    currentTradeTableBody.innerHTML = currentTrades.map(m => createCurrentTradeRow(m)).join("");
  }
  
  // Render history trades as cards
  historyFeed.innerHTML = "";
  if (historyTrades.length === 0) {
    historyEmpty.style.display = "block";
    historyFeed.appendChild(historyEmpty);
  } else {
    historyEmpty.style.display = "none";
    historyTrades.slice().reverse().forEach(m => {
      const card = createHistoryCard(m);
      historyFeed.appendChild(card);
    });
  }
  
  // Update performance statistics
  updateHistoryStats(historyTrades);
  
  // Attach event listeners after rendering
  attachTableEventListeners();
}

// Current Trades Row (with checkbox, no status badge)
function createCurrentTradeRow(m) {
  if (!m || !m.text) return '';
  
  const when = m.ts ? new Date(m.ts).toLocaleString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    day: '2-digit',
    month: 'short'
  }) : "";
  
  const text = m.text || "";
  
  // Extract category from text [Category]
  const categoryMatch = text.match(/\[(.*?)\]/);
  const category = categoryMatch ? categoryMatch[1] : "Unknown";
  const categoryClass = getCategoryClass(category);
  
  // Extract trade type from author
  const tradeType = m.author || "Admin";
  
  // Extract symbol (first word after category)
  const afterCategory = text.split(']')[1] || '';
  const symbolMatch = afterCategory.trim().split(/\s+/)[0];
  const symbol = symbolMatch || "—";
  
  // Build details string (everything after symbol)
  const detailsStart = text.indexOf(symbol) + symbol.length;
  const details = text.substring(detailsStart).trim();
  
  return `
    <tr data-id="${m.id}">
      <td><input type="checkbox" class="table-sel" /></td>
      <td>${escapeHtml(when)}</td>
      <td><span class="category-badge ${categoryClass}">${escapeHtml(category)}</span></td>
      <td>${escapeHtml(tradeType)}</td>
      <td><strong>${escapeHtml(symbol)}</strong></td>
      <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(details)}</td>
      <td>
        <div class="table-actions">
          <button class="btn" data-action="table-edit" data-id="${m.id}">Edit</button>
          <button class="btn" data-action="table-book-profit" data-id="${m.id}" style="background-color: #10b981; color: white;">Book Profit</button>
          <button class="btn" data-action="table-book-loss" data-id="${m.id}" style="background-color: #ef4444; color: white;">Book Loss</button>
          <button class="btn btn-danger" data-action="table-delete" data-id="${m.id}">Delete</button>
        </div>
      </td>
    </tr>
  `;
}

// History Trades Card (card-based layout like completed.html)
function createHistoryCard(m) {
  if (!m || !m.text) return null;
  
  const wrap = document.createElement("article");
  wrap.className = "card";
  if (m.id != null) wrap.setAttribute("data-id", String(m.id));
  
  const when = m.ts ? new Date(m.ts).toLocaleString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) : "";
  
  const text = m.text || "";
  const tokens = text.trim().split(/\s+/);
  
  // Extract category
  const categoryMatch = text.match(/\[(.*?)\]/);
  const category = categoryMatch ? categoryMatch[1] : "";
  
  // Parse tokens after category
  const afterCategory = text.split(']')[1] || '';
  const parts = afterCategory.trim().split(/\s+/);
  const symbol = parts[0] || "";
  const strike = parts[1] || "";
  const optType = parts[2] || "";
  const side = parts[3] || "";
  
  const sideClass = side.toUpperCase() === 'BUY' ? 'buy' : side.toUpperCase() === 'SELL' ? 'sell' : '';
  const optClass = optType.toUpperCase() === 'CE' ? 'ce' : optType.toUpperCase() === 'PE' ? 'pe' : '';
  
  const isProfit = text.includes("| Booked Profit is");
  const isLoss = text.includes("| Book Loss is");
  
  if (sideClass === 'buy') wrap.classList.add('is-buy');
  if (sideClass === 'sell') wrap.classList.add('is-sell');
  if (isProfit) wrap.classList.add('is-profit');
  if (isLoss) wrap.classList.add('is-loss');
  
  wrap.innerHTML = `
    <div class="meta">
      <span class="badge">${escapeHtml(m.author || "Trade")}</span>
      <span>${when}</span>
    </div>
    <div class="chips">
      ${category ? `<span class="chip">${escapeHtml(category)}</span>` : ''}
      ${symbol ? `<span class="chip">${escapeHtml(symbol)}</span>` : ''}
      ${strike ? `<span class="chip">${escapeHtml(strike)}</span>` : ''}
      ${optType ? `<span class="chip ${optClass}">${escapeHtml(optType)}</span>` : ''}
      ${side ? `<span class="chip ${sideClass}">${escapeHtml(side)}</span>` : ''}
    </div>
    <div class="text">${colorizeBookedPrice(linkify(escapeHtml(text)))}</div>
  `;
  
  return wrap;
}

function getCategoryClass(category) {
  const lower = category.toLowerCase();
  if (lower.includes('stock')) return 'category-stocks';
  if (lower.includes('futures') && lower.includes('options')) return 'category-fo-hedge';
  if (lower.includes('futures')) return 'category-futures';
  if (lower.includes('options') && lower.includes('hedge')) return 'category-options-hedge';
  if (lower.includes('option')) return 'category-options';
  return 'category-options';
}

function attachTableEventListeners() {
  // Edit buttons (current trades only)
  currentTradeTableBody.querySelectorAll('[data-action="table-edit"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      const msg = messagesData.find(m => m.id === id);
      if (!msg) return;
      const current = msg.text || "";
      const next = prompt("Edit message text", current);
      if (next && next.trim()) {
        socket.emit("admin:edit", { id, text: next.trim().slice(0, 2000) });
      }
    });
  });
  
  // Delete buttons (current trades table)
  currentTradeTableBody.querySelectorAll('[data-action="table-delete"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      if (id != null) socket.emit("admin:delete", id);
    });
  });

  // Book Profit buttons (current trades table)
  currentTradeTableBody.querySelectorAll('[data-action="table-book-profit"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      const msg = messagesData.find(m => m.id === id);
      if (!msg) return;
      const current = msg.text || "";
      if (current.includes("| Booked Profit is") || current.includes("| Book Loss is")) {
        toast("Trade already booked");
        return;
      }
      const price = prompt("Enter profit booked price:", "");
      if (price === null) return;
      if (!String(price).trim()) { toast("Please enter a price"); return; }
      const updatedText = `${current} | Booked Profit is ${String(price).trim()}`;
      socket.emit("admin:edit", { id, text: updatedText.slice(0, 2000) });
      toast("Profit booked");
    });
  });

  // Book Loss buttons (current trades table)
  currentTradeTableBody.querySelectorAll('[data-action="table-book-loss"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      const msg = messagesData.find(m => m.id === id);
      if (!msg) return;
      const current = msg.text || "";
      if (current.includes("| Booked Profit is") || current.includes("| Book Loss is")) {
        toast("Trade already booked");
        return;
      }
      const price = prompt("Enter loss booked price:", "");
      if (price === null) return;
      if (!String(price).trim()) { toast("Please enter a price"); return; }
      const updatedText = `${current} | Book Loss is ${String(price).trim()}`;
      socket.emit("admin:edit", { id, text: updatedText.slice(0, 2000) });
      toast("Loss booked");
    });
  });
  
  // Checkbox change handler (current trades)
  currentTradeTableBody.querySelectorAll('.table-sel').forEach(cb => {
    cb.addEventListener('change', updateSelectAllCurrentTableState);
  });
}

function updateSelectAllCurrentTableState() {
  if (!chkSelectAllCurrentTable) return;
  const allCheckboxes = Array.from(currentTradeTableBody.querySelectorAll('.table-sel'));
  const checkedCount = allCheckboxes.filter(cb => cb.checked).length;
  chkSelectAllCurrentTable.checked = checkedCount > 0 && checkedCount === allCheckboxes.length;
  chkSelectAllCurrentTable.indeterminate = checkedCount > 0 && checkedCount < allCheckboxes.length;
}

// Update performance statistics for Trade History
function updateHistoryStats(historyTrades) {
  if (!historyTotalTrades || !historyWinningTrades || !historyLosingTrades || !historyAccuracy) return;
  
  const total = historyTrades.length;
  const winning = historyTrades.filter(m => {
    const text = m.text || "";
    return text.includes("| Booked Profit is");
  }).length;
  const losing = historyTrades.filter(m => {
    const text = m.text || "";
    return text.includes("| Book Loss is");
  }).length;
  const accuracy = total > 0 ? Math.round((winning / total) * 100) : 0;
  
  historyTotalTrades.textContent = total;
  historyWinningTrades.textContent = winning;
  historyLosingTrades.textContent = losing;
  historyAccuracy.textContent = `${accuracy}%`;
}
