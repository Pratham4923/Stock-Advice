"use strict";
const fs = require("fs");
const path = require("path");

function ensureDirFor(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadMessages(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, "utf8");
    if (!raw.trim()) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    throw new Error(`Could not read ${filePath}: ${e.message}`);
  }
}

function saveMessages(filePath, messages) {
  try {
    ensureDirFor(filePath);
    const tmp = `${filePath}.tmp`;
    const json = JSON.stringify(messages, null, 2);
    fs.writeFileSync(tmp, json, "utf8");
    // Replace atomically where possible
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    fs.renameSync(tmp, filePath);
  } catch (e) {
    throw new Error(`Could not write ${filePath}: ${e.message}`);
  }
}

// CSV Storage Functions
function loadMessagesFromCSV(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, "utf8");
    const lines = raw.trim().split(/\r?\n/);
    if (lines.length <= 1) return []; // No data or only header
    
    const messages = [];
    // Skip header row (index 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const msg = parseCSVLine(line);
      if (msg) messages.push(msg);
    }
    return messages;
  } catch (e) {
    throw new Error(`Could not read CSV ${filePath}: ${e.message}`);
  }
}

function saveMessagesToCSV(filePath, messages) {
  try {
    ensureDirFor(filePath);
    const tmp = `${filePath}.tmp`;
    
    // CSV Header
    let csv = "ID,Timestamp,Date,Time,Author,Category,Text\n";
    
    // CSV Rows
    for (const msg of messages) {
      if (!msg) continue;
      const date = msg.ts ? new Date(msg.ts) : new Date();
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      // Extract category from text
      const categoryMatch = (msg.text || "").match(/\[(.*?)\]/);
      const category = categoryMatch ? categoryMatch[1] : "";
      
      // Escape quotes and commas in text
      const escapedText = escapeCSV(msg.text || "");
      const escapedAuthor = escapeCSV(msg.author || "");
      
      csv += `${msg.id},${msg.ts || ""},${dateStr},${timeStr},${escapedAuthor},${category},${escapedText}\n`;
    }
    
    fs.writeFileSync(tmp, csv, "utf8");
    // Replace atomically where possible
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    fs.renameSync(tmp, filePath);
  } catch (e) {
    throw new Error(`Could not write CSV ${filePath}: ${e.message}`);
  }
}

function parseCSVLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  
  // Parse: ID,Timestamp,Date,Time,Author,Category,Text
  if (values.length < 7) return null;
  
  return {
    id: parseInt(values[0]) || 0,
    ts: parseInt(values[1]) || Date.now(),
    author: values[4] || "",
    text: values[6] || ""
  };
}

function escapeCSV(str) {
  const s = String(str || "");
  // If contains comma, newline, or quote, wrap in quotes and escape quotes
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

module.exports = { loadMessages, saveMessages, loadMessagesFromCSV, saveMessagesToCSV };
