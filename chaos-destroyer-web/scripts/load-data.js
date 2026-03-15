#!/usr/bin/env node
/**
 * Load bills & debts into Supabase
 * Run: node scripts/load-data.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env
const envPath = path.join(__dirname, '../.env.local');
const env = fs.readFileSync(envPath, 'utf-8').split('\n').reduce((acc, line) => {
  const [key, val] = line.split('=');
  if (key && val) acc[key.trim()] = val.trim();
  return acc;
}, {});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase config in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const dataFile = path.join(__dirname, '../BILLS_DATA_CURRENT.json');
const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

// Read user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function login() {
  // Check for env vars first (non-interactive)
  const email = process.env.CHAOS_EMAIL || await prompt('Email: ');
  const password = process.env.CHAOS_PASSWORD || await prompt('Password: ');

  if (!email || !password) {
    console.error('❌ Email and password required');
    process.exit(1);
  }

  console.log('\n🔐 Signing in...');
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('❌ Login failed:', error.message);
    process.exit(1);
  }

  console.log(`✓ Logged in as ${email}\n`);
  return authData.user.id;
}

async function loadBills(userId) {
  console.log('📝 Loading bills...');
  let count = 0;

  for (const bill of data.billsData) {
    const { error } = await supabase.from('bills').insert({
      user_id: userId,
      name: bill.name,
      amount: bill.amount,
      due_date: bill.dueDate,
      frequency: bill.frequency,
      category: bill.category,
      notes: bill.notes || '',
    });

    if (!error) {
      console.log(`  ✓ ${bill.name}`);
      count++;
    } else {
      console.warn(`  ⚠️  ${bill.name}: ${error.message}`);
    }
  }

  console.log(`✅ Loaded ${count}/${data.billsData.length} bills\n`);
}

async function loadDebts(userId) {
  console.log('💳 Loading debts...');
  let count = 0;

  for (const debt of data.debtData) {
    const { error } = await supabase.from('debts').insert({
      user_id: userId,
      name: debt.name,
      balance: debt.balance,
      minimum_payment: debt.minimumPayment,
      target_payment: debt.targetPayment || debt.minimumPayment,
      due_date: debt.dueDate,
      payoff_priority: debt.payoffPriority,
      notes: debt.notes || '',
    });

    if (!error) {
      console.log(`  ✓ ${debt.name}`);
      count++;
    } else {
      console.warn(`  ⚠️  ${debt.name}: ${error.message}`);
    }
  }

  console.log(`✅ Loaded ${count}/${data.debtData.length} debts\n`);
}

async function loadSavings(userId) {
  if (!data.savingsData || data.savingsData.length === 0) return;

  console.log('💰 Loading savings...');
  let count = 0;

  for (const savings of data.savingsData) {
    const { error } = await supabase.from('savings').insert({
      user_id: userId,
      name: savings.name,
      balance: savings.balance,
      allocation: JSON.stringify(savings.allocation),
      target_date: savings.targetDate || null,
      notes: savings.notes || '',
    });

    if (!error) {
      console.log(`  ✓ ${savings.name}`);
      count++;
    } else {
      console.warn(`  ⚠️  ${savings.name}: ${error.message}`);
    }
  }

  console.log(`✅ Loaded ${count}/${data.savingsData.length} savings\n`);
}

async function main() {
  try {
    const userId = await login();
    await loadBills(userId);
    await loadDebts(userId);
    // Savings table doesn't exist yet, skipping
    // await loadSavings(userId);

    console.log('🎉 All data loaded! Refresh your app to see it.\n');
    rl.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    rl.close();
    process.exit(1);
  }
}

main();
