import { store } from './store';
import { Debt, PayoffProjection } from './models';
import Table from 'cli-table3';
import chalk from 'chalk';
import { formatCurrency, getDaysUntil, addMonths } from './utils';
import inquirer from 'inquirer';

interface SimulatedDebt {
  id: string;
  name: string;
  apr: number;
  balance: number;
  minimumPayment: number;
  priority: number;
  monthsToPayoff: number;
  totalInterest: number;
  interestPerMonth: number;
}

export async function runPayoffPlanner() {
  console.clear();
  console.log(chalk.cyan.bold('🏔️  DEBT DESTROYER - PAYOFF PLANNER\n'));
  
  const debts = (store.getDebts() || []).filter(d => d.type === 'debt' && d.balance > 0);
  
  if (debts.length === 0) {
    console.log(chalk.yellow('No debts to plan. You\'re debt-free! 🎉'));
    await pressKey();
    return;
  }

  // Calculate current monthly obligations
  const income = (store.getIncome() || []).filter(i => !i.isPaused);
  const totalMonthlyIncome = calculateMonthlyIncome(income);
  const minObligations = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const extraCash = totalMonthlyIncome - minObligations;

  console.log(chalk.dim(`Total Monthly Income: ${formatCurrency(totalMonthlyIncome)}`));
  console.log(chalk.dim(`Min Obligations:      ${formatCurrency(minObligations)}`));
  console.log(chalk.green(`Available for Payoff Acceleration: ${formatCurrency(extraCash)}\n`));

  if (extraCash <= 0) {
    console.log(chalk.red("⚠️  No extra cash available to accelerate payoff."));
    console.log(chalk.red("    Focus on increasing income or reducing expenses.\n"));
    await pressKey();
    return;
  }

  // Show menu
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Choose an action:',
      choices: [
        'View Default Plan (Avalanche)',
        'Run Scenario (custom extra payment)',
        'Compare Strategies',
        'Back'
      ]
    }
  ]);

  switch (action) {
    case 'View Default Plan (Avalanche)':
      viewDefaultPlan(debts, extraCash, totalMonthlyIncome, minObligations);
      break;
    case 'Run Scenario (custom extra payment)':
      await runScenario(debts, minObligations, totalMonthlyIncome);
      break;
    case 'Compare Strategies':
      compareStrategies(debts, extraCash, minObligations);
      break;
  }

  await pressKey();
}

function calculateMonthlyIncome(income: any[]): number {
  return income.reduce((sum, inc) => {
    let multiplier = 1;
    if (inc.frequency === 'weekly') multiplier = 4.33;
    if (inc.frequency === 'biweekly') multiplier = 2.16;
    return sum + (inc.amount * multiplier);
  }, 0);
}

function viewDefaultPlan(debts: Debt[], extraCash: number, totalIncome: number, minObligation: number) {
  console.clear();
  console.log(chalk.cyan.bold('📊 DEFAULT PAYOFF PLAN (AVALANCHE METHOD)\n'));
  
  // Sort by APR (Avalanche)
  const sorted = [...debts].sort((a, b) => b.apr - a.apr);
  
  console.log(chalk.yellow('Kill Chase First Strategy - Sorted by APR (Highest First):\n'));
  const orderTable = new Table({
    head: ['Priority', 'Debt', 'Balance', 'APR', 'Min Pay'],
    style: { head: ['cyan'] }
  });

  sorted.forEach((d, idx) => {
    const color = idx === 0 ? chalk.red : chalk.white;
    orderTable.push([
      color(`${idx + 1}`),
      color(d.name),
      color(formatCurrency(d.balance)),
      color(`${d.apr}%`),
      color(formatCurrency(d.minimumPayment))
    ]);
  });
  console.log(orderTable.toString());

  // Simulate payoff
  const simulation = simulatePayoff(sorted, extraCash, minObligation);
  
  console.log(chalk.bold('\n💰 SIMULATION RESULTS\n'));
  
  const resultTable = new Table({
    head: ['Debt', 'Months to Payoff', 'Interest Paid', 'Total Paid'],
    style: { head: ['cyan'] }
  });

  let totalMonths = 0;
  let totalInterest = 0;
  let totalAmountPaid = 0;

  simulation.projections.forEach(proj => {
    resultTable.push([
      proj.debtName,
      `${proj.monthsToPayoff}`,
      formatCurrency(proj.interestPaid),
      formatCurrency(proj.totalPaid)
    ]);
    totalMonths = Math.max(totalMonths, proj.monthsToPayoff);
    totalInterest += proj.interestPaid;
    totalAmountPaid += proj.totalPaid;
  });

  console.log(resultTable.toString());

  // Big wow moment
  const debtFreeDate = addMonths(new Date(), totalMonths);
  console.log(chalk.bold.green(`\n🎉 YOU WILL BE DEBT-FREE ON: ${debtFreeDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`));
  console.log(chalk.green(`   That's ${totalMonths} months (${(totalMonths / 12).toFixed(1)} years) from now!\n`));
  
  console.log(chalk.cyan(`Total Interest Paid: ${formatCurrency(totalInterest)}`));
  console.log(chalk.cyan(`Total Amount Paid: ${formatCurrency(totalAmountPaid)}\n`));

  // Month-by-month breakdown option
  inquirer.prompt([
    {
      type: 'confirm',
      name: 'breakdown',
      message: 'Show month-by-month breakdown?',
      default: false
    }
  ]).then(({ breakdown }) => {
    if (breakdown) {
      showMonthByMonth(sorted, extraCash, minObligation);
    }
  });
}

