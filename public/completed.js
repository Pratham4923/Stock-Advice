const socket = io();

// Elements
const completedFeed = document.getElementById("completedFeed");
const completedEmpty = document.getElementById("completedEmpty");
const totalTradesEl = document.getElementById("totalTrades");
const winningTradesEl = document.getElementById("winningTrades");
const losingTradesEl = document.getElementById("losingTrades");
const accuracyEl = document.getElementById("accuracy");
const toastWrap = document.getElementById("toastWrap");

let allTrades = [];
let currentCategory = "all";
let currentType = "all";
let currentResult = "all";
let dateFrom = null;
let dateTo = null;

socket.on("connect", () => { toast("Connected"); });
socket.on("disconnect", () => { toast("Disconnected — check server"); });

socket.on("advice:init", (items) => {
  if (Array.isArray(items)) {
    allTrades = items.filter(m => isCompleted(m));
    renderTrades();
    updateStats();
  }
});

socket.on("advice", (msg) => {
  if (isCompleted(msg)) {
    allTrades.push(msg);
    renderTrades();
    updateStats();
  }
});

socket.on("advice:update", (m) => {
  if (!m || m.id == null) return;
  const idx = allTrades.findIndex(t => t.id === m.id);
  if (isCompleted(m)) {
    if (idx !== -1) {
      allTrades[idx] = m;
    } else {
      allTrades.push(m);
    }
  } else if (idx !== -1) {
    allTrades.splice(idx, 1);
  }
  renderTrades();
  updateStats();
});

socket.on("advice:delete", (data) => {
  if (!data || data.id == null) return;
  const idx = allTrades.findIndex(t => t.id === data.id);
  if (idx !== -1) {
    allTrades.splice(idx, 1);
    renderTrades();
    updateStats();
  }
});

socket.on("advice:clear", () => {
  allTrades = [];
  renderTrades();
  updateStats();
});

// Category filter buttons
document.querySelectorAll(".category-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.getAttribute("data-category");
    renderTrades();
    updateStats();
  });
});

// Trade type filter buttons
document.querySelectorAll(".type-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".type-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentType = btn.getAttribute("data-type");
    renderTrades();
    updateStats();
  });
});

// Result filter buttons
document.querySelectorAll(".result-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".result-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentResult = btn.getAttribute("data-result");
    renderTrades();
    updateStats();
  });
});

// Date filter
const dateFromEl = document.getElementById("dateFrom");
const dateToEl = document.getElementById("dateTo");
const btnApplyDate = document.getElementById("btnApplyDate");
const btnClearDate = document.getElementById("btnClearDate");

if (btnApplyDate) btnApplyDate.addEventListener("click", () => {
  dateFrom = dateFromEl.value ? new Date(dateFromEl.value) : null;
  dateTo = dateToEl.value ? new Date(dateToEl.value + "T23:59:59") : null;
  renderTrades();
  updateStats();
  toast("Date filter applied");
});

if (btnClearDate) btnClearDate.addEventListener("click", () => {
  dateFrom = null;
  dateTo = null;
  dateFromEl.value = "";
  dateToEl.value = "";
  renderTrades();
  updateStats();
  toast("Date filter cleared");
});

function isCompleted(m) {
  if (!m || !m.text) return false;
  return (m.text || "").includes("| Booked Profit is") || (m.text || "").includes("| Book Loss is");
}

function isProfit(m) {
  return (m.text || "").includes("| Booked Profit is");
}

function isLoss(m) {
  return (m.text || "").includes("| Book Loss is");
}

function getTradeType(m) {
  const author = (m.author || "").toLowerCase();
  if (author.includes("scalp")) return "scalping";
  if (author.includes("intraday")) return "intraday";
  if (author.includes("swing")) return "swing";
  if (author.includes("positional")) return "positional";
  return "";
}

function getCategory(m) {
  const text = (m.text || "").toLowerCase();
  if (text.includes("[stocks]")) return "stocks";
  if (text.includes("[futures & options hedge]")) return "futures-options-hedge";
  if (text.includes("[options hedge]")) return "options-hedge";
  if (text.includes("[futures]")) return "futures";
  if (text.includes("[options]")) return "options";
  return "options"; // Default to options if no category specified
}

