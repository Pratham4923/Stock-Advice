const socket = io();

// Separate feeds for categories
const feedSI = document.getElementById("feedSI");
const feedSwing = document.getElementById("feedSwing");
const feedPos = document.getElementById("feedPos");
const feedSIEmpty = document.getElementById("feedSIEmpty");
const feedSwingEmpty = document.getElementById("feedSwingEmpty");
const feedPosEmpty = document.getElementById("feedPosEmpty");
const toastWrap = document.getElementById("toastWrap");

let currentCategory = "all";

// Category filter buttons
document.querySelectorAll(".category-nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".category-nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.getAttribute("data-category");
    filterFeeds();
  });
});

function getCategory(m) {
  const text = (m.text || "").toLowerCase();
  if (text.includes("[stocks]")) return "stocks";
  if (text.includes("[futures & options hedge]")) return "futures-options-hedge";
  if (text.includes("[options hedge]")) return "options-hedge";
  if (text.includes("[futures]")) return "futures";
  if (text.includes("[options]")) return "options";
  return "options";
}

function filterFeeds() {
  [feedSI, feedSwing, feedPos].forEach(feed => {
    feed.querySelectorAll('.card').forEach(card => {
      const id = card.getAttribute('data-id');
      const matchingItem = allMessages.find(m => m.id == id);
      if (matchingItem) {
        const category = getCategory(matchingItem);
        if (currentCategory === "all" || category === currentCategory) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      }
    });
  });
  refreshEmptyStates();
}

let allMessages = [];

socket.on("connect", () => { toast("Connected"); });
socket.on("disconnect", () => { toast("Disconnected — check server"); });

socket.on("advice:init", (items) => {
  clearAllFeeds();
  allMessages = items || [];
  if (Array.isArray(items) && items.length) {
    for (const m of items.slice().reverse()) addToFeed(m, false);
  }
  filterFeeds();
  refreshEmptyStates();
});

socket.on("advice", (msg) => {
  if (msg) allMessages.push(msg);
  addToFeed(msg, true);
  filterFeeds();
  refreshEmptyStates();
});

socket.on("advice:delete", (data) => {
  if (!data || data.id == null) return;
  for (const feed of [feedSI, feedSwing, feedPos]) {
    const el = feed.querySelector(`[data-id=\"${data.id}\"]`);
    if (el) el.remove();
  }
  refreshEmptyStates();
});

