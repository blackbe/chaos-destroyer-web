import chalk from 'chalk';
import { drawMilestoneMessage } from './visualizations';

/**
 * Repository of celebration messages
 */
const CELEBRATION_MESSAGES = {
  thousandDamage: [
    'You\'ve damaged {debt} by $1,000! 🎯',
    'Another thousand bites the dust! 💥',
    'One grand down, {debt} is weakening! 💪',
    'You\'ve cut $1,000 from {debt}! ⚔️'
  ],
  perfectMonth: [
    'Perfect month! {count} for consistency star ⭐',
    'Three months in a row! You\'re unstoppable! 🔥',
    'Consistency is paying off! Keep the streak alive! 🎯'
  ],
  interestSaved: [
    '$100 saved in interest this month 💰',
    'You just saved {amount} in interest! That\'s genius! 💎',
    'Smart payment strategy! {amount} interest avoided! 🧠'
  ],
  halfwayDefeated: [
    '{debt} is halfway defeated! 💪',
    'You\'re at the 50% mark on {debt}! Push harder! 🔥',
    'Halfway there! {debt} is weakening fast! ⚔️'
  ],
  unstoppableForce: [
    'Unstoppable force! Multiple debts paid this month! 🔥',
    'You\'re on fire! Crushing multiple debts! 🚀',
    'Debt destruction mode activated! 💥'
  ],
  extraPayment: [
    'That extra ${amount} saved you 3 days of interest! 💡',
    'Going above and beyond! Smart extra payment! 🎯',
    'Extra payment = less interest! You\'re thinking big! 🧠'
  ]
};

/**
 * Check for and display milestone celebrations
 */
export function checkAndDisplayMilestones(
  debt: { name: string; balance: number; originalBalance?: number; apr: number },
  paymentAmount: number
) {
  const celebrations: string[] = [];
  const original = debt.originalBalance || debt.balance + paymentAmount;
  const percentPaid = ((original - debt.balance) / original) * 100;

  // Check $1,000 damage milestones
  const damageInThousands = Math.floor((original - debt.balance) / 1000);
  if (damageInThousands > 0 && paymentAmount >= 100) {
    const message = pickRandom(CELEBRATION_MESSAGES.thousandDamage).replace('{debt}', debt.name);
    celebrations.push(message);
  }

  // Check 50% milestone
  if (percentPaid >= 50 && percentPaid < 60) {
    const message = pickRandom(CELEBRATION_MESSAGES.halfwayDefeated).replace('{debt}', debt.name);
    celebrations.push(message);
  }

  // Check 75% milestone (strong progress)
  if (percentPaid >= 75 && percentPaid < 85) {
    celebrations.push(`${debt.name} is almost defeated! Final stretch! 🏁`);
  }

  return celebrations;
}

/**
 * Generate a celebration message for multiple debts paid
 */
export function celebrateMultipleDebts(debtsPaid: number): string[] {
  const celebrations: string[] = [];

  if (debtsPaid >= 3) {
    celebrations.push(pickRandom(CELEBRATION_MESSAGES.unstoppableForce));
  } else if (debtsPaid >= 2) {
    celebrations.push('Multiple debts paid this month! Great work! 💪');
  }

  return celebrations;
}

/**
 * Generate a celebration for interest savings
 */
export function celebrateInterestSavings(amountSaved: number): string[] {
  const celebrations: string[] = [];

  if (amountSaved >= 100) {
    const message = pickRandom(CELEBRATION_MESSAGES.interestSaved)
      .replace('{amount}', `$${amountSaved.toFixed(2)}`);
    celebrations.push(message);
  }

  return celebrations;
}

/**
 * Generate a celebration for extra payments
 */
export function celebrateExtraPayment(extraAmount: number): string[] {
  const celebrations: string[] = [];

  if (extraAmount > 0) {
    const message = pickRandom(CELEBRATION_MESSAGES.extraPayment)
      .replace('{amount}', extraAmount.toFixed(2));
    celebrations.push(message);
  }

  return celebrations;
}

/**
 * Generate on-time payment streak celebration
 */
export function celebrateStreak(streakDays: number): string[] {
  const celebrations: string[] = [];

  if (streakDays === 7) celebrations.push('🔥 ONE WEEK STREAK! Keep it up! 🔥');
  if (streakDays === 14) celebrations.push('🔥🔥 TWO WEEK STREAK! You\'re unstoppable! 🔥🔥');
  if (streakDays === 30) celebrations.push('🔥🔥🔥 ONE MONTH PERFECT! LEGENDARY STATUS! 🔥🔥🔥');
  if (streakDays > 0 && streakDays % 7 === 0) celebrations.push(`🔥 ${streakDays}-day streak! On fire! 🔥`);

  return celebrations;
}

/**
 * Display a celebration box
 */
export function displayCelebration(messages: string[]) {
  if (messages.length === 0) return;

  messages.forEach(msg => {
    const lines = drawMilestoneMessage(msg, '🎉');
    lines.forEach(line => console.log(line));
    console.log();
  });
}

/**
 * Display multiple celebration messages
 */
export function displayCelebrations(allCelebrations: string[][]) {
  const flat = allCelebrations.flat();
  if (flat.length === 0) return;

  console.log();
  flat.forEach(msg => {
    const lines = drawMilestoneMessage(msg, '🎉');
    lines.forEach(line => console.log(line));
    console.log();
  });
}

/**
 * Helper: Pick a random item from array
 */
function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export default {
  checkAndDisplayMilestones,
  celebrateMultipleDebts,
  celebrateInterestSavings,
  celebrateExtraPayment,
  celebrateStreak,
  displayCelebration,
  displayCelebrations
};
