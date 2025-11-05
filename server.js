"use strict";
const path = require("path");
const fs = require("fs");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { loadMessages, saveMessages, loadMessagesFromCSV, saveMessagesToCSV } = require("./storage");
const { fetchMarketData } = require("./marketData");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || "changeme"; // override via ENV in production
const STORAGE = (process.env.STORAGE || "memory").toLowerCase(); // "memory" | "json" | "csv"
const MESSAGE_STORE_PATH = process.env.MESSAGE_STORE_PATH || path.join(__dirname, "data", STORAGE === "csv" ? "messages.csv" : "messages.json");

// Message store
const messages = [];
let nextId = 1;
const MAX_MESSAGES = 200;

// Initialize from file if enabled
if (STORAGE === "json") {
  try {
    const loaded = loadMessages(MESSAGE_STORE_PATH);
    if (Array.isArray(loaded)) {
      messages.push(...loaded);
      nextId = (messages.reduce((m, it) => Math.max(m, Number(it && it.id || 0)), 0) || 0) + 1;
      // Enforce MAX_MESSAGES on load
      while (messages.length > MAX_MESSAGES) messages.shift();
    }
  } catch (err) {
    console.error("Failed to load messages store:", err.message);
  }
} else if (STORAGE === "csv") {
  try {
    const loaded = loadMessagesFromCSV(MESSAGE_STORE_PATH);
    if (Array.isArray(loaded)) {
      messages.push(...loaded);
      nextId = (messages.reduce((m, it) => Math.max(m, Number(it && it.id || 0)), 0) || 0) + 1;
      // Enforce MAX_MESSAGES on load
      while (messages.length > MAX_MESSAGES) messages.shift();
    }
  } catch (err) {
    console.error("Failed to load CSV messages store:", err.message);
  }
}

app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

// Market data API endpoint
app.get("/api/market-data", async (req, res) => {
  try {
    const data = await fetchMarketData();
    res.json({ success: true, data });
  } catch (error) {
    console.error("Market data API error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

io.on("connection", (socket) => {
  // Sockets are not admins by default; must login with correct key
  socket.data.isAdmin = false;

  // Send initial server info
  io.emit("server:info", { online: io.engine.clientsCount });
  // Send current advice history to the newly connected client
  socket.emit("advice:init", messages);

  socket.on("admin:login", (key) => {
    const provided = typeof key === "string" ? key : "";
    if (provided && provided === ADMIN_KEY) {
      socket.data.isAdmin = true;
      socket.emit("auth:ok");
      socket.emit("advice:init", messages);
    } else {
      socket.data.isAdmin = false;
      socket.emit("auth:failed");
    }
  });

  socket.on("admin:advice", (payload) => {
    if (!socket.data.isAdmin) { socket.emit("auth:failed"); return; }
    const msg = sanitizeMessage(payload);
    if (!msg.text) return; // ignore empty messages
    const full = { ...msg, id: nextId++, ts: Date.now() };
    messages.push(full);
    if (messages.length > MAX_MESSAGES) messages.shift();
    persistMessages();
    console.log("Broadcasting advice:", full.author, "|", full.text);
    io.emit("advice", full);
  });

  socket.on("admin:delete", (id) => {
    if (!socket.data.isAdmin) { socket.emit("auth:failed"); return; }
    const numericId = typeof id === "string" ? Number(id) : id;
    const idx = messages.findIndex((m) => m && m.id === numericId);
    if (idx !== -1) {
      const [removed] = messages.splice(idx, 1);
      persistMessages();
      console.log("Deleting advice id:", removed.id);
      io.emit("advice:delete", { id: removed.id });
    }
  });

  socket.on("admin:edit", (payload) => {
    if (!socket.data.isAdmin) { socket.emit("auth:failed"); return; }
    const id = typeof payload?.id === "string" ? Number(payload.id) : payload?.id;
    const newTextRaw = typeof payload?.text === "string" ? payload.text : "";
    const idx = messages.findIndex((m) => m && m.id === id);
    if (idx === -1) return;
    const safeText = String(newTextRaw).slice(0, 2000);
    if (!safeText) return;
    messages[idx] = { ...messages[idx], text: safeText, ts: Date.now() };
    persistMessages();
    io.emit("advice:update", messages[idx]);
  });

  socket.on("admin:deleteMany", (ids) => {
    if (!socket.data.isAdmin) { socket.emit("auth:failed"); return; }
    if (!Array.isArray(ids) || !ids.length) return;
    const set = new Set(ids.map((x) => Number(x)).filter((n) => Number.isFinite(n)));
    if (!set.size) return;
    const removedIds = [];
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m && set.has(Number(m.id))) {
        removedIds.push(m.id);
        messages.splice(i, 1);
      }
    }
    if (!removedIds.length) return;
    persistMessages();
    console.log("Bulk delete ids:", removedIds.join(","));
    // Emit per-id for compatibility with existing clients
    for (const rid of removedIds) io.emit("advice:delete", { id: rid });
  });

  socket.on("admin:clear", () => {
    if (!socket.data.isAdmin) { socket.emit("auth:failed"); return; }
    if (messages.length === 0) return;
    messages.length = 0;
    persistMessages();
    console.log("Cleared all messages");
    io.emit("advice:clear");
  });

  socket.on("disconnect", () => {
    io.emit("server:info", { online: io.engine.clientsCount });
  });
});

function sanitizeMessage(payload = {}) {
  const text = typeof payload.text === "string" ? payload.text.slice(0, 2000) : "";
  const author = typeof payload.author === "string" ? payload.author.slice(0, 64) : "Anonymous";
  return { text, author };
}

function persistMessages() {
  if (STORAGE === "json") {
    try { saveMessages(MESSAGE_STORE_PATH, messages); } catch (e) { console.error("Save failed:", e.message); }
  } else if (STORAGE === "csv") {
    try { saveMessagesToCSV(MESSAGE_STORE_PATH, messages); } catch (e) { console.error("CSV save failed:", e.message); }
  }
}

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Storage mode: ${STORAGE.toUpperCase()}`);
  if (STORAGE === "json" || STORAGE === "csv") {
    console.log(`Data file: ${MESSAGE_STORE_PATH}`);
  }
});
