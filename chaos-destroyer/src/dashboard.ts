import chalk from 'chalk';
import Table from 'cli-table3';
import { store } from './store';
import { formatCurrency, getDaysUntil, drawProgressBar } from './utils';
import { viewRemindersSummary } from './reminders';
import { 
  drawDebtProgressBar, 
  drawBossBar, 
  sectionHeader, 
  drawStatsBox,
  drawProgressBar as drawVizBar
} from './visualizations';
import { 
  getEarnedBadges, 
  getTodayChallenge, 
  getBadgeProgress 
} from './gamification';

export async function showDashboard() {
  const data = store.getData();
  const debts = (data.debts || []).filter(d => d.type === 'debt' && d.balance > 0);
  const bills = data.bills || [];
  const income = (data.income || []).filter(i => !i.isPaused);
  const gam = store.getGamification();
  
  console.clear();
  
  // === HEADER ===
  console.log(chalk.magenta.bold('\n╔════════════════════════════════════════════════════════════════╗'));
  console.log(chalk.magenta.bold('║           ✨ CHAOS DESTROYER - LIFE COMMAND CENTER ✨         ║'));
  console.log(chalk.magenta.bold('╚════════════════════════════════════════════════════════════════╝\n'));

  // === TOP STATS ===
  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const monthlyIncome = calculateMonthlyIncome(income);
  const monthlyBills = bills
    .filter(b => b.frequency === 'monthly')
    .reduce((sum, b) => sum + (b.splitAmount || b.amount), 0);
  const monthlyDebtMin = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const monthlyObligations = monthlyBills + monthlyDebtMin;
  const breathingRoom = monthlyIncome - monthlyObligations;

  const statsTable = new Table({
    head: [chalk.cyan('💰 NET WORTH'), chalk.cyan('📊 CASH FLOW'), chalk.cyan('🏆 CHAOS POINTS'), chalk.cyan('🔥 STREAK')],
    style: { head: [], border: ['grey'] }
  });

  const breathColor = breathingRoom > 0 ? chalk.green : chalk.red;
  statsTable.push([
    chalk.red(formatCurrency(totalDebt)),
    breathColor(formatCurrency(breathingRoom)),
    chalk.magenta(gam.chaoPoints.toString() + ' pts'),
    chalk.yellow(`${gam.streaks.onTimePay} days`)
  ]);
  console.log(statsTable.toString());

  // === BOSS FIGHT SECTION ===
  const chaseDebt = debts.find(d => d.name.toLowerCase().includes('chase'));
  if (chaseDebt) {
    console.log(sectionHeader('⚔️  CURRENT BOSS FIGHT'));
    const originalBal = chaseDebt.originalBalance || chaseDebt.balance;
    const percentRemaining = (chaseDebt.balance / originalBal) * 100;
    const healthBar = drawBossBar(chaseDebt.balance, originalBal, 35);
    
    console.log(chalk.red.bold(`CHASE CC ${healthBar}`));
    console.log(chalk.yellow(`  Progress: ${((originalBal - chaseDebt.balance) / originalBal * 100).toFixed(1)}% defeated`));
    console.log();
  }

  // === BADGES & STREAKS ===
  const earnedBadges = getEarnedBadges();
  if (earnedBadges.length > 0 || gam.streaks.onTimePay > 0) {
    console.log(sectionHeader('🏆 ACHIEVEMENTS'));
    
    if (earnedBadges.length > 0) {
      console.log(chalk.magenta.bold(`Earned Badges (${earnedBadges.length}):`));
      earnedBadges.slice(0, 3).forEach(badge => {
        console.log(`  ${badge.icon} ${chalk.magenta(badge.name)}`);
      });
      console.log();
    }

    if (gam.streaks.onTimePay > 0) {
      console.log(chalk.yellow.bold(`🔥 Current Streak: ${gam.streaks.onTimePay} days!`));
      console.log(chalk.yellow(`📈 Best Streak: ${gam.streaks.bestOnTimeStreak} days`));
      console.log();
    }
  }

  // === TODAY'S CHALLENGE ===
  const todayChallenge = getTodayChallenge();
  if (todayChallenge) {
    console.log(sectionHeader('📅 TODAY\'S CHALLENGE'));
    console.log(chalk.cyan(`  ☐ ${todayChallenge.title}`));
    console.log(chalk.cyan(`     ${todayChallenge.description}`));
    console.log(chalk.magenta(`     +${todayChallenge.points} Chaos Points`));
    console.log();
  }

  // === CASH FLOW BREAKDOWN ===
  console.log(sectionHeader('💰 MONTHLY CASH FLOW'));
  const flowTable = new Table({
    head: ['Category', 'Amount'],
    style: { head: ['cyan'] }
  });
  
  flowTable.push(['Income', chalk.green(formatCurrency(monthlyIncome))]);
  flowTable.push(['Bills', chalk.red(formatCurrency(-monthlyBills))]);
  flowTable.push(['Debt Minimums', chalk.red(formatCurrency(-monthlyDebtMin))]);
  flowTable.push([chalk.bold('Breathing Room'), breathColor(formatCurrency(breathingRoom))]);
  console.log(flowTable.toString());

  // === DEBT PROGRESS WITH VISUAL BARS ===
  console.log(sectionHeader('💳 DEBT PROGRESS'));
  const sortedDebts = [...debts].sort((a, b) => a.payoffPriority - b.payoffPriority);
  
  sortedDebts.forEach((d, idx) => {
    const origBal = d.originalBalance || d.balance;
    const percentPaid = origBal > 0 ? ((origBal - d.balance) / origBal * 100) : 0;
    const progressBar = drawDebtProgressBar(d, 22);
    
    console.log(`${idx + 1}️⃣  ${chalk.cyan(d.name.padEnd(15))} ${progressBar}`);
  });
  console.log();

  // === UPCOMING PAYMENTS ===
  console.log(sectionHeader('📅 DUE SOON (Next 30 Days)'));
  const upcomingTable = new Table({
    head: ['Item', 'Amount', 'Due In', 'Status'],
    style: { head: ['cyan'] }
  });

  const upcoming = [
    ...debts.map(d => ({
      name: d.name,
      amount: d.minimumPayment,
      daysUntil: getDaysUntil(d.dueDate),
      type: 'debt'
    })),
    ...bills.filter(b => b.isRecurring).map(b => ({
      name: b.name,
      amount: b.splitAmount || b.amount,
      daysUntil: getDaysUntil(b.dueDate),
      type: 'bill'
    }))
  ]
    .filter(x => x.daysUntil >= 0 && x.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 8);

  if (upcoming.length === 0) {
    upcomingTable.push([{ colSpan: 4, content: 'No payments due in next 30 days' }]);
  } else {
    upcoming.forEach(pay => {
      let color = chalk.white;
      let status = '📌 Upcoming';
      
      if (pay.daysUntil < 0) {
        color = chalk.red;
        status = '🚨 OVERDUE';
      } else if (pay.daysUntil <= 3) {
        color = chalk.yellow;
        status = '⚡ URGENT';
      } else if (pay.daysUntil <= 7) {
        status = '⏰ Soon';
      }

      upcomingTable.push([
        color(pay.name),
        color(formatCurrency(pay.amount)),
        color(`${pay.daysUntil} days`),
        status
      ]);
    });
  }
  console.log(upcomingTable.toString());

  // === QUICK ALERTS ===
  console.log(sectionHeader('⚡ ALERTS & INSIGHTS'));
  
  // Alert 1: Chase high interest
  const chase = debts.find(d => d.name.includes('Chase'));
  if (chase) {
    const monthlyInterest = chase.balance * (chase.apr / 100 / 12);
    console.log(chalk.red(`  ⚠️  Chase is costing you ${formatCurrency(monthlyInterest)}/month in interest`));
  }

  // Alert 2: Breathing room
  if (breathingRoom > 300) {
    console.log(chalk.green(`  ✅ You have ${formatCurrency(breathingRoom)} breathing room this month`));
  } else if (breathingRoom > 0) {
    console.log(chalk.yellow(`  ⚠️  Tight month: only ${formatCurrency(breathingRoom)} breathing room`));
  } else {
    console.log(chalk.red(`  🚨 ALERT: You're overspent by ${formatCurrency(Math.abs(breathingRoom))}!`));
  }

  // Alert 3: Kill Chase progress
  if (chase) {
    const origBal = chase.originalBalance || chase.balance;
    const percentPaid = origBal > 0 ? ((origBal - chase.balance) / origBal * 100) : 0;
    console.log(chalk.cyan(`  🎯 Boss Progress: ${percentPaid.toFixed(1)}% defeated`));
  }

  // Alert 4: Reminders
  console.log();
  const reminderSummary = await viewRemindersSummary();
  if (reminderSummary) {
    console.log(reminderSummary);
  }

  console.log();
}

function calculateMonthlyIncome(income: any[]): number {
  return income.reduce((sum, inc) => {
    let multiplier = 1;
    if (inc.frequency === 'weekly') multiplier = 4.33;
    if (inc.frequency === 'biweekly') multiplier = 2.16;
    return sum + (inc.amount * multiplier);
  }, 0);
}
