import chalk from 'chalk';
import { Debt } from './models';

/**
 * Draw a colored progress bar based on percentage
 * @param percent 0-100
 * @param width number of blocks (default 20)
 */
export function drawProgressBar(percent: number, width: number = 20): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);

  // Color code: red (0-25%), orange (25-50%), yellow (50-75%), green (75-100%)
  if (percent <= 25) return chalk.red(bar);
  if (percent <= 50) return chalk.yellow(bar);
  if (percent <= 75) return chalk.yellowBright(bar);
  return chalk.green(bar);
}

/**
 * Draw a debt progress bar with label and amount info
 */
export function drawDebtProgressBar(
  debt: Debt,
  width: number = 25
): string {
  const original = debt.originalBalance || debt.balance;
  const percentPaid = original > 0 ? ((original - debt.balance) / original) * 100 : 0;
  const remaining = debt.balance;

  const bar = drawProgressBar(percentPaid, width);
  const percentStr = chalk.white(`${percentPaid.toFixed(0)}%`);

  return `${bar} ${percentStr} ($${remaining.toFixed(2)})`;
}

/**
 * Draw a horizontal boss health bar
 * @param currentHp remaining balance (HP)
 * @param maxHp original balance
 */
export function drawBossBar(currentHp: number, maxHp: number, width: number = 30): string {
  const percent = (currentHp / maxHp) * 100;
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);

  const hpColor = percent <= 25 ? chalk.green : percent <= 50 ? chalk.yellow : chalk.red;
  const percentStr = chalk.white(`${percent.toFixed(0)}%`);

  return `${hpColor(bar)} ${percentStr} HP ($${currentHp.toFixed(2)})`;
}

/**
 * Create a simple ASCII pie chart showing interest vs principal
 */
export function drawInterestPie(interestPaid: number, principalPaid: number): string[] {
  const total = interestPaid + principalPaid;
  if (total === 0) {
    return ['No payments yet'];
  }

  const interestPercent = (interestPaid / total) * 100;
  const principalPercent = (principalPaid / total) * 100;

  const interestBar = '█'.repeat(Math.round(interestPercent / 5));
  const principalBar = '█'.repeat(Math.round(principalPercent / 5));

  return [
    chalk.red(`Interest  [${interestBar.padEnd(20, '░')}] ${interestPercent.toFixed(1)}% ($${interestPaid.toFixed(2)})`),
    chalk.green(`Principal [${principalBar.padEnd(20, '░')}] ${principalPercent.toFixed(1)}% ($${principalPaid.toFixed(2)})`)
  ];
}

/**
 * Draw a monthly timeline table with debt progress
 */
export function drawMonthlyTimeline(
  months: Array<{ month: string; debts: { name: string; percent: number }[] }>
): string[] {
  const lines: string[] = [];

  // Header
  const monthCol = 'Month'.padEnd(8);
  const debtsHeader = months[0]?.debts.map(d => d.name.slice(0, 8).padEnd(10)).join('') || '';
  const progressCol = 'Progress'.padEnd(10);
  
  lines.push(chalk.cyan(`${monthCol}${debtsHeader}${progressCol}`));
  lines.push(chalk.cyan('─'.repeat(monthCol.length + debtsHeader.length + progressCol.length)));

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
export function drawBossDefeatBox(debtName: string, damageDealt: number, newBoss?: string, badgeEarned?: string): string[] {
  const lines: string[] = [];
  const width = 40;

  lines.push(chalk.magenta('╔' + '═'.repeat(width - 2) + '╗'));
  lines.push(chalk.magenta(`║${chalk.yellow('  🎉 ' + debtName.toUpperCase() + ' DEFEATED! 🎉 ').padEnd(width - 1)}║`));
  lines.push(chalk.magenta('║' + ' '.repeat(width - 2) + '║'));
  lines.push(chalk.magenta(`║${('  You\'ve dealt the final blow!').padEnd(width - 1)}║`));
  lines.push(chalk.magenta(`║${(debtName + ' CC is DESTROYED').padEnd(width - 1)}║`));
  lines.push(chalk.magenta('║' + ' '.repeat(width - 2) + '║'));
  lines.push(chalk.magenta(`║${chalk.green(`  Damage dealt: $${damageDealt.toFixed(2)}  `).padEnd(width - 1)}║`));
  if (newBoss) {
    lines.push(chalk.magenta(`║${chalk.yellow(`  New boss: ${newBoss}  `).padEnd(width - 1)}║`));
  }
  lines.push(chalk.magenta(`║${chalk.cyan('  Reward: +200 Chaos Points  ').padEnd(width - 1)}║`));
  if (badgeEarned) {
    lines.push(chalk.magenta(`║${chalk.magenta(`  Badge: ${badgeEarned}  `).padEnd(width - 1)}║`));
  }
  lines.push(chalk.magenta('║' + ' '.repeat(width - 2) + '║'));
  lines.push(chalk.magenta('╚' + '═'.repeat(width - 2) + '╝'));

  return lines;
}

/**
 * Draw a milestone celebration message
 */
export function drawMilestoneMessage(message: string, emoji: string = '🎯'): string[] {
  const lines: string[] = [];
  const width = message.length + 4;

  lines.push(chalk.yellow('╔' + '═'.repeat(width) + '╗'));
  lines.push(chalk.yellow(`║  ${emoji} ${message}  ${emoji}  ║`));
  lines.push(chalk.yellow('╚' + '═'.repeat(width) + '╝'));

  return lines;
}

/**
 * Format a section header with emojis and styling
 */
export function sectionHeader(title: string, emoji: string = '📊'): string {
  return chalk.cyan.bold(`\n${emoji}  ${title}\n`);
}

/**
 * Draw a stats box
 */
export function drawStatsBox(stats: { label: string; value: string; color?: (s: string) => string }[]): string[] {
  const lines: string[] = [];
  const maxLabel = Math.max(...stats.map(s => s.label.length));
  const maxValue = Math.max(...stats.map(s => s.value.length));
  const boxWidth = maxLabel + maxValue + 5;

  lines.push(chalk.cyan('╔' + '═'.repeat(boxWidth) + '╗'));

  stats.forEach(stat => {
    const label = stat.label.padEnd(maxLabel);
    const value = stat.value.padStart(maxValue);
    const colorFn = stat.color || chalk.white;
    lines.push(chalk.cyan(`║  ${label} : ${colorFn(value)}  ║`));
  });

  lines.push(chalk.cyan('╚' + '═'.repeat(boxWidth) + '╝'));

  return lines;
}

export default {
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
