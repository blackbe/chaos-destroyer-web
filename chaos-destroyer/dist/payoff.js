"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPayoffPlanner = runPayoffPlanner;
const store_1 = require("./store");
const cli_table3_1 = __importDefault(require("cli-table3"));
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("./utils");
const inquirer_1 = __importDefault(require("inquirer"));
async function runPayoffPlanner() {
    console.clear();
    console.log(chalk_1.default.cyan.bold('🏔️  DEBT DESTROYER - PAYOFF PLANNER\n'));
    const debts = (store_1.store.getDebts() || []).filter(d => d.type === 'debt' && d.balance > 0);
    if (debts.length === 0) {
        console.log(chalk_1.default.yellow('No debts to plan. You\'re debt-free! 🎉'));
        await pressKey();
        return;
    }
    // Calculate current monthly obligations
    const income = (store_1.store.getIncome() || []).filter(i => !i.isPaused);
    const totalMonthlyIncome = calculateMonthlyIncome(income);
    const minObligations = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
    const extraCash = totalMonthlyIncome - minObligations;
    console.log(chalk_1.default.dim(`Total Monthly Income: ${(0, utils_1.formatCurrency)(totalMonthlyIncome)}`));
    console.log(chalk_1.default.dim(`Min Obligations:      ${(0, utils_1.formatCurrency)(minObligations)}`));
    console.log(chalk_1.default.green(`Available for Payoff Acceleration: ${(0, utils_1.formatCurrency)(extraCash)}\n`));
    if (extraCash <= 0) {
        console.log(chalk_1.default.red("⚠️  No extra cash available to accelerate payoff."));
        console.log(chalk_1.default.red("    Focus on increasing income or reducing expenses.\n"));
        await pressKey();
        return;
    }
    // Show menu
    const { action } = await inquirer_1.default.prompt([
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
function viewDefaultPlan(debts, extraCash, totalIncome, minObligation) {
    console.clear();
    console.log(chalk_1.default.cyan.bold('📊 DEFAULT PAYOFF PLAN (AVALANCHE METHOD)\n'));
    // Sort by APR (Avalanche)
    const sorted = [...debts].sort((a, b) => b.apr - a.apr);
    console.log(chalk_1.default.yellow('Kill Chase First Strategy - Sorted by APR (Highest First):\n'));
    const orderTable = new cli_table3_1.default({
        head: ['Priority', 'Debt', 'Balance', 'APR', 'Min Pay'],
        style: { head: ['cyan'] }
    });
    sorted.forEach((d, idx) => {
        const color = idx === 0 ? chalk_1.default.red : chalk_1.default.white;
        orderTable.push([
            color(`${idx + 1}`),
            color(d.name),
            color((0, utils_1.formatCurrency)(d.balance)),
            color(`${d.apr}%`),
            color((0, utils_1.formatCurrency)(d.minimumPayment))
        ]);
    });
    console.log(orderTable.toString());
    // Simulate payoff
    const simulation = simulatePayoff(sorted, extraCash, minObligation);
    console.log(chalk_1.default.bold('\n💰 SIMULATION RESULTS\n'));
    const resultTable = new cli_table3_1.default({
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
            (0, utils_1.formatCurrency)(proj.interestPaid),
            (0, utils_1.formatCurrency)(proj.totalPaid)
        ]);
        totalMonths = Math.max(totalMonths, proj.monthsToPayoff);
        totalInterest += proj.interestPaid;
        totalAmountPaid += proj.totalPaid;
    });
    console.log(resultTable.toString());
    // Big wow moment
    const debtFreeDate = (0, utils_1.addMonths)(new Date(), totalMonths);
    console.log(chalk_1.default.bold.green(`\n🎉 YOU WILL BE DEBT-FREE ON: ${debtFreeDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`));
    console.log(chalk_1.default.green(`   That's ${totalMonths} months (${(totalMonths / 12).toFixed(1)} years) from now!\n`));
    console.log(chalk_1.default.cyan(`Total Interest Paid: ${(0, utils_1.formatCurrency)(totalInterest)}`));
    console.log(chalk_1.default.cyan(`Total Amount Paid: ${(0, utils_1.formatCurrency)(totalAmountPaid)}\n`));
    // Month-by-month breakdown option
    inquirer_1.default.prompt([
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
async function runScenario(debts, minObligation, totalIncome) {
    console.clear();
    console.log(chalk_1.default.cyan.bold('🎯 SCENARIO RUNNER\n'));
    const currentExtra = totalIncome - minObligation;
    console.log(chalk_1.default.dim(`Current extra monthly: ${(0, utils_1.formatCurrency)(currentExtra)}\n`));
    const { scenario } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'scenario',
            message: 'Choose a scenario:',
            choices: [
                `+$500/month extra (${(0, utils_1.formatCurrency)(currentExtra + 500)} total)`,
                `+$1,000/month extra (${(0, utils_1.formatCurrency)(currentExtra + 1000)} total)`,
                `+$1,500/month extra (${(0, utils_1.formatCurrency)(currentExtra + 1500)} total)`,
                `Uber/Lyft $500 (${(0, utils_1.formatCurrency)(currentExtra + 500)} total)`,
                `Uber/Lyft $1,000 (${(0, utils_1.formatCurrency)(currentExtra + 1000)} total)`,
                `Uber/Lyft $1,500 (${(0, utils_1.formatCurrency)(currentExtra + 1500)} total)`,
                'Custom amount'
            ]
        }
    ]);
    let extraPayment = currentExtra;
    if (scenario === 'Custom amount') {
        const { custom } = await inquirer_1.default.prompt([
            {
                type: 'number',
                name: 'custom',
                message: 'Enter total monthly available (including minimums):',
                default: currentExtra
            }
        ]);
        extraPayment = custom - minObligation;
    }
    else {
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
    const debtFreeDate = (0, utils_1.addMonths)(new Date(), totalMonths);
    console.log(chalk_1.default.bold.green(`🎉 DEBT-FREE DATE: ${debtFreeDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`));
    console.log(chalk_1.default.green(`   In ${totalMonths} months (${(totalMonths / 12).toFixed(1)} years)\n`));
    console.log(chalk_1.default.cyan(`Total Interest Paid: ${(0, utils_1.formatCurrency)(totalInterest)}`));
}
function compareStrategies(debts, extraCash, minObligation) {
    console.clear();
    console.log(chalk_1.default.cyan.bold('⚖️  STRATEGY COMPARISON\n'));
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
    const compTable = new cli_table3_1.default({
        head: ['Strategy', 'Months to Payoff', 'Interest Paid', 'Debt-Free Date'],
        style: { head: ['cyan'] }
    });
    const avalancheDate = (0, utils_1.addMonths)(new Date(), avalancheMonths);
    const snowballDate = (0, utils_1.addMonths)(new Date(), snowballMonths);
    compTable.push([
        chalk_1.default.red('Avalanche (APR)'),
        `${avalancheMonths}`,
        (0, utils_1.formatCurrency)(avalancheInterest),
        avalancheDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
    ]);
    compTable.push([
        chalk_1.default.green('Snowball (Balance)'),
        `${snowballMonths}`,
        (0, utils_1.formatCurrency)(snowballInterest),
        snowballDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
    ]);
    console.log(compTable.toString());
    console.log(chalk_1.default.yellow(`\n✅ Avalanche saves ${(0, utils_1.formatCurrency)(snowballInterest - avalancheInterest)} in interest!\n`));
}
function simulatePayoff(sortedDebts, monthlyExtra, minObligation) {
    // Clone for simulation
    let simDebts = sortedDebts.map(d => ({
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
    const projections = [];
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
        const payoffDate = (0, utils_1.addMonths)(new Date(), d.monthsToPayoff);
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
function showMonthByMonth(debts, extraCash, minObligation) {
    console.clear();
    console.log(chalk_1.default.cyan.bold('📅 MONTH-BY-MONTH BREAKDOWN\n'));
    let simDebts = debts.map(d => ({
        name: d.name,
        balance: d.balance,
        apr: d.apr,
        minPay: d.minimumPayment
    }));
    const table = new cli_table3_1.default({
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
                        (0, utils_1.formatCurrency)(d.balance),
                        (0, utils_1.formatCurrency)(interest),
                        (0, utils_1.formatCurrency)(payment)
                    ]);
                }
            }
        });
        if (month >= 12)
            break; // Show first 12 months
    }
    console.log(table.toString());
    console.log(chalk_1.default.dim(`\n(Showing first 12 months of detailed payoff)\n`));
}
async function pressKey() {
    await inquirer_1.default.prompt([{ name: 'continue', type: 'input', message: 'Press Enter to continue...' }]);
}
