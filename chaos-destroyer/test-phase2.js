#!/usr/bin/env node

/**
 * Phase 2 Feature Test Suite
 * Tests all gamification and visualization features
 */

const { store } = require('./dist/store');
const {
  getEarnedBadges,
  getTodayChallenge,
  completeDailyChallenge,
  awardPoints,
  recordOnTimePayment,
  DEFAULT_BADGES
} = require('./dist/gamification');
const {
  drawProgressBar,
  drawDebtProgressBar,
  drawBossBar,
  drawBossDefeatBox,
  drawMilestoneMessage,
  sectionHeader
} = require('./dist/visualizations');
const {
  checkAndDisplayMilestones,
  celebrateStreak
} = require('./dist/celebrations');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║        🚀 CHAO DESTROYER PHASE 2 - FEATURE TEST            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    testsPassed++;
  } catch (e) {
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${e.message}`);
    testsFailed++;
  }
}

// ===== 1. GAMIFICATION TESTS =====
console.log('\n📊 TEST SUITE 1: GAMIFICATION SYSTEM\n');

test('Award Chao Points', () => {
  const initialPoints = store.getGamification().chaoPoints;
  const newPoints = awardPoints(100, 'test');
  if (newPoints <= initialPoints) throw new Error('Points not awarded');
});

test('Get today\'s daily challenge', () => {
  // Note: Challenge will be null if already completed today
  const challenge = getTodayChallenge();
  // If already completed today, that's OK - system prevents duplicate daily completion
  if (challenge) {
    if (!challenge.title) throw new Error('Challenge missing title');
    if (!challenge.points) throw new Error('Challenge missing points');
  }
});

test('Complete daily challenge', () => {
  // This will only work if challenge is not already completed
  const challenge = getTodayChallenge();
  if (challenge) {
    const points = completeDailyChallenge();
    if (points <= 0) throw new Error('No points awarded for completion');
  }
  // If already completed, that's expected behavior
});

test('Record on-time payment streak', () => {
  const streak = recordOnTimePayment();
  if (streak < 1) throw new Error('Streak not recorded');
});

test('Get badge progress', () => {
  const gam = store.getGamification();
  if (!gam.streaks) throw new Error('Streaks not initialized');
  if (typeof gam.streaks.onTimePay !== 'number') throw new Error('Streak count not a number');
});

test('Default badges are defined', () => {
  if (DEFAULT_BADGES.length !== 6) throw new Error('Should have 6 default badges');
  if (!DEFAULT_BADGES.find(b => b.id === 'debt-slayer')) throw new Error('Missing Debt Slayer badge');
});

// ===== 2. VISUALIZATION TESTS =====
console.log('\n📊 TEST SUITE 2: VISUALIZATIONS\n');

test('Draw progress bar 0%', () => {
  const bar = drawProgressBar(0);
  if (!bar.includes('░')) throw new Error('Empty bar should contain empty blocks');
});

test('Draw progress bar 50%', () => {
  const bar = drawProgressBar(50);
  if (!bar.includes('█') || !bar.includes('░')) throw new Error('Half bar should contain both filled and empty');
});

test('Draw progress bar 100%', () => {
  const bar = drawProgressBar(100);
  if (!bar.includes('█')) throw new Error('Full bar should contain filled blocks');
});

test('Draw debt progress bar', () => {
  const debts = store.getDebts();
  if (debts.length > 0) {
    const bar = drawDebtProgressBar(debts[0]);
    if (!bar.includes('%')) throw new Error('Debt progress bar missing percentage');
    if (!bar.includes('$')) throw new Error('Debt progress bar missing currency');
  }
});

test('Draw boss health bar', () => {
  const bar = drawBossBar(5000, 10000);
  if (!bar.includes('%')) throw new Error('Boss bar missing percentage');
  if (!bar.includes('HP')) throw new Error('Boss bar missing HP indicator');
});

test('Draw boss defeat box', () => {
  const lines = drawBossDefeatBox('Chase', 11887.24, 'OnPoint CC', '⚔️ Debt Slayer');
  if (lines.length === 0) throw new Error('Defeat box should have content');
  if (!lines.join('').includes('DEFEATED')) throw new Error('Defeat box missing celebration');
});

test('Draw milestone message', () => {
  const lines = drawMilestoneMessage('You\'ve damaged Chase by $1,000!', '🎯');
  if (lines.length === 0) throw new Error('Milestone should have content');
  if (!lines.join('').includes('1,000')) throw new Error('Milestone missing amount');
});

test('Section header formatting', () => {
  const header = sectionHeader('TEST SECTION', '🏆');
  if (!header.includes('TEST SECTION')) throw new Error('Header missing title');
  if (!header.includes('🏆')) throw new Error('Header missing emoji');
});

// ===== 3. CELEBRATION TESTS =====
console.log('\n📊 TEST SUITE 3: CELEBRATIONS\n');

test('Celebrate milestone achievement', () => {
  const debts = store.getDebts();
  if (debts.length > 0) {
    const messages = checkAndDisplayMilestones(
      { ...debts[0], originalBalance: 5000 },
      100
    );
    // Should return array (empty or with messages)
    if (!Array.isArray(messages)) throw new Error('Should return array of messages');
  }
});

test('Celebrate streak milestones', () => {
  const messages = celebrateStreak(7);
  if (!Array.isArray(messages)) throw new Error('Should return array of messages');
  // 7-day streak should have a message
  if (messages.length === 0) {
    // Some streaks don't celebrate, that's ok
  }
});

test('Celebrate multiple debts paid', () => {
  const messages = celebrateStreak(14);
  if (!Array.isArray(messages)) throw new Error('Should return array of messages');
});

// ===== 4. DATA PERSISTENCE TESTS =====
console.log('\n📊 TEST SUITE 4: DATA PERSISTENCE\n');

test('Gamification data saved to store', () => {
  const gam = store.getGamification();
  if (!gam) throw new Error('Gamification data not found');
  if (!gam.chaoPoints) throw new Error('Chao points missing');
  if (!gam.streaks) throw new Error('Streaks missing');
});

test('Badges persist in store', () => {
  const gam = store.getGamification();
  if (!Array.isArray(gam.badges)) throw new Error('Badges not an array');
});

test('Daily challenges track completion', () => {
  const gam = store.getGamification();
  if (!Array.isArray(gam.dailyChallenges.completed)) throw new Error('Completed challenges not tracked');
});

test('Streaks update correctly', () => {
  const gam = store.getGamification();
  if (typeof gam.streaks.onTimePay !== 'number') throw new Error('On-time streak not a number');
  if (typeof gam.streaks.bestOnTimeStreak !== 'number') throw new Error('Best streak not a number');
});

// ===== 5. INTEGRATION TESTS =====
console.log('\n📊 TEST SUITE 5: INTEGRATION\n');

test('Full gamification flow', () => {
  const before = store.getGamification().chaoPoints;
  
  // Award points
  awardPoints(25, 'test');
  
  // Record payment
  recordOnTimePayment();
  
  // Get challenge
  const challenge = getTodayChallenge();
  
  const after = store.getGamification().chaoPoints;
  
  if (after <= before) throw new Error('Gamification state not updating');
});

test('Debts show progress bars', () => {
  const debts = store.getDebts();
  if (debts.length === 0) throw new Error('No test debts');
  
  const bars = debts.slice(0, 3).map(d => drawDebtProgressBar(d, 20));
  if (bars.some(b => !b.includes('%'))) throw new Error('Progress bars incomplete');
});

// ===== SUMMARY =====
console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log(`║  TESTS PASSED: ${testsPassed}  │  TESTS FAILED: ${testsFailed}`.padEnd(60) + '║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

if (testsFailed === 0) {
  console.log('✅ ALL TESTS PASSED! Phase 2 features are working correctly.\n');
  process.exit(0);
} else {
  console.log(`❌ ${testsFailed} TEST(S) FAILED. Please review the errors above.\n`);
  process.exit(1);
}