function filterTrades(trades) {
  let filtered = trades;
  
  // Filter by category
  if (currentCategory !== "all") {
    filtered = filtered.filter(t => getCategory(t) === currentCategory);
  }
  
  // Filter by trade type
  if (currentType !== "all") {
    filtered = filtered.filter(t => getTradeType(t) === currentType);
  }
  
  // Filter by result
  if (currentResult === "profit") {
    filtered = filtered.filter(isProfit);
  } else if (currentResult === "loss") {
    filtered = filtered.filter(isLoss);
  }
  
  // Filter by date
  if (dateFrom || dateTo) {
    filtered = filtered.filter(t => {
      if (!t.ts) return false;
      const tradeDate = new Date(t.ts);
      if (dateFrom && tradeDate < dateFrom) return false;
      if (dateTo && tradeDate > dateTo) return false;
      return true;
    });
  }
  
  return filtered;
}

function renderTrades() {
  const filtered = filterTrades(allTrades);
  completedFeed.innerHTML = "";
  
  if (filtered.length === 0) {
    completedEmpty.style.display = "block";
    completedFeed.appendChild(completedEmpty);
    return;
  }
  
  completedEmpty.style.display = "none";
  filtered.slice().reverse().forEach(m => {
    const card = renderCard(m);
    completedFeed.appendChild(card);
  });
}

function updateStats() {
  // Use filtered trades for stats
  const filtered = filterTrades(allTrades);
  const total = filtered.length;
  const winning = filtered.filter(isProfit).length;
  const losing = filtered.filter(isLoss).length;
  const accuracy = total > 0 ? Math.round((winning / total) * 100) : 0;
  
  totalTradesEl.textContent = total;
  winningTradesEl.textContent = winning;
  losingTradesEl.textContent = losing;
  accuracyEl.textContent = `${accuracy}%`;
}

function renderCard(m) {
  const wrap = document.createElement("article");
  wrap.className = "card";
  if (m.id != null) wrap.setAttribute("data-id", String(m.id));
  
  const when = m.ts ? new Date(m.ts).toLocaleString() : "";
  const tokens = (m.text || "").trim().split(/\s+/);
  const symbol = tokens[0] || "";
  const strike = tokens[1] || "";
  const optType = tokens[2] || "";
  const side = tokens[3] || "";
  const sideClass = side.toUpperCase() === 'BUY' ? 'buy' : side.toUpperCase() === 'SELL' ? 'sell' : '';
  const optClass = optType.toUpperCase() === 'CE' ? 'ce' : optType.toUpperCase() === 'PE' ? 'pe' : '';
  
  const isProfitTrade = isProfit(m);
  const isLossTrade = isLoss(m);
  
  if (sideClass === 'buy') wrap.classList.add('is-buy');
  if (sideClass === 'sell') wrap.classList.add('is-sell');
  if (isProfitTrade) wrap.classList.add('is-profit');
  if (isLossTrade) wrap.classList.add('is-loss');
  
  wrap.innerHTML = `
    <div class="meta">
      <span class="badge">${escapeHtml(m.author || "Trade")}</span>
      <span>${when}</span>
    </div>
    <div class="chips">
      ${symbol ? `<span class="chip">${escapeHtml(symbol)}</span>` : ''}
      ${strike ? `<span class="chip">${escapeHtml(strike)}</span>` : ''}
      ${optType ? `<span class="chip ${optClass}">${escapeHtml(optType)}</span>` : ''}
      ${side ? `<span class="chip ${sideClass}">${escapeHtml(side)}</span>` : ''}
    </div>
    <div class="text">${colorizeBookedPrice(linkify(escapeHtml(m.text || "")))}</div>
  `;
  return wrap;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll(/&/g, "&amp;")
    .replaceAll(/</g, "&lt;")
    .replaceAll(/>/g, "&gt;")
    .replaceAll(/"/g, "&quot;")
    .replaceAll(/'/g, "&#039;");
}

function linkify(str) {
  return str.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}

function colorizeBookedPrice(str) {
  str = str.replace(/\| Booked Profit is (\S+)/g, '| Booked Profit is <span class="profit-price">₹$1</span>');
  str = str.replace(/\| Book Loss is (\S+)/g, '| Book Loss is <span class="loss-price">₹$1</span>');
  return str;
}

function toast(message, ms = 2000) {
  if (!toastWrap) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  toastWrap.appendChild(el);
  setTimeout(() => { el.remove(); }, ms);
}
