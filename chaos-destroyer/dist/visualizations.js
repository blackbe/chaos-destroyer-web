"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawProgressBar = drawProgressBar;
exports.drawDebtProgressBar = drawDebtProgressBar;
exports.drawBossBar = drawBossBar;
exports.drawInterestPie = drawInterestPie;
exports.drawMonthlyTimeline = drawMonthlyTimeline;
exports.drawBossDefeatBox = drawBossDefeatBox;
exports.drawMilestoneMessage = drawMilestoneMessage;
exports.sectionHeader = sectionHeader;
exports.drawStatsBox = drawStatsBox;
const chalk_1 = __importDefault(require("chalk"));
/**
 * Draw a colored progress bar based on percentage
 * @param percent 0-100
 * @param width number of blocks (default 20)
 */
function drawProgressBar(percent, width = 20) {
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    // Color code: red (0-25%), orange (25-50%), yellow (50-75%), green (75-100%)
    if (percent <= 25)
        return chalk_1.default.red(bar);
    if (percent <= 50)
        return chalk_1.default.yellow(bar);
    if (percent <= 75)
        return chalk_1.default.yellowBright(bar);
    return chalk_1.default.green(bar);
}
/**
 * Draw a debt progress bar with label and amount info
 */
function drawDebtProgressBar(debt, width = 25) {
    const original = debt.originalBalance || debt.balance;
    const percentPaid = original > 0 ? ((original - debt.balance) / original) * 100 : 0;
    const remaining = debt.balance;
    const bar = drawProgressBar(percentPaid, width);
    const percentStr = chalk_1.default.white(`${percentPaid.toFixed(0)}%`);
    return `${bar} ${percentStr} ($${remaining.toFixed(2)})`;
}
/**
 * Draw a horizontal boss health bar
 * @param currentHp remaining balance (HP)
 * @param maxHp original balance
 */
function drawBossBar(currentHp, maxHp, width = 30) {
    const percent = (currentHp / maxHp) * 100;
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const hpColor = percent <= 25 ? chalk_1.default.green : percent <= 50 ? chalk_1.default.yellow : chalk_1.default.red;
    const percentStr = chalk_1.default.white(`${percent.toFixed(0)}%`);
    return `${hpColor(bar)} ${percentStr} HP ($${currentHp.toFixed(2)})`;
}
/**
 * Create a simple ASCII pie chart showing interest vs principal
 */
function drawInterestPie(interestPaid, principalPaid) {
    const total = interestPaid + principalPaid;
    if (total === 0) {
        return ['No payments yet'];
    }
    const interestPercent = (interestPaid / total) * 100;
    const principalPercent = (principalPaid / total) * 100;
    const interestBar = '█'.repeat(Math.round(interestPercent / 5));
    const principalBar = '█'.repeat(Math.round(principalPercent / 5));
    return [
        chalk_1.default.red(`Interest  [${interestBar.padEnd(20, '░')}] ${interestPercent.toFixed(1)}% ($${interestPaid.toFixed(2)})`),
        chalk_1.default.green(`Principal [${principalBar.padEnd(20, '░')}] ${principalPercent.toFixed(1)}% ($${principalPaid.toFixed(2)})`)
    ];
}
/**
 * Draw a monthly timeline table with debt progress
 */
function drawMonthlyTimeline(months) {
    const lines = [];
    // Header
    const monthCol = 'Month'.padEnd(8);
    const debtsHeader = months[0]?.debts.map(d => d.name.slice(0, 8).padEnd(10)).join('') || '';
    const progressCol = 'Progress'.padEnd(10);
    lines.push(chalk_1.default.cyan(`${monthCol}${debtsHeader}${progressCol}`));
    lines.push(chalk_1.default.cyan('─'.repeat(monthCol.length + debtsHeader.length + progressCol.length)));
    // Rows
    months.slice(0, 6).forEach((m, idx) => {
        const monthStr = m.month.padEnd(8);
        const debtBars = m.debts
            .map(d => {
            const bar = drawProgressBar(d.percent, 8);
            return `${bar}  `;
        })
            .join('');
        const progressStr = `${(idx * 2)}%`.padEnd(10);
        lines.push(`${monthStr}${debtBars}${progressStr}`);
    });
    return lines;
}
/**
 * Draw a boss defeat celebration box
 */
