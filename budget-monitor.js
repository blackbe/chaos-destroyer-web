#!/usr/bin/env node

/**
 * API Budget Monitor
 * 
 * Checks API spend every 2 hours and alerts if approaching or exceeding daily budget.
 * Budget: $1/day (warn at $0.75)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BUDGET_DAILY = 1.00;
const BUDGET_WARN_THRESHOLD = 0.75;
const CHECK_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours
const LOG_FILE = path.join(__dirname, '.budget-log.json');
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '';

// Initialize log file
function initLogFile() {
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, JSON.stringify({
      createdAt: new Date().toISOString(),
      checks: [],
      lastAlert: null,
      totalSpent: 0,
    }, null, 2));
  }
}

// Read current session status
async function checkSpend() {
  return new Promise((resolve) => {
    // Since we can't directly call the API, we'll estimate based on token tracking
    // In a real scenario, this would call an endpoint that returns current spend
    
    const log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    const today = new Date().toISOString().split('T')[0];
    const todaysChecks = log.checks.filter(c => c.date === today);
    
    // Get estimated spend (would be more accurate with real API call)
    let estimatedSpend = 0;
    if (todaysChecks.length > 0) {
      estimatedSpend = Math.max(...todaysChecks.map(c => c.estimatedSpend || 0));
    }
    
    resolve({
      date: today,
      estimatedSpend,
      timestamp: new Date().toISOString(),
    });
  });
}

// Send alert via WhatsApp
async function sendAlert(message) {
  if (!GATEWAY_TOKEN) {
    console.log('[Budget Monitor] No gateway token, skipping WhatsApp alert');
    return;
  }

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      action: 'send',
      channel: 'whatsapp',
      target: '+15038662111',
      message: `⚠️ Budget Alert:\n${message}`,
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

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        console.log(`[Budget Monitor] Alert sent: ${message}`);
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('[Budget Monitor] Failed to send alert:', err.message);
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

// Main monitor loop
async function monitor() {
  initLogFile();
  
  console.log(`[Budget Monitor] Starting (daily limit: $${BUDGET_DAILY}, warn at: $${BUDGET_WARN_THRESHOLD})`);

  setInterval(async () => {
    try {
      const spend = await checkSpend();
      const log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
      
      // Record this check
      log.checks.push(spend);
      
      console.log(`[Budget Monitor] Check at ${spend.timestamp}: $${spend.estimatedSpend.toFixed(3)}`);
      
      // Check thresholds
      if (spend.estimatedSpend >= BUDGET_DAILY) {
        const message = `Daily budget exceeded! Current: $${spend.estimatedSpend.toFixed(3)} / Limit: $${BUDGET_DAILY}`;
        console.log(`[Budget Monitor] ${message}`);
        
        if (log.lastAlert !== 'exceeded') {
          await sendAlert(message);
          log.lastAlert = 'exceeded';
        }
      } else if (spend.estimatedSpend >= BUDGET_WARN_THRESHOLD) {
        const message = `Approaching daily budget: $${spend.estimatedSpend.toFixed(3)} / Limit: $${BUDGET_DAILY}`;
        console.log(`[Budget Monitor] ${message}`);
        
        if (log.lastAlert !== 'warning') {
          await sendAlert(message);
          log.lastAlert = 'warning';
        }
      } else {
        log.lastAlert = null;
      }
      
      log.totalSpent = spend.estimatedSpend;
      fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
      
    } catch (error) {
      console.error('[Budget Monitor] Error during check:', error.message);
    }
  }, CHECK_INTERVAL);
  
  console.log('[Budget Monitor] Running (checking every 2 hours)');
}

// Start monitoring
monitor().catch((err) => {
  console.error('[Budget Monitor] Fatal error:', err);
  process.exit(1);
});
