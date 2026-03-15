"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showExportMenu = showExportMenu;
const fs_extra_1 = __importDefault(require("fs-extra"));
const store_1 = require("./store");
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
async function showExportMenu() {
    console.clear();
    console.log(chalk_1.default.cyan.bold('📤 EXPORT & REPORTS\n'));
    const { format } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'format',
            message: 'Choose export format:',
            choices: [
                'JSON (full snapshot)',
                'CSV (debts)',
                'CSV (bills)',
                'CSV (transactions)',
                'CSV (all)',
                'Monthly Report (text)',
                'Back'
            ]
        }
    ]);
    if (format === 'Back')
        return;
    const data = store_1.store.getData();
    const timestamp = new Date().toISOString().split('T')[0];
    const exportDir = path_1.default.join(process.cwd(), 'exports');
    fs_extra_1.default.mkdirpSync(exportDir);
    let filename = '';
    let content = '';
    let mimeType = 'application/octet-stream';
    if (format === 'JSON (full snapshot)') {
        filename = `chaos-destroyer-export-${timestamp}.json`;
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
    }
    else if (format === 'CSV (debts)') {
        filename = `chaos-destroyer-debts-${timestamp}.csv`;
        content = exportDebtsCSV(data.debts);
        mimeType = 'text/csv';
    }
    else if (format === 'CSV (bills)') {
        filename = `chaos-destroyer-bills-${timestamp}.csv`;
        content = exportBillsCSV(data.bills);
        mimeType = 'text/csv';
    }
    else if (format === 'CSV (transactions)') {
        filename = `chaos-destroyer-transactions-${timestamp}.csv`;
        content = exportTransactionsCSV(data.transactions);
        mimeType = 'text/csv';
    }
    else if (format === 'CSV (all)') {
        // Create multiple CSVs in a summary
        filename = `chaos-destroyer-all-${timestamp}`;
        exportMultipleCSV(exportDir, data, timestamp);
        console.log(chalk_1.default.green(`\n✅ Exported to ${exportDir}:`));
        console.log(`  • chaos-destroyer-debts-${timestamp}.csv`);
        console.log(`  • chaos-destroyer-bills-${timestamp}.csv`);
        console.log(`  • chaos-destroyer-transactions-${timestamp}.csv`);
        console.log(`  • chaos-destroyer-income-${timestamp}.csv\n`);
        await pressKey();
        return;
    }
    else if (format === 'Monthly Report (text)') {
        filename = `chaos-destroyer-report-${timestamp}.txt`;
        content = generateMonthlyReport(data);
        mimeType = 'text/plain';
    }
    if (content) {
        const fullPath = path_1.default.join(exportDir, filename);
        fs_extra_1.default.writeFileSync(fullPath, content);
        console.log(chalk_1.default.green(`\n✅ Exported to: ${fullPath}\n`));
    }
    await pressKey();
}
function exportDebtsCSV(debts) {
    const headers = 'ID,Name,Balance,APR,Min Payment,Due Date,Priority\n';
    const rows = debts
        .filter(d => d.type === 'debt')
        .map(d => `"${d.id}","${d.name}",${d.balance},${d.apr},${d.minimumPayment},"${d.dueDate}",${d.payoffPriority}`)
        .join('\n');
    return headers + rows;
}
function exportBillsCSV(bills) {
    const headers = 'ID,Name,Amount,Due Date,Frequency,Category,Is Recurring\n';
    const rows = bills
        .map(b => `"${b.id}","${b.name}",${b.amount},"${b.dueDate}","${b.frequency}","${b.category}",${b.isRecurring}`)
        .join('\n');
    return headers + rows;
}
function exportTransactionsCSV(transactions) {
    const headers = 'ID,Date,Amount,Debt ID,Bill ID,Category,Description\n';
    const rows = transactions
        .map(t => `"${t.id}","${t.date}",${t.amount},"${t.debtId || ''}","${t.billId || ''}","${t.category}","${t.description || ''}"`)
        .join('\n');
    return headers + rows;
}
function exportMultipleCSV(dir, data, timestamp) {
    fs_extra_1.default.writeFileSync(path_1.default.join(dir, `chaos-destroyer-debts-${timestamp}.csv`), exportDebtsCSV(data.debts));
    fs_extra_1.default.writeFileSync(path_1.default.join(dir, `chaos-destroyer-bills-${timestamp}.csv`), exportBillsCSV(data.bills));
    fs_extra_1.default.writeFileSync(path_1.default.join(dir, `chaos-destroyer-transactions-${timestamp}.csv`), exportTransactionsCSV(data.transactions));
    const incomeHeaders = 'ID,Source,Amount,Frequency,Is Paused\n';
    const incomeRows = data.income
        .map((i) => `"${i.id}","${i.source}",${i.amount},"${i.frequency}",${i.isPaused || false}`)
        .join('\n');
    fs_extra_1.default.writeFileSync(path_1.default.join(dir, `chaos-destroyer-income-${timestamp}.csv`), incomeHeaders + incomeRows);
}
function generateMonthlyReport(data) {
    const date = new Date();
    const sep = '═'.repeat(65);
    const dash = '─'.repeat(65);
    let report = '\n' + sep + '\n';
    report += 'CHAOS DESTROYER - MONTHLY FINANCIAL REPORT\n';
    report += sep + '\n\n';
    const month = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    report += `SUMMARY (${month})\n`;
    report += dash + '\n';
    // Summary
    const debts = data.debts.filter((d) => d.type === 'debt');
    const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
    const income = data.income.filter((i) => !i.isPaused);
    const monthlyIncome = income.reduce((sum, i) => {
        let mult = 1;
        if (i.frequency === 'weekly')
            mult = 4.33;
        if (i.frequency === 'biweekly')
            mult = 2.16;
        return sum + (i.amount * mult);
    }, 0);
    const bills = data.bills.filter((b) => b.frequency === 'monthly');
    const monthlyBillTotal = bills.reduce((sum, b) => sum + (b.splitAmount || b.amount), 0);
    const minDebtPayments = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
    const monthlyObligations = monthlyBillTotal + minDebtPayments;
    const breathingRoom = monthlyIncome - monthlyObligations;
    const gam = data.gamification || { chaoPoints: 0, streaks: { onTimePay: 0 }, badges: [] };
    report += `Total Debt:\t\t\t${(0, utils_1.formatCurrency)(totalDebt)}\n`;
    report += `Monthly Income:\t\t\t${(0, utils_1.formatCurrency)(monthlyIncome)}\n`;
    report += `Monthly Obligations:\t\t${(0, utils_1.formatCurrency)(monthlyObligations)}\n`;
    report += `Monthly Breathing Room:\t\t${(0, utils_1.formatCurrency)(breathingRoom)}\n`;
    report += `Chaos Points Earned:\t\t${gam.chaoPoints}\n\n`;
    // Debt Status
    report += 'PROGRESS\n';
    report += dash + '\n';
    let totalPaidDown = 0;
    let totalInterestPaid = 0;
    debts.forEach((d) => {
        const original = d.originalBalance || d.balance;
        const paid = original - d.balance;
        totalPaidDown += paid;
        const monthlyInt = d.balance * (d.apr / 100 / 12);
        totalInterestPaid += monthlyInt;
    });
    report += `Debt Paid Down:\t\t\t${(0, utils_1.formatCurrency)(totalPaidDown)}\n`;
    report += `Interest Paid This Month:\t${(0, utils_1.formatCurrency)(totalInterestPaid)}\n`;
    const earnedBadges = gam.badges ? gam.badges.filter((b) => b.earned).length : 0;
    report += `Badges Earned:\t\t\t${earnedBadges}\n`;
    report += `Current Streak:\t\t\t${gam.streaks?.onTimePay || 0} days on-time\n\n`;
    // Debts breakdown
    report += 'DEBT STATUS\n';
    report += dash + '\n';
    const sortedDebts = [...debts].sort((a, b) => a.payoffPriority - b.payoffPriority);
    sortedDebts.forEach((d, idx) => {
        const original = d.originalBalance || d.balance;
        const percentPaid = original > 0 ? ((original - d.balance) / original) * 100 : 0;
        const bar = createProgressBar(percentPaid, 15);
        report += `${idx + 1}. ${d.name}\t${bar} ${percentPaid.toFixed(0)}% | ${(0, utils_1.formatCurrency)(d.balance)} | ${d.apr}% APR\n`;
    });
    report += '\n';
    // Bills breakdown
    report += 'MONTHLY BILLS\n';
    report += dash + '\n';
    const monthlyBills = data.bills.filter((b) => b.frequency === 'monthly' || b.frequency === 'biweekly');
    const totalBills = monthlyBills.reduce((sum, b) => sum + (b.splitAmount || b.amount), 0);
    monthlyBills.forEach((b) => {
        report += `${b.name}: ${(0, utils_1.formatCurrency)(b.splitAmount || b.amount)} (Due: ${b.dueDate})\n`;
    });
    report += dash + '\n';
    report += `Total Monthly Bills: ${(0, utils_1.formatCurrency)(totalBills)}\n\n`;
    // Income breakdown
    report += 'MONTHLY INCOME\n';
    report += dash + '\n';
    income.forEach((i) => {
        let monthlyAmount = i.amount;
        if (i.frequency === 'weekly')
            monthlyAmount = i.amount * 4.33;
        if (i.frequency === 'biweekly')
            monthlyAmount = i.amount * 2.16;
        report += `${i.source}: ${(0, utils_1.formatCurrency)(monthlyAmount)}\n`;
    });
    report += dash + '\n';
    report += `Total Monthly Income: ${(0, utils_1.formatCurrency)(monthlyIncome)}\n\n`;
    // Cash flow
    const monthlyBillsForFlow = data.bills.filter((b) => b.frequency === 'monthly' || b.frequency === 'biweekly').reduce((sum, b) => sum + (b.splitAmount || b.amount), 0);
    const totalObligationsFlow = monthlyBillsForFlow + minDebtPayments;
    const cashFlow = monthlyIncome - totalObligationsFlow;
    report += 'CASH FLOW ANALYSIS\n';
    report += dash + '\n';
    report += `Monthly Income: ${(0, utils_1.formatCurrency)(monthlyIncome)}\n`;
    report += `Monthly Bills: ${(0, utils_1.formatCurrency)(-totalBills)}\n`;
    report += `Min Debt Payments: ${(0, utils_1.formatCurrency)(-minDebtPayments)}\n`;
    report += `Available for Payoff: ${(0, utils_1.formatCurrency)(cashFlow)}\n\n`;
    // Interest calculation
    report += 'INTEREST ANALYSIS\n';
    report += dash + '\n';
    let totalMonthlyInterest = 0;
    sortedDebts.forEach((d) => {
        const monthlyInt = d.balance * (d.apr / 100 / 12);
        totalMonthlyInterest += monthlyInt;
        report += `${d.name}: ${(0, utils_1.formatCurrency)(monthlyInt)}/month\n`;
    });
    report += dash + '\n';
    report += `Total Monthly Interest Cost: ${(0, utils_1.formatCurrency)(totalMonthlyInterest)}\n\n`;
    // Goals
    if (data.goals && data.goals.length > 0) {
        report += 'GOALS\n';
        report += dash + '\n';
        data.goals.forEach((g) => {
            report += `${g.name}: ${g.progressPercent}% complete\n`;
        });
        report += '\n';
    }
    // Next Steps
    report += 'NEXT STEPS\n';
    report += dash + '\n';
    const topDebt = sortedDebts[0];
    if (topDebt) {
        const original = topDebt.originalBalance || topDebt.balance;
        const percentPaid = original > 0 ? ((original - topDebt.balance) / original) * 100 : 0;
        const monthsLeft = topDebt.balance > 0 ? Math.ceil(topDebt.balance / topDebt.minimumPayment) : 0;
        report += `• Focus on ${topDebt.name}: ${percentPaid.toFixed(0)}% defeated, ~${monthsLeft} months to victory ⚔️\n`;
    }
    if (gam.streaks?.onTimePay > 0) {
        report += `• Keep up consistency streak: Currently ${gam.streaks.onTimePay} days! 🔥\n`;
    }
    if (breathingRoom > 0) {
        report += `• Consider extra payments with breathing room: ${(0, utils_1.formatCurrency)(breathingRoom)}\n`;
    }
    if (earnedBadges < 3) {
        report += `• Unlock more badges: ${earnedBadges}/6 earned\n`;
    }
    report += `• Next check-in: ${new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    report += '\n';
    report += sep + '\n';
    report += `Generated: ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | Next report: ${new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    return report;
}
function createProgressBar(percent, width = 15) {
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}
async function pressKey() {
    await inquirer_1.default.prompt([{ name: 'continue', type: 'input', message: 'Press Enter to continue...' }]);
}