function drawBossDefeatBox(debtName, damageDealt, newBoss, badgeEarned) {
    const lines = [];
    const width = 40;
    lines.push(chalk_1.default.magenta('╔' + '═'.repeat(width - 2) + '╗'));
    lines.push(chalk_1.default.magenta(`║${chalk_1.default.yellow('  🎉 ' + debtName.toUpperCase() + ' DEFEATED! 🎉 ').padEnd(width - 1)}║`));
    lines.push(chalk_1.default.magenta('║' + ' '.repeat(width - 2) + '║'));
    lines.push(chalk_1.default.magenta(`║${('  You\'ve dealt the final blow!').padEnd(width - 1)}║`));
    lines.push(chalk_1.default.magenta(`║${(debtName + ' CC is DESTROYED').padEnd(width - 1)}║`));
    lines.push(chalk_1.default.magenta('║' + ' '.repeat(width - 2) + '║'));
    lines.push(chalk_1.default.magenta(`║${chalk_1.default.green(`  Damage dealt: $${damageDealt.toFixed(2)}  `).padEnd(width - 1)}║`));
    if (newBoss) {
        lines.push(chalk_1.default.magenta(`║${chalk_1.default.yellow(`  New boss: ${newBoss}  `).padEnd(width - 1)}║`));
    }
    lines.push(chalk_1.default.magenta(`║${chalk_1.default.cyan('  Reward: +200 Chaos Points  ').padEnd(width - 1)}║`));
    if (badgeEarned) {
        lines.push(chalk_1.default.magenta(`║${chalk_1.default.magenta(`  Badge: ${badgeEarned}  `).padEnd(width - 1)}║`));
    }
    lines.push(chalk_1.default.magenta('║' + ' '.repeat(width - 2) + '║'));
    lines.push(chalk_1.default.magenta('╚' + '═'.repeat(width - 2) + '╝'));
    return lines;
}
/**
 * Draw a milestone celebration message
 */
function drawMilestoneMessage(message, emoji = '🎯') {
    const lines = [];
    const width = message.length + 4;
    lines.push(chalk_1.default.yellow('╔' + '═'.repeat(width) + '╗'));
    lines.push(chalk_1.default.yellow(`║  ${emoji} ${message}  ${emoji}  ║`));
    lines.push(chalk_1.default.yellow('╚' + '═'.repeat(width) + '╝'));
    return lines;
}
/**
 * Format a section header with emojis and styling
 */
function sectionHeader(title, emoji = '📊') {
    return chalk_1.default.cyan.bold(`\n${emoji}  ${title}\n`);
}
/**
 * Draw a stats box
 */
function drawStatsBox(stats) {
    const lines = [];
    const maxLabel = Math.max(...stats.map(s => s.label.length));
    const maxValue = Math.max(...stats.map(s => s.value.length));
    const boxWidth = maxLabel + maxValue + 5;
    lines.push(chalk_1.default.cyan('╔' + '═'.repeat(boxWidth) + '╗'));
    stats.forEach(stat => {
        const label = stat.label.padEnd(maxLabel);
        const value = stat.value.padStart(maxValue);
        const colorFn = stat.color || chalk_1.default.white;
        lines.push(chalk_1.default.cyan(`║  ${label} : ${colorFn(value)}  ║`));
    });
    lines.push(chalk_1.default.cyan('╚' + '═'.repeat(boxWidth) + '╝'));
    return lines;
}
exports.default = {
    drawProgressBar,
    drawDebtProgressBar,
    drawBossBar,
    drawInterestPie,
    drawMonthlyTimeline,
    drawBossDefeatBox,
    drawMilestoneMessage,
    sectionHeader,
    drawStatsBox
};
