#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const dashboard_1 = require("./dashboard");
const reminders_1 = require("./reminders");
const store_1 = require("./store");
const payoff_1 = require("./payoff");
const export_1 = require("./export");
const utils_1 = require("./utils");
const gamification_1 = require("./gamification");
async function mainMenu() {
    (0, reminders_1.checkAndGenerateReminders)(); // Auto-generate on launch
    console.clear();
    console.log(chalk_1.default.cyan.bold('\n┌─────────────────────────────────────┐'));
    console.log(chalk_1.default.cyan.bold('│  ✨ CHAOS DESTROYER - MAIN MENU     │'));
    console.log(chalk_1.default.cyan.bold('└─────────────────────────────────────┘\n'));
    const { action } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'Dashboard',
                'Debts (Add/Edit/Delete)',
                'Bills (Add/Edit/Delete)',
                'Income (Add/Edit/Delete)',
                'Payments (Record Payment)',
                'Reminders (View/Manage)',
                'Payoff Planner (Scenarios)',
                'Goals (View/Edit)',
                new inquirer_1.default.Separator(),
                'Badges & Streaks (Gamification)',
                'Daily Challenges (Earn Points)',
                new inquirer_1.default.Separator(),
                'Export & Reports',
                'Settings',
                'Exit'
            ]
        }
    ]);
    switch (action) {
        case 'Dashboard':
            await (0, dashboard_1.showDashboard)();
            await pressKey();
            break;
        case 'Debts (Add/Edit/Delete)':
            await debtsMenu();
            break;
        case 'Bills (Add/Edit/Delete)':
            await billsMenu();
            break;
        case 'Income (Add/Edit/Delete)':
            await incomeMenu();
            break;
        case 'Payments (Record Payment)':
            await recordPayment();
            break;
        case 'Reminders (View/Manage)':
            await (0, reminders_1.showRemindersMenu)();
            break;
        case 'Payoff Planner (Scenarios)':
            await (0, payoff_1.runPayoffPlanner)();
            break;
        case 'Goals (View/Edit)':
            await goalsMenu();
            break;
        case 'Badges & Streaks (Gamification)':
            await showBadgesMenu();
            break;
        case 'Daily Challenges (Earn Points)':
            await showChallengesMenu();
            break;
        case 'Export & Reports':
            await (0, export_1.showExportMenu)();
            break;
        case 'Settings':
            await settingsMenu();
            break;
        case 'Exit':
            console.log(chalk_1.default.green('\n👋 Goodbye! Chaos Destroyer shutting down.\n'));
            process.exit(0);
    }
    return mainMenu();
}
// === DEBTS MENU ===
async function debtsMenu() {
    console.clear();
    console.log(chalk_1.default.cyan.bold('💳 MANAGE DEBTS\n'));
    const debts = (store_1.store.getDebts() || []).filter(d => d.type === 'debt').sort((a, b) => a.payoffPriority - b.payoffPriority);
    if (debts.length === 0) {
        console.log(chalk_1.default.yellow('No debts found.\n'));
    }
    else {
        const table = require('cli-table3');
        const debtTable = new table({
            head: ['#', 'Name', 'Balance', 'APR', 'Priority'],
            style: { head: ['cyan'] }
        });
        debts.forEach((d, idx) => {
            const color = d.payoffPriority === 1 ? chalk_1.default.red.bold : chalk_1.default.white;
            debtTable.push([
                color(`${idx + 1}`),
                color(d.name),
                color((0, utils_1.formatCurrency)(d.balance)),
                color(`${d.apr}%`),
                color(`${d.payoffPriority}`)
            ]);
        });
        console.log(debtTable.toString());
        console.log();
    }
    const { action } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Choose action:',
            choices: [
                ...(debts.length > 0 ? debts.map((d, idx) => ({ name: `Edit: ${d.name}`, value: `edit-${d.id}` })) : []),
                ...(debts.length > 0 ? debts.map((d, idx) => ({ name: `Delete: ${d.name}`, value: `del-${d.id}` })) : []),
                ...(debts.length > 1 ? [new inquirer_1.default.Separator(), 'Reorder Debts (Priority)'] : []),
                new inquirer_1.default.Separator(),
                'Add New Debt',
                'Back'
            ]
        }
    ]);
    if (action === 'Back')
        return;
    if (action === 'Reorder Debts (Priority)') {
        await reorderDebtsFlow();
        return debtsMenu();
    }
    else if (action === 'Add New Debt') {
        await addDebtFlow();
        console.log(chalk_1.default.green('✅ Debt added!\n'));
        await pressKey();
        return debtsMenu();
    }
    else if (action.startsWith('edit-')) {
        const debtId = action.replace('edit-', '');
        await editDebtFlow(debtId);
        return debtsMenu();
    }
    else if (action.startsWith('del-')) {
        const debtId = action.replace('del-', '');
        const { confirm } = await inquirer_1.default.prompt([
            { type: 'confirm', name: 'confirm', message: 'Are you sure?', default: false }
        ]);
        if (confirm) {
            store_1.store.deleteDebt(debtId);
            console.log(chalk_1.default.green('✅ Debt deleted!\n'));
        }
        await pressKey();
        return debtsMenu();
    }
}
async function reorderDebtsFlow() {
    console.clear();
    console.log(chalk_1.default.cyan.bold('🔄 REORDER DEBTS BY PRIORITY\n'));
    const debts = (store_1.store.getDebts() || []).filter(d => d.type === 'debt').sort((a, b) => a.payoffPriority - b.payoffPriority);
    const { debtId } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'debtId',
            message: 'Select a debt to reorder:',
            choices: debts.map(d => ({
                name: `Priority ${d.payoffPriority}: ${d.name}`,
                value: d.id
            }))
        }
    ]);
    const debt = store_1.store.getDebt(debtId);
    if (!debt)
        return;
    const currentPriority = debt.payoffPriority;
    const newPriority = await inquirer_1.default.prompt([
        {
            type: 'number',
            name: 'priority',
            message: `Current priority: ${currentPriority}. Enter new priority (1 = highest):`,
            default: currentPriority,
            validate: (val) => {
                if (val < 1 || val > debts.length)
                    return `Must be between 1 and ${debts.length}`;
                return true;
            }
        }
    ]);
    if (newPriority.priority === currentPriority) {
        console.log(chalk_1.default.yellow('No change needed.\n'));
        await pressKey();
        return;
    }
    // Reassign priorities
    const allDebts = store_1.store.getDebts().filter(d => d.type === 'debt');
    const targetPriority = newPriority.priority;
    if (targetPriority < currentPriority) {
        // Moving up (higher priority): shift others down
        allDebts.forEach(d => {
            if (d.id === debtId) {
                store_1.store.updateDebt(d.id, { payoffPriority: targetPriority });
            }
            else if (d.payoffPriority >= targetPriority && d.payoffPriority < currentPriority) {
                store_1.store.updateDebt(d.id, { payoffPriority: d.payoffPriority + 1 });
            }
        });
    }
    else {
        // Moving down (lower priority): shift others up
        allDebts.forEach(d => {
            if (d.id === debtId) {
                store_1.store.updateDebt(d.id, { payoffPriority: targetPriority });
            }
            else if (d.payoffPriority <= targetPriority && d.payoffPriority > currentPriority) {
                store_1.store.updateDebt(d.id, { payoffPriority: d.payoffPriority - 1 });
            }
        });
    }
    console.log(chalk_1.default.green(`✅ Priority updated! ${debt.name} is now priority ${targetPriority}\n`));
    await pressKey();
}
async function addDebtFlow() {
    const answers = await inquirer_1.default.prompt([
        { name: 'name', message: 'Debt Name (e.g., Chase CC):' },
        { name: 'balance', type: 'number', message: 'Current Balance:' },
        { name: 'apr', type: 'number', message: 'APR (0-100):' },
        { name: 'minPay', type: 'number', message: 'Minimum Payment:' },
        { name: 'dueDay', message: 'Due Day of Month (1-31) or date (YYYY-MM-DD):' },
        { name: 'priority', type: 'number', message: 'Priority (1 = highest):', default: 99 },
        { name: 'notes', message: 'Notes (optional):', default: '' }
    ]);
    const errors = store_1.store.validateDebt(answers);
    if (errors.length > 0) {
        console.log(chalk_1.default.red('\n❌ Validation errors:'));
        errors.forEach(e => console.log(`  • ${e}`));
        console.log();
        await pressKey();
        return;
    }
    store_1.store.addDebt({
        name: answers.name,
        type: 'debt',
        balance: answers.balance,
        originalBalance: answers.balance,
        apr: answers.apr,
        minimumPayment: answers.minPay,
        dueDate: answers.dueDay,
        payoffPriority: answers.priority,
        notes: answers.notes
    });
}
async function editDebtFlow(debtId) {
    const debt = store_1.store.getDebt(debtId);
    if (!debt)
        return;
    console.clear();
    console.log(chalk_1.default.cyan(`Editing: ${debt.name}\n`));
    console.log(`Balance: ${(0, utils_1.formatCurrency)(debt.balance)}`);
    console.log(`APR: ${debt.apr}%`);
    console.log(`Min Payment: ${(0, utils_1.formatCurrency)(debt.minimumPayment)}\n`);
    const { field } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'field',
            message: 'What to edit:',
            choices: ['Name', 'Balance', 'APR', 'Min Payment', 'Due Day', 'Priority', 'Notes', 'Back']
        }
    ]);
    if (field === 'Back')
        return;
    const { value } = await inquirer_1.default.prompt([
        {
            name: 'value',
            message: `Enter new ${field}:`,
            type: ['Balance', 'APR', 'Min Payment', 'Priority'].includes(field) ? 'number' : 'input'
        }
    ]);
    const updates = {};
    if (field === 'Name')
        updates.name = value;
    if (field === 'Balance')
        updates.balance = value;
    if (field === 'APR')
        updates.apr = value;
    if (field === 'Min Payment')
        updates.minimumPayment = value;
    if (field === 'Due Day')
        updates.dueDate = value;
    if (field === 'Priority')
        updates.payoffPriority = value;
    if (field === 'Notes')
        updates.notes = value;
    store_1.store.updateDebt(debtId, updates);
    console.log(chalk_1.default.green('✅ Updated!\n'));
    await pressKey();
}
// === BILLS MENU ===
async function billsMenu() {
    console.clear();
    console.log(chalk_1.default.cyan.bold('📄 MANAGE BILLS\n'));
    const bills = store_1.store.getBills() || [];
    if (bills.length === 0) {
        console.log(chalk_1.default.yellow('No bills found.\n'));
    }
    else {
        const table = require('cli-table3');
        const billTable = new table({
            head: ['#', 'Name', 'Amount', 'Due', 'Category'],
            style: { head: ['cyan'] }
        });
        bills.forEach((b, idx) => {
            billTable.push([
                `${idx + 1}`,
                b.name,
                (0, utils_1.formatCurrency)(b.amount),
                b.dueDate,
                b.category
            ]);
        });
        console.log(billTable.toString());
        console.log();
    }
    const { action } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Choose action:',
            choices: [
                ...(bills.length > 0 ? bills.map((b) => ({ name: `Edit: ${b.name}`, value: `edit-${b.id}` })) : []),
                ...(bills.length > 0 ? bills.map((b) => ({ name: `Delete: ${b.name}`, value: `del-${b.id}` })) : []),
                new inquirer_1.default.Separator(),
                'Add New Bill',
                'Back'
            ]
        }
    ]);
    if (action === 'Back')
        return;
    if (action === 'Add New Bill') {
        await addBillFlow();
        console.log(chalk_1.default.green('✅ Bill added!\n'));
        await pressKey();
        return billsMenu();
    }
    else if (action.startsWith('edit-')) {
        const billId = action.replace('edit-', '');
        await editBillFlow(billId);
        return billsMenu();
    }
    else if (action.startsWith('del-')) {
        const billId = action.replace('del-', '');
        const { confirm } = await inquirer_1.default.prompt([
            { type: 'confirm', name: 'confirm', message: 'Are you sure?', default: false }
        ]);
        if (confirm) {
            store_1.store.deleteBill(billId);
            console.log(chalk_1.default.green('✅ Bill deleted!\n'));
        }
        await pressKey();
        return billsMenu();
    }
}
async function addBillFlow() {
    const answers = await inquirer_1.default.prompt([
        { name: 'name', message: 'Bill Name:' },
        { name: 'amount', type: 'number', message: 'Amount:' },
        { name: 'dueDay', message: 'Due Day (1-31):' },
        {
            type: 'list',
            name: 'frequency',
            message: 'Frequency:',
            choices: ['monthly', 'biweekly', 'weekly', 'one-time'],
            default: 'monthly'
        },
        {
            type: 'list',
            name: 'category',
            message: 'Category:',
            choices: ['housing', 'utilities', 'insurance', 'subscription', 'food', 'transport', 'other'],
            default: 'other'
        }
    ]);
    store_1.store.addBill({
        name: answers.name,
        amount: answers.amount,
        dueDate: answers.dueDay,
        frequency: answers.frequency,
        category: answers.category,
        isRecurring: answers.frequency !== 'one-time',
        notes: ''
    });
}
async function editBillFlow(billId) {
    const bill = store_1.store.getBill(billId);
    if (!bill)
        return;
    console.clear();
    console.log(chalk_1.default.cyan(`Editing: ${bill.name}\n`));
    console.log(`Amount: ${(0, utils_1.formatCurrency)(bill.amount)}`);
    console.log(`Due: ${bill.dueDate}`);
    console.log(`Frequency: ${bill.frequency}\n`);
    const { field } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'field',
            message: 'What to edit:',
            choices: ['Name', 'Amount', 'Due Day', 'Frequency', 'Back']
        }
    ]);
    if (field === 'Back')
        return;
    const { value } = await inquirer_1.default.prompt([
        {
            name: 'value',
            message: `Enter new ${field}:`,
            type: field === 'Amount' ? 'number' : 'input'
        }
    ]);
    const updates = {};
    if (field === 'Name')
        updates.name = value;
    if (field === 'Amount')
        updates.amount = value;
    if (field === 'Due Day')
        updates.dueDate = value;
    if (field === 'Frequency') {
        updates.frequency = value;
        updates.isRecurring = value !== 'one-time';
    }
    store_1.store.updateBill(billId, updates);
    console.log(chalk_1.default.green('✅ Updated!\n'));
    await pressKey();
}
// === INCOME MENU ===
async function incomeMenu() {
    console.clear();
    console.log(chalk_1.default.cyan.bold('💵 MANAGE INCOME\n'));
    const incomeList = store_1.store.getIncome() || [];
    if (incomeList.length === 0) {
        console.log(chalk_1.default.yellow('No income sources found.\n'));
    }
    else {
        const table = require('cli-table3');
        const incomeTable = new table({
            head: ['#', 'Source', 'Amount', 'Frequency'],
            style: { head: ['cyan'] }
        });
        incomeList.forEach((inc, idx) => {
            incomeTable.push([
                `${idx + 1}`,
                inc.source,
                (0, utils_1.formatCurrency)(inc.amount),
                inc.frequency
            ]);
        });
        console.log(incomeTable.toString());
        console.log();
    }
    const { action } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Choose action:',
            choices: [
                ...(incomeList.length > 0 ? incomeList.map(inc => ({ name: `Edit: ${inc.source}`, value: `edit-${inc.id}` })) : []),
                ...(incomeList.length > 0 ? incomeList.map(inc => ({ name: `Delete: ${inc.source}`, value: `del-${inc.id}` })) : []),
                new inquirer_1.default.Separator(),
                'Add Income Source',
                'Back'
            ]
        }
    ]);
    if (action === 'Back')
        return;
    if (action === 'Add Income Source') {
        const answers = await inquirer_1.default.prompt([
            { name: 'source', message: 'Income Source (e.g., Centene):' },
            { name: 'amount', type: 'number', message: 'Amount:' },
            {
                type: 'list',
                name: 'freq',
                choices: ['weekly', 'biweekly', 'monthly', 'irregular'],
                message: 'Frequency:'
            }
        ]);
        store_1.store.addIncome({
            source: answers.source,
            amount: answers.amount,
            frequency: answers.freq,
            lastUpdated: new Date().toISOString()
        });
        console.log(chalk_1.default.green('✅ Income source added!\n'));
        await pressKey();
        return incomeMenu();
    }
    else if (action.startsWith('edit-')) {
        const incomeId = action.replace('edit-', '');
        const inc = store_1.store.getIncome().find(i => i.id === incomeId);
        if (inc) {
            const { field } = await inquirer_1.default.prompt([
                {
                    type: 'list',
                    name: 'field',
                    message: 'What to edit:',
                    choices: ['Name', 'Amount', 'Frequency', 'Back']
                }
            ]);
            if (field !== 'Back') {
                const { value } = await inquirer_1.default.prompt([
                    {
                        name: 'value',
                        message: `Enter new ${field}:`,
                        type: field === 'Amount' ? 'number' : 'input',
                        default: field === 'Name' ? inc.source : (field === 'Amount' ? inc.amount : inc.frequency)
                    }
                ]);
                const updates = {};
                if (field === 'Name')
                    updates.source = value;
                if (field === 'Amount')
                    updates.amount = value;
                if (field === 'Frequency')
                    updates.frequency = value;
                store_1.store.updateIncome(incomeId, updates);
                console.log(chalk_1.default.green('✅ Updated!\n'));
            }
        }
        await pressKey();
        return incomeMenu();
    }
    else if (action.startsWith('del-')) {
        const incomeId = action.replace('del-', '');
        const inc = store_1.store.getIncome().find(i => i.id === incomeId);
        if (inc) {
            const { confirm } = await inquirer_1.default.prompt([
                { type: 'confirm', name: 'confirm', message: `Delete "${inc.source}"?`, default: false }
            ]);
            if (confirm) {
                store_1.store.deleteIncome(incomeId);
                console.log(chalk_1.default.green('✅ Income source deleted!\n'));
            }
        }
        await pressKey();
        return incomeMenu();
    }
}
// === PAYMENT RECORDING ===
async function recordPayment() {
    console.clear();
    console.log(chalk_1.default.cyan.bold('💳 RECORD PAYMENT\n'));
    const debts = (store_1.store.getDebts() || []).filter(d => d.type === 'debt' && d.balance > 0);
    if (debts.length === 0) {
        console.log(chalk_1.default.yellow('No debts to pay.\n'));
        await pressKey();
        return;
    }
    const { debtId } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'debtId',
            message: 'Select debt to pay:',
            choices: [
                ...debts.map(d => ({
                    name: `${d.name} (balance: ${(0, utils_1.formatCurrency)(d.balance)})`,
                    value: d.id
                })),
                new inquirer_1.default.Separator(),
                { name: 'Back', value: 'back' }
            ]
        }
    ]);
    if (debtId === 'back')
        return;
    const { amount } = await inquirer_1.default.prompt([
        { type: 'number', name: 'amount', message: 'Payment amount:' }
    ]);
    if (amount > 0) {
        store_1.store.addTransaction({
            debtId,
            amount,
            date: new Date().toISOString(),
            category: 'payment'
        });
        const debt = store_1.store.getDebt(debtId);
        console.log(chalk_1.default.green(`\n✅ Payment of ${(0, utils_1.formatCurrency)(amount)} recorded!`));
        if (debt) {
            console.log(chalk_1.default.cyan(`   New balance: ${(0, utils_1.formatCurrency)(debt.balance)}\n`));
        }
    }
    await pressKey();
}
// === GOALS MENU ===
async function goalsMenu() {
    console.clear();
    console.log(chalk_1.default.cyan.bold('🎯 GOALS\n'));
    const goals = store_1.store.getGoals() || [];
    if (goals.length === 0) {
        console.log(chalk_1.default.yellow('No goals yet.\n'));
    }
    else {
        const table = require('cli-table3');
        const goalTable = new table({
            head: ['#', 'Goal', 'Progress', 'Due'],
            style: { head: ['cyan'] }
        });
        goals.forEach((g, idx) => {
            goalTable.push([
                `${idx + 1}`,
                g.name,
                `${g.progressPercent}%`,
                g.dueDate
            ]);
        });
        console.log(goalTable.toString());
        console.log();
    }
    const { action } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Choose action:',
            choices: [
                ...(goals.length > 0 ? goals.map(g => ({ name: `Edit: ${g.name}`, value: `edit-${g.id}` })) : []),
                ...(goals.length > 0 ? goals.map(g => ({ name: `Delete: ${g.name}`, value: `del-${g.id}` })) : []),
                new inquirer_1.default.Separator(),
                'Add Goal',
                'Back'
            ]
        }
    ]);
    if (action === 'Back')
        return;
    if (action === 'Add Goal') {
        const answers = await inquirer_1.default.prompt([
            { name: 'name', message: 'Goal Name:' },
            { name: 'progress', type: 'number', message: 'Initial Progress (0-100):', default: 0 },
            { name: 'dueDate', message: 'Due Date (YYYY-MM-DD):' }
        ]);
        store_1.store.addGoal({
            name: answers.name,
            currentAmount: 0,
            dueDate: answers.dueDate,
            progressPercent: answers.progress
        });
        console.log(chalk_1.default.green('✅ Goal added!\n'));
        await pressKey();
        return goalsMenu();
    }
    else if (action.startsWith('edit-')) {
        const goalId = action.replace('edit-', '');
        const goal = goals.find(g => g.id === goalId);
        if (goal) {
            const { field } = await inquirer_1.default.prompt([
                {
                    type: 'list',
                    name: 'field',
                    message: 'What to edit:',
                    choices: ['Name', 'Progress', 'Due Date', 'Back']
                }
            ]);
            if (field !== 'Back') {
                const { value } = await inquirer_1.default.prompt([
                    {
                        name: 'value',
                        message: `Enter new ${field}:`,
                        type: field === 'Progress' ? 'number' : 'input',
                        default: field === 'Name' ? goal.name : (field === 'Progress' ? goal.progressPercent : goal.dueDate)
                    }
                ]);
                const updates = {};
                if (field === 'Name')
                    updates.name = value;
                if (field === 'Progress')
                    updates.progressPercent = value;
                if (field === 'Due Date')
                    updates.dueDate = value;
                store_1.store.updateGoal(goalId, updates);
                console.log(chalk_1.default.green('✅ Updated!\n'));
            }
        }
        await pressKey();
        return goalsMenu();
    }
    else if (action.startsWith('del-')) {
        const goalId = action.replace('del-', '');
        const goal = goals.find(g => g.id === goalId);
        if (goal) {
            const { confirm } = await inquirer_1.default.prompt([
                { type: 'confirm', name: 'confirm', message: `Delete "${goal.name}"?`, default: false }
            ]);
            if (confirm) {
                store_1.store.deleteGoal(goalId);
                console.log(chalk_1.default.green('✅ Goal deleted!\n'));
            }
        }
        await pressKey();
        return goalsMenu();
    }
}
// === SETTINGS MENU ===
async function settingsMenu() {
    console.clear();
    console.log(chalk_1.default.cyan.bold('⚙️  SETTINGS\n'));
    const { action } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Choose setting:',
            choices: [
                'Change Debt Due Dates',
                'Change Bill Due Dates',
                'View Data Directory',
                'Back'
            ]
        }
    ]);
    switch (action) {
        case 'Change Debt Due Dates':
            await editDebtDates();
            break;
        case 'Change Bill Due Dates':
            await editBillDates();
            break;
        case 'View Data Directory':
            console.log(chalk_1.default.dim(`Data stored in: ${process.cwd()}/data/\n`));
            await pressKey();
            break;
    }
    if (action !== 'Back') {
        return settingsMenu();
    }
}
async function editDebtDates() {
    const debts = store_1.store.getDebts();
    const { debtId } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'debtId',
            message: 'Select debt:',
            choices: debts.map(d => ({ name: d.name, value: d.id }))
        }
    ]);
    const { newDate } = await inquirer_1.default.prompt([
        { name: 'newDate', message: 'New due date (day 1-31 or YYYY-MM-DD):' }
    ]);
    store_1.store.updateDebt(debtId, { dueDate: newDate });
    console.log(chalk_1.default.green('✅ Due date updated!\n'));
    await pressKey();
}
async function editBillDates() {
    const bills = store_1.store.getBills();
    const { billId } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'billId',
            message: 'Select bill:',
            choices: bills.map(b => ({ name: b.name, value: b.id }))
        }
    ]);
    const { newDate } = await inquirer_1.default.prompt([
        { name: 'newDate', message: 'New due date (day 1-31 or YYYY-MM-DD):' }
    ]);
    store_1.store.updateBill(billId, { dueDate: newDate });
    console.log(chalk_1.default.green('✅ Due date updated!\n'));
    await pressKey();
}
// === BADGES & STREAKS MENU ===
async function showBadgesMenu() {
    console.clear();
    console.log(chalk_1.default.magenta.bold('\n🏆 BADGES & STREAKS\n'));
    const gam = store_1.store.getGamification();
    const earnedBadges = (0, gamification_1.getEarnedBadges)();
    // Display earned badges
    if (earnedBadges.length > 0) {
        console.log(chalk_1.default.magenta.bold(`✅ Earned Badges (${earnedBadges.length}):\n`));
        earnedBadges.forEach(badge => {
            console.log(chalk_1.default.magenta(`  ${badge.icon} ${badge.name} - ${badge.points} points`));
            if (badge.unlockedDate) {
                console.log(chalk_1.default.dim(`     Unlocked: ${badge.unlockedDate.split('T')[0]}`));
            }
        });
        console.log();
    }
    else {
        console.log(chalk_1.default.yellow('No badges earned yet. Keep working!\n'));
    }
    // Display available badges with progress
    console.log(chalk_1.default.cyan.bold('\n📈 BADGE PROGRESS:\n'));
    gamification_1.DEFAULT_BADGES.forEach(badge => {
        const earned = earnedBadges.find(b => b.id === badge.id);
        if (earned) {
            console.log(chalk_1.default.green(`  ${badge.icon} ${badge.name} ${chalk_1.default.dim('[EARNED]')}`));
        }
        else {
            const progress = (0, gamification_1.getBadgeProgress)(badge.id);
            if (progress) {
                const bar = drawVizBar((progress.progress / progress.required) * 100, 10);
                console.log(chalk_1.default.yellow(`  ${badge.icon} ${badge.name} - ${progress.progress}/${progress.required}`));
                console.log(chalk_1.default.yellow(`     ${bar}`));
            }
            else {
                console.log(chalk_1.default.dim(`  ${badge.icon} ${badge.name}`));
            }
        }
    });
    // Display streaks
    console.log(chalk_1.default.cyan.bold('\n🔥 STREAKS:\n'));
    console.log(chalk_1.default.yellow(`  Current On-Time Streak: ${gam.streaks.onTimePay} days`));
    console.log(chalk_1.default.yellow(`  Best Streak: ${gam.streaks.bestOnTimeStreak} days`));
    console.log(chalk_1.default.magenta(`  Total Chaos Points: ${gam.chaoPoints}`));
    console.log();
    await pressKey();
}
// === DAILY CHALLENGES MENU ===
async function showChallengesMenu() {
    console.clear();
    console.log(chalk_1.default.cyan.bold('\n📅 DAILY CHALLENGES\n'));
    const gam = store_1.store.getGamification();
    const challenge = (0, gamification_1.getTodayChallenge)();
    if (!challenge) {
        console.log(chalk_1.default.green.bold('✅ Challenge completed today! Come back tomorrow for a new one.\n'));
        console.log(chalk_1.default.dim(`Points earned this month: ${gam.chaoPoints}`));
    }
    else {
        console.log(chalk_1.default.cyan(`Today's Challenge: ${chalk_1.default.bold(challenge.title)}\n`));
        console.log(chalk_1.default.white(`${challenge.description}\n`));
        console.log(chalk_1.default.magenta(`Reward: +${challenge.points} Chaos Points\n`));
        const { complete } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'complete',
                message: 'Mark challenge as complete?'
            }
        ]);
        if (complete) {
            const points = (0, gamification_1.completeDailyChallenge)();
            console.log();
            console.log(chalk_1.default.green.bold(`✅ Challenge Complete! +${points} Chaos Points`));
            console.log(chalk_1.default.magenta(`Total Points: ${gam.chaoPoints + points}`));
            console.log();
        }
    }
    await pressKey();
}
// === UTILITIES ===
function drawVizBar(percent, width = 10) {
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    if (percent <= 25)
        return chalk_1.default.red(bar);
    if (percent <= 50)
        return chalk_1.default.yellow(bar);
    if (percent <= 75)
        return chalk_1.default.yellowBright(bar);
    return chalk_1.default.green(bar);
}
async function pressKey() {
    await inquirer_1.default.prompt([{ name: 'continue', type: 'input', message: 'Press Enter to continue...' }]);
}
// Start
if (require.main === module) {
    mainMenu().catch(err => console.error(err));
}
