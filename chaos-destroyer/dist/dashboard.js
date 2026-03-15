"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showDashboard = showDashboard;
const chalk_1 = __importDefault(require("chalk"));
const cli_table3_1 = __importDefault(require("cli-table3"));
const store_1 = require("./store");
const utils_1 = require("./utils");
const reminders_1 = require("./reminders");
const visualizations_1 = require("./visualizations");
const gamification_1 = require("./gamification");
async function showDashboard() {
    const data = store_1.store.getData();
    const debts = (data.debts || []).filter(d => d.type === 'debt' && d.balance > 0);
    const bills = data.bills || [];
    const income = (data.income || []).filter(i => !i.isPaused);
    const gam = store_1.store.getGamification();
    console.clear();
    // === HEADER ===
    console.log(chalk_1.default.magenta.bold('\n╔════════════════════════════════════════════════════════════════╗'));
    console.log(chalk_1.default.magenta.bold('║           ✨ CHAOS DESTROYER - LIFE COMMAND CENTER ✨         ║'));
    console.log(chalk_1.default.magenta.bold('╚════════════════════════════════════════════════════════════════╝\n'));
    // === TOP STATS ===
    const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
    const monthlyIncome = calculateMonthlyIncome(income);
    const monthlyBills = bills
        .filter(b => b.frequency === 'monthly')
        .reduce((sum, b) => sum + (b.splitAmount || b.amount), 0);
    const monthlyDebtMin = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
    const monthlyObligations = monthlyBills + monthlyDebtMin;
    const breathingRoom = monthlyIncome - monthlyObligations;
    const statsTable = new cli_table3_1.default({
        head: [chalk_1.default.cyan('💰 NET WORTH'), chalk_1.default.cyan('📊 CASH FLOW'), chalk_1.default.cyan('🏆 CHAOS POINTS'), chalk_1.default.cyan('🔥 STREAK')],
        style: { head: [], border: ['grey'] }
    });
    const breathColor = breathingRoom > 0 ? chalk_1.default.green : chalk_1.default.red;
    statsTable.push([
        chalk_1.default.red((0, utils_1.formatCurrency)(totalDebt)),
        breathColor((0, utils_1.formatCurrency)(breathingRoom)),
        chalk_1.default.magenta(gam.chaoPoints.toString() + ' pts'),
        chalk_1.default.yellow(`${gam.streaks.onTimePay} days`)
    ]);
    console.log(statsTable.toString());
    // === BOSS FIGHT SECTION ===
    const chaseDebt = debts.find(d => d.name.toLowerCase().includes('chase'));
    if (chaseDebt) {
        console.log((0, visualizations_1.sectionHeader)('⚔️  CURRENT BOSS FIGHT'));
        const originalBal = chaseDebt.originalBalance || chaseDebt.balance;
        const percentRemaining = (chaseDebt.balance / originalBal) * 100;
        const healthBar = (0, visualizations_1.drawBossBar)(chaseDebt.balance, originalBal, 35);
        console.log(chalk_1.default.red.bold(`CHASE CC ${healthBar}`));
        console.log(chalk_1.default.yellow(`  Progress: ${((originalBal - chaseDebt.balance) / originalBal * 100).toFixed(1)}% defeated`));
        console.log();
    }
    // === BADGES & STREAKS ===
    const earnedBadges = (0, gamification_1.getEarnedBadges)();
    if (earnedBadges.length > 0 || gam.streaks.onTimePay > 0) {
        console.log((0, visualizations_1.sectionHeader)('🏆 ACHIEVEMENTS'));
        if (earnedBadges.length > 0) {
            console.log(chalk_1.default.magenta.bold(`Earned Badges (${earnedBadges.length}):`));
            earnedBadges.slice(0, 3).forEach(badge => {
                console.log(`  ${badge.icon} ${chalk_1.default.magenta(badge.name)}`);
            });
            console.log();
        }
        if (gam.streaks.onTimePay > 0) {
            console.log(chalk_1.default.yellow.bold(`🔥 Current Streak: ${gam.streaks.onTimePay} days!`));
            console.log(chalk_1.default.yellow(`📈 Best Streak: ${gam.streaks.bestOnTimeStreak} days`));
            console.log();
        }
    }
    // === TODAY'S CHALLENGE ===
    const todayChallenge = (0, gamification_1.getTodayChallenge)();
    if (todayChallenge) {
        console.log((0, visualizations_1.sectionHeader)('📅 TODAY\'S CHALLENGE'));
        console.log(chalk_1.default.cyan(`  ☐ ${todayChallenge.title}`));
        console.log(chalk_1.default.cyan(`     ${todayChallenge.description}`));
        console.log(chalk_1.default.magenta(`     +${todayChallenge.points} Chaos Points`));
        console.log();
    }
    // === CASH FLOW BREAKDOWN ===
    console.log((0, visualizations_1.sectionHeader)('💰 MONTHLY CASH FLOW'));
    const flowTable = new cli_table3_1.default({
        head: ['Category', 'Amount'],
        style: { head: ['cyan'] }
    });
    flowTable.push(['Income', chalk_1.default.green((0, utils_1.formatCurrency)(monthlyIncome))]);
    flowTable.push(['Bills', chalk_1.default.red((0, utils_1.formatCurrency)(-monthlyBills))]);
    flowTable.push(['Debt Minimums', chalk_1.default.red((0, utils_1.formatCurrency)(-monthlyDebtMin))]);
    flowTable.push([chalk_1.default.bold('Breathing Room'), breathColor((0, utils_1.formatCurrency)(breathingRoom))]);
    console.log(flowTable.toString());
    // === DEBT PROGRESS WITH VISUAL BARS ===
    console.log((0, visualizations_1.sectionHeader)('💳 DEBT PROGRESS'));
    const sortedDebts = [...debts].sort((a, b) => a.payoffPriority - b.payoffPriority);
    sortedDebts.forEach((d, idx) => {
        const origBal = d.originalBalance || d.balance;
        const percentPaid = origBal > 0 ? ((origBal - d.balance) / origBal * 100) : 0;
        const progressBar = (0, visualizations_1.drawDebtProgressBar)(d, 22);
        console.log(`${idx + 1}️⃣  ${chalk_1.default.cyan(d.name.padEnd(15))} ${progressBar}`);
    });
    console.log();
    // === UPCOMING PAYMENTS ===
    console.log((0, visualizations_1.sectionHeader)('📅 DUE SOON (Next 30 Days)'));
    const upcomingTable = new cli_table3_1.default({
        head: ['Item', 'Amount', 'Due In', 'Status'],
        style: { head: ['cyan'] }
    });
    const upcoming = [
        ...debts.map(d => ({
            name: d.name,
            amount: d.minimumPayment,
            daysUntil: (0, utils_1.getDaysUntil)(d.dueDate),
            type: 'debt'
        })),
        ...bills.filter(b => b.isRecurring).map(b => ({
            name: b.name,
            amount: b.splitAmount || b.amount,
            daysUntil: (0, utils_1.getDaysUntil)(b.dueDate),
            type: 'bill'
        }))
    ]
        .filter(x => x.daysUntil >= 0 && x.daysUntil <= 30)
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, 8);
    if (upcoming.length === 0) {
        upcomingTable.push([{ colSpan: 4, content: 'No payments due in next 30 days' }]);
    }
    else {
        upcoming.forEach(pay => {
            let color = chalk_1.default.white;
            let status = '📌 Upcoming';
            if (pay.daysUntil < 0) {
                color = chalk_1.default.red;
                status = '🚨 OVERDUE';
            }
            else if (pay.daysUntil <= 3) {
                color = chalk_1.default.yellow;
                status = '⚡ URGENT';
            }
            else if (pay.daysUntil <= 7) {
                status = '⏰ Soon';
            }
            upcomingTable.push([
                color(pay.name),
                color((0, utils_1.formatCurrency)(pay.amount)),
                color(`${pay.daysUntil} days`),
                status
            ]);
        });
    }
    console.log(upcomingTable.toString());
    // === QUICK ALERTS ===
    console.log((0, visualizations_1.sectionHeader)('⚡ ALERTS & INSIGHTS'));
    // Alert 1: Chase high interest
    const chase = debts.find(d => d.name.includes('Chase'));
    if (chase) {
        const monthlyInterest = chase.balance * (chase.apr / 100 / 12);
        console.log(chalk_1.default.red(`  ⚠️  Chase is costing you ${(0, utils_1.formatCurrency)(monthlyInterest)}/month in interest`));
    }
    // Alert 2: Breathing room
    if (breathingRoom > 300) {
        console.log(chalk_1.default.green(`  ✅ You have ${(0, utils_1.formatCurrency)(breathingRoom)} breathing room this month`));
    }
    else if (breathingRoom > 0) {
        console.log(chalk_1.default.yellow(`  ⚠️  Tight month: only ${(0, utils_1.formatCurrency)(breathingRoom)} breathing room`));
    }
    else {
        console.log(chalk_1.default.red(`  🚨 ALERT: You're overspent by ${(0, utils_1.formatCurrency)(Math.abs(breathingRoom))}!`));
    }
    // Alert 3: Kill Chase progress
    if (chase) {
        const origBal = chase.originalBalance || chase.balance;
        const percentPaid = origBal > 0 ? ((origBal - chase.balance) / origBal * 100) : 0;
        console.log(chalk_1.default.cyan(`  🎯 Boss Progress: ${percentPaid.toFixed(1)}% defeated`));
    }
    // Alert 4: Reminders
    console.log();
    const reminderSummary = await (0, reminders_1.viewRemindersSummary)();
    if (reminderSummary) {
        console.log(reminderSummary);
    }
    console.log();
}
function calculateMonthlyIncome(income) {
    return income.reduce((sum, inc) => {
        let multiplier = 1;
        if (inc.frequency === 'weekly')
            multiplier = 4.33;
        if (inc.frequency === 'biweekly')
            multiplier = 2.16;
        return sum + (inc.amount * multiplier);
    }, 0);
}
