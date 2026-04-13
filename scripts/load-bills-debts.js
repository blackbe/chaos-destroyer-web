#!/usr/bin/env node
/**
 * Load bills, debts, and savings data into Supabase
 * Usage: node scripts/load-bills-debts.js
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, '../BILLS_DATA_CURRENT.json');

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function loadData() {
  try {
    console.log('📥 Loading bills & debts data...\n');

    // Read JSON file
    const rawData = fs.readFileSync(dataFile, 'utf-8');
    const data = JSON.parse(rawData);

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error('❌ Not authenticated. Please log in first.');
      process.exit(1);
    }

    const userId = user.id;
    console.log(`✓ Authenticated as: ${user.email}\n`);

    // Load bills
    console.log('📝 Loading bills...');
    for (const bill of data.billsData) {
      const { error } = await supabase.from('bills').insert({
        user_id: userId,
        name: bill.name,
        amount: bill.amount,
        due_date: bill.dueDate,
        frequency: bill.frequency,
        category: bill.category,
        notes: bill.notes || '',
        last_paid: bill.lastPaid || null,
        auto_fetch: bill.autoFetch || false,
        auto_fetch_url: bill.autoFetchUrl || null,
      });

      if (error) {
        console.warn(`  ⚠️  ${bill.name}: ${error.message}`);
      } else {
        console.log(`  ✓ ${bill.name}`);
      }
    }

    // Load debts
    console.log('\n💳 Loading debts...');
    for (const debt of data.debtData) {
      const { error } = await supabase.from('debts').insert({
        user_id: userId,
        name: debt.name,
        balance: debt.balance,
        minimum_payment: debt.minimumPayment,
        target_payment: debt.targetPayment || debt.minimumPayment,
        due_date: debt.dueDate,
        apr: debt.apr,
        payoff_priority: debt.payoffPriority,
        notes: debt.notes || '',
        last_paid: debt.lastPaid || null,
      });

      if (error) {
        console.warn(`  ⚠️  ${debt.name}: ${error.message}`);
      } else {
        console.log(`  ✓ ${debt.name}`);
      }
    }

    // Load savings
    if (data.savingsData && data.savingsData.length > 0) {
      console.log('\n💰 Loading savings...');
      for (const savings of data.savingsData) {
        const { error } = await supabase.from('savings').insert({
          user_id: userId,
          name: savings.name,
          balance: savings.balance,
          allocation: savings.allocation,
          target_date: savings.targetDate || null,
          notes: savings.notes || '',
          last_contribution: savings.lastContribution || null,
        });

        if (error) {
          console.warn(`  ⚠️  ${savings.name}: ${error.message}`);
        } else {
          console.log(`  ✓ ${savings.name}`);
        }
      }
    }

    console.log('\n✅ Data loaded successfully!');
    console.log('📱 You can now edit items directly in the app.\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

loadData();
