import { store } from './store';
import { Reminder } from './models';
import { getDaysUntil, getPaymentStatus, colorizeStatus } from './utils';
import Table from 'cli-table3';
import chalk from 'chalk';
import inquirer from 'inquirer';

const REMINDER_DAYS_BEFORE = 2; // Ben's preference

export function checkAndGenerateReminders() {
  const data = store.getData();
  const debts = data.debts ? data.debts.filter(d => d.type === 'debt' && d.balance > 0) : [];
  const bills = data.bills || [];
  const existingReminders = data.reminders || [];

  // Generate reminders for debts
  debts.forEach(debt => {
    const daysUntil = getDaysUntil(debt.dueDate);
    
    // Create reminder if it doesn't exist and is within window
    if (daysUntil >= 0 && daysUntil <= REMINDER_DAYS_BEFORE + 1) {
      const exists = existingReminders.some(
        r => r.relatedDebtId === debt.id && r.status === 'pending'
      );
      
      if (!exists) {
        const dueDate = getNextDueDate(debt.dueDate);
        store.addReminder({
          title: `${debt.name} payment due - ${formatCurrency(debt.minimumPayment)}`,
          dueDate: dueDate.toISOString(),
          type: 'debt',
          status: 'pending',
          daysBefore: REMINDER_DAYS_BEFORE,
          relatedDebtId: debt.id,
          customText: `Make a payment of at least ${formatCurrency(debt.minimumPayment)} to ${debt.name} (APR: ${debt.apr}%)`
        });
      }
    }
  });

  // Generate reminders for bills
  bills.forEach(bill => {
    const daysUntil = getDaysUntil(bill.dueDate);
    
    if (bill.isRecurring && daysUntil >= 0 && daysUntil <= REMINDER_DAYS_BEFORE + 1) {
      const exists = existingReminders.some(
        r => r.relatedBillId === bill.id && r.status === 'pending'
      );
      
      if (!exists) {
        const dueDate = getNextDueDate(bill.dueDate);
        store.addReminder({
          title: `${bill.name} due - ${formatCurrency(bill.amount)}`,
          dueDate: dueDate.toISOString(),
          type: 'bill',
          status: 'pending',
          daysBefore: REMINDER_DAYS_BEFORE,
          relatedBillId: bill.id,
          customText: `${bill.name} payment of ${formatCurrency(bill.amount)} is due on ${bill.dueDate}`
        });
      }
    }
  });
}

export async function showRemindersMenu() {
  console.clear();
  console.log(chalk.cyan.bold('🔔 REMINDERS MANAGER\n'));

  checkAndGenerateReminders(); // Refresh

  const reminders = store.getReminders();
  const pending = reminders.filter(r => r.status === 'pending');
  const overdue = reminders.filter(r => {
    const daysUntil = getDaysUntil(r.dueDate);
    return daysUntil < 0;
  });

  // Display reminders with color coding
  if (pending.length === 0) {
    console.log(chalk.green('✅ No pending reminders!\n'));
    await pressKey();
    return;
  }

  const table = new Table({
    head: ['Status', 'Reminder', 'Due In', 'Actions'],
    style: { head: ['cyan'] }
  });

  pending.forEach((r, idx) => {
    const daysUntil = getDaysUntil(r.dueDate);
    const status = getPaymentStatus(daysUntil);
    const color = status === 'overdue' ? chalk.red : status === 'due-soon' ? chalk.yellow : chalk.white;

    table.push([
      color(`[${idx + 1}]`),
      r.title,
      color(`${daysUntil} days`),
      'Select'
    ]);
  });

  console.log(table.toString());

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Choose a reminder:',
      choices: [
        ...pending.map((r, idx) => ({
          name: `${r.title}`,
          value: r.id
        })),
        new inquirer.Separator(),
        'Mark all as done',
        'Back'
      ]
    }
  ]);

  if (action === 'Back') return;
  if (action === 'Mark all as done') {
    pending.forEach(r => {
      store.updateReminder(r.id, { status: 'done' });
    });
    console.log(chalk.green('✅ All reminders marked done!'));
    await pressKey();
    return showRemindersMenu();
  }

  // Manage individual reminder
  const reminder = reminders.find(r => r.id === action);
  if (reminder) {
    await manageReminder(reminder);
  }
}

async function manageReminder(reminder: Reminder) {
  console.clear();
  console.log(chalk.cyan(`Managing: ${reminder.title}\n`));
  console.log(`Due: ${reminder.dueDate}`);
  if (reminder.customText) console.log(`Details: ${reminder.customText}\n`);

  const { op } = await inquirer.prompt([
    {
      type: 'list',
      name: 'op',
      message: 'Action:',
      choices: ['Mark done', 'Snooze 1 day', 'Snooze 3 days', 'Snooze 1 week', 'Delete', 'Back']
    }
  ]);

  if (op === 'Mark done') {
    store.updateReminder(reminder.id, { status: 'done' });
    console.log(chalk.green('✅ Reminder marked as done!'));
  } else if (op.startsWith('Snooze')) {
    let days = 1;
    if (op.includes('3')) days = 3;
    if (op.includes('week')) days = 7;

    const tomorrow = new Date(reminder.dueDate);
    tomorrow.setDate(tomorrow.getDate() + days);
    
    store.updateReminder(reminder.id, { 
      dueDate: tomorrow.toISOString(),
      status: 'pending' 
    });
    console.log(chalk.green(`✅ Reminder snoozed for ${days} day(s)!`));
  } else if (op === 'Delete') {
    store.deleteReminder(reminder.id);
    console.log(chalk.green('✅ Reminder deleted!'));
  }

  await pressKey();
}

export async function viewRemindersSummary() {
  const reminders = store.getReminders().filter(r => r.status === 'pending');
  
  if (reminders.length === 0) {
    return '✅ No pending reminders';
  }

  let summary = chalk.yellow(`⚠️  ${reminders.length} pending reminder(s):`);
  reminders.slice(0, 3).forEach(r => {
    const daysUntil = getDaysUntil(r.dueDate);
    summary += `\n  • ${r.title} (${daysUntil} days)`;
  });

  return summary;
}

function getNextDueDate(dueDay: string): Date {
  const today = new Date();
  
  if (dueDay.match(/^\d{1,2}$/)) {
    const day = parseInt(dueDay, 10);
    let target = new Date(today.getFullYear(), today.getMonth(), day);
    
    if (target <= today) {
      target = new Date(today.getFullYear(), today.getMonth() + 1, day);
    }
    
    return target;
  }
  
  return new Date(dueDay);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

async function pressKey() {
  await inquirer.prompt([{ name: 'continue', type: 'input', message: 'Press Enter to continue...' }]);
}
