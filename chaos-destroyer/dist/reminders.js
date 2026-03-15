"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndGenerateReminders = checkAndGenerateReminders;
exports.showRemindersMenu = showRemindersMenu;
exports.viewRemindersSummary = viewRemindersSummary;
const store_1 = require("./store");
const utils_1 = require("./utils");
const cli_table3_1 = __importDefault(require("cli-table3"));
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const REMINDER_DAYS_BEFORE = 2; // Ben's preference
function checkAndGenerateReminders() {
    const data = store_1.store.getData();
    const debts = data.debts ? data.debts.filter(d => d.type === 'debt' && d.balance > 0) : [];
    const bills = data.bills || [];
    const existingReminders = data.reminders || [];
    // Generate reminders for debts
    debts.forEach(debt => {
        const daysUntil = (0, utils_1.getDaysUntil)(debt.dueDate);
        // Create reminder if it doesn't exist and is within window
        if (daysUntil >= 0 && daysUntil <= REMINDER_DAYS_BEFORE + 1) {
            const exists = existingReminders.some(r => r.relatedDebtId === debt.id && r.status === 'pending');
            if (!exists) {
                const dueDate = getNextDueDate(debt.dueDate);
                store_1.store.addReminder({
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
        const daysUntil = (0, utils_1.getDaysUntil)(bill.dueDate);
        if (bill.isRecurring && daysUntil >= 0 && daysUntil <= REMINDER_DAYS_BEFORE + 1) {
            const exists = existingReminders.some(r => r.relatedBillId === bill.id && r.status === 'pending');
            if (!exists) {
                const dueDate = getNextDueDate(bill.dueDate);
                store_1.store.addReminder({
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
async function showRemindersMenu() {
    console.clear();
    console.log(chalk_1.default.cyan.bold('🔔 REMINDERS MANAGER\n'));
    checkAndGenerateReminders(); // Refresh
    const reminders = store_1.store.getReminders();
    const pending = reminders.filter(r => r.status === 'pending');
    const overdue = reminders.filter(r => {
        const daysUntil = (0, utils_1.getDaysUntil)(r.dueDate);
        return daysUntil < 0;
    });
    // Display reminders with color coding
    if (pending.length === 0) {
        console.log(chalk_1.default.green('✅ No pending reminders!\n'));
        await pressKey();
        return;
    }
    const table = new cli_table3_1.default({
        head: ['Status', 'Reminder', 'Due In', 'Actions'],
        style: { head: ['cyan'] }
    });
    pending.forEach((r, idx) => {
        const daysUntil = (0, utils_1.getDaysUntil)(r.dueDate);
        const status = (0, utils_1.getPaymentStatus)(daysUntil);
        const color = status === 'overdue' ? chalk_1.default.red : status === 'due-soon' ? chalk_1.default.yellow : chalk_1.default.white;
        table.push([
            color(`[${idx + 1}]`),
            r.title,
            color(`${daysUntil} days`),
            'Select'
        ]);
    });
    console.log(table.toString());
    const { action } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Choose a reminder:',
            choices: [
                ...pending.map((r, idx) => ({
                    name: `${r.title}`,
                    value: r.id
                })),
                new inquirer_1.default.Separator(),
                'Mark all as done',
                'Back'
            ]
        }
    ]);
    if (action === 'Back')
        return;
    if (action === 'Mark all as done') {
        pending.forEach(r => {
            store_1.store.updateReminder(r.id, { status: 'done' });
        });
        console.log(chalk_1.default.green('✅ All reminders marked done!'));
        await pressKey();
        return showRemindersMenu();
    }
    // Manage individual reminder
    const reminder = reminders.find(r => r.id === action);
    if (reminder) {
        await manageReminder(reminder);
    }
}
async function manageReminder(reminder) {
    console.clear();
    console.log(chalk_1.default.cyan(`Managing: ${reminder.title}\n`));
    console.log(`Due: ${reminder.dueDate}`);
    if (reminder.customText)
        console.log(`Details: ${reminder.customText}\n`);
    const { op } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'op',
            message: 'Action:',
            choices: ['Mark done', 'Snooze 1 day', 'Snooze 3 days', 'Snooze 1 week', 'Delete', 'Back']
        }
    ]);
    if (op === 'Mark done') {
        store_1.store.updateReminder(reminder.id, { status: 'done' });
        console.log(chalk_1.default.green('✅ Reminder marked as done!'));
    }
    else if (op.startsWith('Snooze')) {
        let days = 1;
        if (op.includes('3'))
            days = 3;
        if (op.includes('week'))
            days = 7;
        const tomorrow = new Date(reminder.dueDate);
        tomorrow.setDate(tomorrow.getDate() + days);
        store_1.store.updateReminder(reminder.id, {
            dueDate: tomorrow.toISOString(),
            status: 'pending'
        });
        console.log(chalk_1.default.green(`✅ Reminder snoozed for ${days} day(s)!`));
    }
    else if (op === 'Delete') {
        store_1.store.deleteReminder(reminder.id);
        console.log(chalk_1.default.green('✅ Reminder deleted!'));
    }
    await pressKey();
}
async function viewRemindersSummary() {
    const reminders = store_1.store.getReminders().filter(r => r.status === 'pending');
    if (reminders.length === 0) {
        return '✅ No pending reminders';
    }
    let summary = chalk_1.default.yellow(`⚠️  ${reminders.length} pending reminder(s):`);
    reminders.slice(0, 3).forEach(r => {
        const daysUntil = (0, utils_1.getDaysUntil)(r.dueDate);
        summary += `\n  • ${r.title} (${daysUntil} days)`;
    });
    return summary;
}
function getNextDueDate(dueDay) {
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
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}
async function pressKey() {
    await inquirer_1.default.prompt([{ name: 'continue', type: 'input', message: 'Press Enter to continue...' }]);
}