async function runScenario(debts: Debt[], minObligation: number, totalIncome: number) {
  console.clear();
  console.log(chalk.cyan.bold('🎯 SCENARIO RUNNER\n'));

  const currentExtra = totalIncome - minObligation;
  console.log(chalk.dim(`Current extra monthly: ${formatCurrency(currentExtra)}\n`));

  const { scenario } = await inquirer.prompt([
    {
      type: 'list',
      name: 'scenario',
      message: 'Choose a scenario:',
      choices: [
        `+$500/month extra (${formatCurrency(currentExtra + 500)} total)`,
        `+$1,000/month extra (${formatCurrency(currentExtra + 1000)} total)`,
        `+$1,500/month extra (${formatCurrency(currentExtra + 1500)} total)`,
        `Uber/Lyft $500 (${formatCurrency(currentExtra + 500)} total)`,
        `Uber/Lyft $1,000 (${formatCurrency(currentExtra + 1000)} total)`,
        `Uber/Lyft $1,500 (${formatCurrency(currentExtra + 1500)} total)`,
        'Custom amount'
      ]
    }
  ]);

  let extraPayment = currentExtra;
  
  if (scenario === 'Custom amount') {
    const { custom } = await inquirer.prompt([
      {
        type: 'number',
        name: 'custom',
        message: 'Enter total monthly available (including minimums):',
        default: currentExtra
      }
    ]);
    extraPayment = custom - minObligation;
  } else {
    const match = scenario.match(/\+?\$(\d+)/);
    if (match) {
      extraPayment = currentExtra + parseInt(match[1], 10);
    }
  }

  const sorted = [...debts].sort((a, b) => b.apr - a.apr);
  const simulation = simulatePayoff(sorted, extraPayment, minObligation);
  
  console.log('\n');
  const totalMonths = Math.max(...simulation.projections.map(p => p.monthsToPayoff));
  const totalInterest = simulation.projections.reduce((sum, p) => sum + p.interestPaid, 0);
  const debtFreeDate = addMonths(new Date(), totalMonths);

  console.log(chalk.bold.green(`🎉 DEBT-FREE DATE: ${debtFreeDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`));
  console.log(chalk.green(`   In ${totalMonths} months (${(totalMonths / 12).toFixed(1)} years)\n`));
  console.log(chalk.cyan(`Total Interest Paid: ${formatCurrency(totalInterest)}`));
}

function compareStrategies(debts: Debt[], extraCash: number, minObligation: number) {
  console.clear();
  console.log(chalk.cyan.bold('⚖️  STRATEGY COMPARISON\n'));

  // Avalanche (sorted by APR)
  const avalanche = [...debts].sort((a, b) => b.apr - a.apr);
  const avalancheSim = simulatePayoff(avalanche, extraCash, minObligation);
  const avalancheMonths = Math.max(...avalancheSim.projections.map(p => p.monthsToPayoff));
  const avalancheInterest = avalancheSim.projections.reduce((sum, p) => sum + p.interestPaid, 0);

  // Snowball (sorted by balance)
  const snowball = [...debts].sort((a, b) => a.balance - b.balance);
  const snowballSim = simulatePayoff(snowball, extraCash, minObligation);
  const snowballMonths = Math.max(...snowballSim.projections.map(p => p.monthsToPayoff));
  const snowballInterest = snowballSim.projections.reduce((sum, p) => sum + p.interestPaid, 0);

  const compTable = new Table({
    head: ['Strategy', 'Months to Payoff', 'Interest Paid', 'Debt-Free Date'],
    style: { head: ['cyan'] }
  });

  const avalancheDate = addMonths(new Date(), avalancheMonths);
  const snowballDate = addMonths(new Date(), snowballMonths);

  compTable.push([
    chalk.red('Avalanche (APR)'),
    `${avalancheMonths}`,
    formatCurrency(avalancheInterest),
    avalancheDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
  ]);

  compTable.push([
    chalk.green('Snowball (Balance)'),
    `${snowballMonths}`,
    formatCurrency(snowballInterest),
    snowballDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
  ]);

  console.log(compTable.toString());
  console.log(chalk.yellow(`\n✅ Avalanche saves ${formatCurrency(snowballInterest - avalancheInterest)} in interest!\n`));
}