socket.on("advice:update", (m) => {
  if (!m || m.id == null) return;
  const el = document.querySelector(`[data-id=\"${m.id}\"]`);
  if (!el) return;
  
  // Check if trade is completed
  const isCompleted = (m.text || "").includes("| Booked Profit is") || (m.text || "").includes("| Book Loss is");
  const isProfit = (m.text || "").includes("| Booked Profit is");
  const isLoss = (m.text || "").includes("| Book Loss is");
  
  // If completed, just remove from view
  if (isCompleted) {
    el.remove();
    refreshEmptyStates();
    return;
  }
  
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
  
  el.querySelector('.meta').innerHTML = `<span class=\"badge\">${escapeHtml(m.author || "Update")}</span><span>${when}</span>`;
  el.querySelector('.chips').innerHTML = `
      ${symbol ? `<span class=\"chip\">${escapeHtml(symbol)}</span>` : ''}
      ${strike ? `<span class=\"chip\">${escapeHtml(strike)}</span>` : ''}
      ${optType ? `<span class=\"chip ${optClass}\">${escapeHtml(optType)}</span>` : ''}
      ${side ? `<span class=\"chip ${sideClass}\">${escapeHtml(side)}</span>` : ''}`;
  el.querySelector('.text').innerHTML = `${colorizeBookedPrice(linkify(escapeHtml(m.text || "")))}`;
});

socket.on("advice:clear", () => {
  clearAllFeeds();
  refreshEmptyStates();
});

function addToFeed(m, prepend = true) {
  if (!m || !m.text) return;
  
  // Check if trade is completed - don't show completed trades
  const isCompleted = (m.text || "").includes("| Booked Profit is") || (m.text || "").includes("| Book Loss is");
  if (isCompleted) return;
  
  const result = getFeedFor(m.author);
  const feed = result.feed;
  const empty = result.empty;
  
  if (!feed) return;
  const card = renderCard({
    title: m.author || "Update",
    text: m.text,
    ts: m.ts,
    id: m.id,
  });
  empty && (empty.style.display = 'none');
  if (prepend) feed.prepend(card); else feed.appendChild(card);
}

function getFeedFor(author) {
  const a = String(author || '').toLowerCase();
  if (a.includes('scalp') || a.includes('intraday')) return { feed: feedSI, empty: feedSIEmpty };
  if (a.includes('swing')) return { feed: feedSwing, empty: feedSwingEmpty };
  if (a.includes('positional')) return { feed: feedPos, empty: feedPosEmpty };
  // Default bucket: Scalping/Intraday
  return { feed: feedSI, empty: feedSIEmpty };
}

function clearAllFeeds() {
  for (const feed of [feedSI, feedSwing, feedPos]) feed.querySelectorAll('.card').forEach((n) => n.remove());
}

function refreshEmptyStates() {
  feedSIEmpty && (feedSIEmpty.style.display = feedSI.querySelector('.card') ? 'none' : 'block');
  feedSwingEmpty && (feedSwingEmpty.style.display = feedSwing.querySelector('.card') ? 'none' : 'block');
  feedPosEmpty && (feedPosEmpty.style.display = feedPos.querySelector('.card') ? 'none' : 'block');
}

function renderCard({ title, text, ts, id }) {
  const wrap = document.createElement("article");
  wrap.className = "card";
  if (id != null) wrap.setAttribute("data-id", String(id));
  const when = ts ? new Date(ts).toLocaleTimeString() : "";
  const tokens = (text || "").trim().split(/\s+/);
  const symbol = tokens[0] || "";
  const strike = tokens[1] || "";
  const optType = tokens[2] || "";
  const side = tokens[3] || "";
  const sideClass = side.toUpperCase() === 'BUY' ? 'buy' : side.toUpperCase() === 'SELL' ? 'sell' : '';
  const optClass = optType.toUpperCase() === 'CE' ? 'ce' : optType.toUpperCase() === 'PE' ? 'pe' : '';
  
  // Check if completed and add styling
  const isProfit = (text || "").includes("| Booked Profit is");
  const isLoss = (text || "").includes("| Book Loss is");
  
  if (sideClass === 'buy') wrap.classList.add('is-buy');
  if (sideClass === 'sell') wrap.classList.add('is-sell');
  
  // Add background color for completed trades
  if (isProfit) {
    wrap.classList.add('is-profit');
  } else if (isLoss) {
    wrap.classList.add('is-loss');
  }
  wrap.innerHTML = `
    <div class=\"meta\">
      <span class=\"badge\">${escapeHtml(title || "")}</span>
      <span>${when}</span>
    </div>
    <div class=\"chips\">
      ${symbol ? `<span class=\"chip\">${escapeHtml(symbol)}</span>` : ''}
      ${strike ? `<span class=\"chip\">${escapeHtml(strike)}</span>` : ''}
      ${optType ? `<span class=\"chip ${optClass}\">${escapeHtml(optType)}</span>` : ''}
      ${side ? `<span class=\"chip ${sideClass}\">${escapeHtml(side)}</span>` : ''}
    </div>
    <div class=\"text\">${colorizeBookedPrice(linkify(escapeHtml(text || "")))}</div>
  `;
  return wrap;
}

function escapeHtml(str) {
  return str
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

function toast(message, ms = 2000) {
  if (!toastWrap) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  toastWrap.appendChild(el);
  setTimeout(() => { el.remove(); }, ms);
}
