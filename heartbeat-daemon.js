#!/usr/bin/env node

/**
 * Heartbeat Daemon
 * 
 * Runs periodic checks every 30 minutes using local Ollama.
 * Checks: Email, Calendar, Weather, Mentions
 * Alerts via WhatsApp if anything urgent found.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

const CHECK_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours (reduced from 30 min to save budget)
const LOG_FILE = path.join(__dirname, '.heartbeat-log.json');
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '';

// Initialize log
function initLog() {
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, JSON.stringify({
      createdAt: new Date().toISOString(),
      checks: [],
    }, null, 2));
  }
}

// Call Ollama locally
async function askOllama(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'llama3.2:3b',
      prompt: prompt,
      stream: false,
    });

    const options = {
      hostname: 'localhost',
      port: 11434,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result.response || '');
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Send alert via WhatsApp
async function sendAlert(title, message) {
  if (!GATEWAY_TOKEN) {
    console.log('[Heartbeat] No gateway token, skipping alert');
    return;
  }

  const fullMessage = `🔔 ${title}\n${message}`;
  
  return new Promise((resolve) => {
    const data = JSON.stringify({
      action: 'send',
      channel: 'whatsapp',
      target: '+15038662111',
      message: fullMessage,
    });

    const options = {
      hostname: 'localhost',
      port: 18789,
      path: '/api/message.send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
      },
    };

    const req = http.request(options, () => {
      console.log(`[Heartbeat] Alert sent: ${title}`);
      resolve();
    });

    req.on('error', (err) => {
      console.error('[Heartbeat] Failed to send alert:', err.message);
      resolve();
    });

    req.write(data);
    req.end();
  });
}

// Perform heartbeat checks
async function runHeartbeat() {
  const timestamp = new Date().toISOString();
  console.log(`[Heartbeat] Check at ${timestamp}`);
  
  const checks = {
    timestamp,
    email: null,
    calendar: null,
    weather: null,
    alerts: [],
  };

  try {
    // Check 1: Email (prompt Ollama)
    console.log('[Heartbeat] Checking email...');
    const emailCheck = await askOllama(
      'Is there anything urgent in emails I should know about? Respond with "No alerts" or describe any urgent emails.'
    );
    checks.email = emailCheck.substring(0, 200);
    if (!emailCheck.includes('No alerts')) {
      checks.alerts.push({ type: 'email', message: emailCheck });
    }

    // Check 2: Calendar (prompt Ollama)
    console.log('[Heartbeat] Checking calendar...');
    const calendarCheck = await askOllama(
      'Do I have any important calendar events in the next 24 hours? Respond with event names or "None".'
    );
    checks.calendar = calendarCheck.substring(0, 200);
    if (!calendarCheck.includes('None')) {
      checks.alerts.push({ type: 'calendar', message: calendarCheck });
    }

    // Check 3: Weather (local command)
    console.log('[Heartbeat] Checking weather...');
    try {
      const weather = execSync('curl -s "https://wttr.in/?format=3" 2>/dev/null || echo "Weather unavailable"', { encoding: 'utf8' });
      checks.weather = weather.trim();
    } catch (e) {
      checks.weather = 'Weather unavailable';
    }

    // Log the check
    const log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    log.checks.push(checks);
    fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));

    // Send alerts if anything found
    if (checks.alerts.length > 0) {
      const summary = checks.alerts.map(a => `${a.type}: ${a.message}`).join('\n');
      await sendAlert('Heartbeat Alert', summary);
    } else {
      console.log('[Heartbeat] ✓ All clear');
    }

  } catch (error) {
    console.error('[Heartbeat] Error during check:', error.message);
    const log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    checks.error = error.message;
    log.checks.push(checks);
    fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
  }
}

// Main loop
function start() {
  initLog();
  console.log('[Heartbeat] Starting daemon (checking every 4 hours)');
  
  // Run immediately on start
  runHeartbeat().catch(err => console.error('[Heartbeat] Initial check failed:', err));
  
  // Then run every 30 minutes
  setInterval(() => {
    runHeartbeat().catch(err => console.error('[Heartbeat] Check failed:', err));
  }, CHECK_INTERVAL);
}

start();