function simulatePayoff(
  sortedDebts: Debt[],
  monthlyExtra: number,
  minObligation: number
): { projections: PayoffProjection[] } {
  // Clone for simulation
  let simDebts: SimulatedDebt[] = sortedDebts.map(d => ({
    id: d.id,
    name: d.name,
    apr: d.apr,
    balance: d.balance,
    minimumPayment: d.minimumPayment,
    priority: d.payoffPriority,
    monthsToPayoff: 0,
    totalInterest: 0,
    interestPerMonth: d.apr / 100 / 12
  }));

  const projections: PayoffProjection[] = [];
  let totalAvailable = minObligation + monthlyExtra;

  // Simulate month by month
  let months = 0;
  const MAX_MONTHS = 1200; // 100 years safety limit

  while (simDebts.some(d => d.balance > 0) && months < MAX_MONTHS) {
    months++;

    // Apply interest and minimum payments
    simDebts.forEach(d => {
      if (d.balance > 0) {
        const interest = d.balance * d.interestPerMonth;
        d.balance += interest;
        d.totalInterest += interest;

        let payment = Math.min(d.minimumPayment, d.balance);
        d.balance = Math.max(0, d.balance - payment);
      }
    });

    // Apply extra to highest APR first (Avalanche)
    let extra = monthlyExtra;
    for (let d of simDebts) {
      if (d.balance > 0 && extra > 0) {
        const payment = Math.min(extra, d.balance);
        d.balance = Math.max(0, d.balance - payment);
        extra -= payment;

        if (d.monthsToPayoff === 0 && d.balance === 0) {
          d.monthsToPayoff = months;
        }
      }
    }
  }

  // Build projections
  simDebts.forEach(d => {
    const payoffDate = addMonths(new Date(), d.monthsToPayoff);
    projections.push({
      debtId: d.id,
      debtName: d.name,
      apr: d.apr,
      currentBalance: d.balance,
      monthsToPayoff: d.monthsToPayoff,
      interestPaid: d.totalInterest,
      payoffDate: payoffDate.toISOString(),
      totalPaid: d.balance + d.totalInterest
    });
  });

  return { projections };
}

function showMonthByMonth(debts: Debt[], extraCash: number, minObligation: number) {
  console.clear();
  console.log(chalk.cyan.bold('📅 MONTH-BY-MONTH BREAKDOWN\n'));

  let simDebts = debts.map(d => ({
    name: d.name,
    balance: d.balance,
    apr: d.apr,
    minPay: d.minimumPayment
  }));

  const table = new Table({
    head: ['Month', 'Debt', 'Balance', 'Interest', 'Payment'],
    style: { head: ['cyan'] }
  });

  let month = 0;
  let totalMonths = 0;
  const MAX_MONTHS = 60; // Show first 60 months

  while (simDebts.some(d => d.balance > 0) && month < MAX_MONTHS) {
    month++;
    totalMonths++;

    simDebts.forEach((d, idx) => {
      if (d.balance > 0) {
        const interest = d.balance * (d.apr / 100 / 12);
        d.balance += interest;

        const payment = Math.min(d.minPay + extraCash, d.balance);
        d.balance = Math.max(0, d.balance - payment);

        if (idx < 3) { // Show first 3 debts to avoid clutter
          table.push([
            `${month}`,
            d.name,
            formatCurrency(d.balance),
            formatCurrency(interest),
            formatCurrency(payment)
          ]);
        }
      }
    });

    if (month >= 12) break; // Show first 12 months
  }

  console.log(table.toString());
  console.log(chalk.dim(`\n(Showing first 12 months of detailed payoff)\n`));
}

async function pressKey() {
  await inquirer.prompt([{ name: 'continue', type: 'input', message: 'Press Enter to continue...' }]);
}
