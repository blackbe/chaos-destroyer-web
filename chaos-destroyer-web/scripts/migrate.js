#!/usr/bin/env node

/**
 * Data Migration Script: CLI Phase 2 → React Web with Supabase
 * 
 * This script reads from the CLI's store.json and imports all data into Supabase.
 * 
 * Usage:
 *   node scripts/migrate.js
 * 
 * Requirements:
 *   - Supabase project set up with tables
 *   - .env.local configured with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 *   - CLI store.json file at ../chaos-destroyer/data/store.json
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrate() {
  try {
    console.log('🚀 Starting data migration from CLI to Web...\n');

    // Read the CLI store.json
    const storePath = path.join(__dirname, '../chaos-destroyer/data/store.json');
    if (!fs.existsSync(storePath)) {
      throw new Error(`Store file not found at ${storePath}`);
    }

    const store = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
    console.log('✅ Loaded CLI store.json\n');

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated. Please sign in first.');
    }

    const userId = user.id;
    console.log(`📝 Migrating data for user: ${user.email}\n`);

    // Migrate debts
    if (store.debts && store.debts.length > 0) {
      console.log(`💳 Migrating ${store.debts.length} debts...`);
      for (const debt of store.debts) {
        const { error } = await supabase
          .from('debts')
          .insert([
            {
              id: debt.id,
              user_id: userId,
              name: debt.name,
              balance: debt.balance,
              minimum_payment: debt.minimumPayment,
              due_date: debt.dueDate,
              apr: debt.apr,
              payoff_priority: debt.payoffPriority,
              original_balance: debt.originalBalance,
              notes: debt.notes,
              created_at: debt.createdAt,
              updated_at: debt.updatedAt,
            },
          ]);
        if (error) console.error(`  ❌ Error: ${error.message}`);
      }
      console.log('  ✅ Debts migrated\n');
    }

    // Migrate bills
    if (store.bills && store.bills.length > 0) {
      console.log(`📋 Migrating ${store.bills.length} bills...`);
      for (const bill of store.bills) {
        const { error } = await supabase
          .from('bills')
          .insert([
            {
              id: bill.id,
              user_id: userId,
              name: bill.name,
              amount: bill.amount,
              due_date: bill.dueDate,
              frequency: bill.frequency,
              category: bill.category,
              is_recurring: bill.isRecurring,
              split_amount: bill.splitAmount,
              notes: bill.notes,
              created_at: bill.createdAt,
              updated_at: bill.updatedAt,
            },
          ]);
        if (error) console.error(`  ❌ Error: ${error.message}`);
      }
      console.log('  ✅ Bills migrated\n');
    }

    // Migrate income
    if (store.income && store.income.length > 0) {
      console.log(`💵 Migrating ${store.income.length} income sources...`);
      for (const inc of store.income) {
        const { error } = await supabase
          .from('income')
          .insert([
            {
              id: inc.id,
              user_id: userId,
              source: inc.source,
              amount: inc.amount,
              frequency: inc.frequency,
              is_paused: inc.isPaused,
              last_updated: inc.lastUpdated,
            },
          ]);
        if (error) console.error(`  ❌ Error: ${error.message}`);
      }
      console.log('  ✅ Income migrated\n');
    }

    // Migrate transactions
    if (store.transactions && store.transactions.length > 0) {
      console.log(`📊 Migrating ${store.transactions.length} transactions...`);
      for (const tx of store.transactions) {
        const { error } = await supabase
          .from('transactions')
          .insert([
            {
              id: tx.id,
              user_id: userId,
              date: tx.date,
              amount: tx.amount,
              debt_id: tx.debtId,
              bill_id: tx.billId,
              category: tx.category,
              description: tx.description,
            },
          ]);
        if (error) console.error(`  ❌ Error: ${error.message}`);
      }
      console.log('  ✅ Transactions migrated\n');
    }

    // Migrate goals
    if (store.goals && store.goals.length > 0) {
      console.log(`🎯 Migrating ${store.goals.length} goals...`);
      for (const goal of store.goals) {
        const { error } = await supabase
          .from('goals')
          .insert([
            {
              id: goal.id,
              user_id: userId,
              name: goal.name,
              target_amount: goal.targetAmount,
              current_amount: goal.currentAmount,
              due_date: goal.dueDate,
              progress_percent: goal.progressPercent,
              notes: goal.notes,
              created_at: goal.createdAt,
              updated_at: goal.updatedAt,
            },
          ]);
        if (error) console.error(`  ❌ Error: ${error.message}`);
      }
      console.log('  ✅ Goals migrated\n');
    }

    // Migrate reminders
    if (store.reminders && store.reminders.length > 0) {
      console.log(`🔔 Migrating ${store.reminders.length} reminders...`);
      for (const reminder of store.reminders) {
        const { error } = await supabase
          .from('reminders')
          .insert([
            {
              id: reminder.id,
              user_id: userId,
              title: reminder.title,
              due_date: reminder.dueDate,
              type: reminder.type,
              status: reminder.status,
              days_before: reminder.daysBefore,
              related_debt_id: reminder.relatedDebtId,
              related_bill_id: reminder.relatedBillId,
              custom_text: reminder.customText,
              created_at: reminder.createdAt,
            },
          ]);
        if (error) console.error(`  ❌ Error: ${error.message}`);
      }
      console.log('  ✅ Reminders migrated\n');
    }

    // Migrate gamification
    if (store.gamification) {
      console.log('🎮 Migrating gamification data...');
      const { error } = await supabase
        .from('gamification')
        .upsert([
          {
            user_id: userId,
            chao_points: store.gamification.chaoPoints,
            badges: store.gamification.badges,
            streaks: store.gamification.streaks,
            daily_challenges: store.gamification.dailyChallenges,
            milestones_achieved: store.gamification.milestonesAchieved,
          },
        ]);
      if (error) console.error(`  ❌ Error: ${error.message}`);
      else console.log('  ✅ Gamification migrated\n');
    }

    console.log('🎉 Migration complete!\n');
    console.log('📊 Summary:');
    console.log(`  • Debts: ${store.debts?.length || 0}`);
    console.log(`  • Bills: ${store.bills?.length || 0}`);
    console.log(`  • Income: ${store.income?.length || 0}`);
    console.log(`  • Goals: ${store.goals?.length || 0}`);
    console.log(`  • Reminders: ${store.reminders?.length || 0}`);
    console.log(`  • Gamification: ${store.gamification ? '✅' : '❌'}\n`);

    console.log('✅ All data has been migrated to Supabase!');
    console.log('💡 Start using the web app: npm run dev\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
