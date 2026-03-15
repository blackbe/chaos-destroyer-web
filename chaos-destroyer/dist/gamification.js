"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAILY_CHALLENGES = exports.DEFAULT_BADGES = void 0;
exports.checkBadgeUnlocks = checkBadgeUnlocks;
exports.recordOnTimePayment = recordOnTimePayment;
exports.resetStreak = resetStreak;
exports.getTodayChallenge = getTodayChallenge;
exports.completeDailyChallenge = completeDailyChallenge;
exports.recordMilestone = recordMilestone;
exports.getEarnedBadges = getEarnedBadges;
exports.getBadgeProgress = getBadgeProgress;
exports.awardPoints = awardPoints;
const store_1 = require("./store");
/**
 * Initialize default badges for the app
 */
exports.DEFAULT_BADGES = [
    {
        id: 'debt-slayer',
        name: 'Debt Slayer',
        icon: '⚔️',
        points: 100,
        condition: 'Pay off any debt completely'
    },
    {
        id: 'consistency-star',
        name: 'Consistency Star',
        icon: '⭐',
        points: 50,
        condition: '3 months of on-time payments'
    },
    {
        id: 'chase-hunter',
        name: 'Chase Hunter',
        icon: '🎯',
        points: 200,
        condition: 'Pay off Chase CC'
    },
    {
        id: 'savings-master',
        name: 'Savings Master',
        icon: '💰',
        points: 75,
        condition: 'Save $500+ in interest'
    },
    {
        id: 'goal-getter',
        name: 'Goal Getter',
        icon: '🏆',
        points: 50,
        condition: 'Complete any life goal'
    },
    {
        id: 'week-of-wins',
        name: 'Week of Wins',
        icon: '🔥',
        points: 150,
        condition: 'Hit financial target + complete 3 habits'
    }
];
/**
 * Initialize default daily challenges (6 possible, one per day rotation)
 */
exports.DAILY_CHALLENGES = [
    {
        title: 'No-Spend Day',
        description: 'Skip the $50 gas/food budget today',
        points: 10
    },
    {
        title: 'Extra Chase Payment',
        description: 'Pay an extra $100 toward Chase CC',
        points: 25
    },
    {
        title: 'Log All Expenses',
        description: 'Record every expense today',
        points: 5
    },
    {
        title: 'Review Payoff Progress',
        description: 'Check payoff planner and analyze progress',
        points: 5
    },
    {
        title: 'Interest Awareness',
        description: 'Calculate and track interest saved today',
        points: 15
    },
    {
        title: 'Debt Analysis',
        description: 'Review one debt in detail and plan next payment',
        points: 10
    }
];
/**
 * Check for badge unlock conditions
 */
function checkBadgeUnlocks() {
    const gam = store_1.store.getGamification();
    const debts = store_1.store.getDebts();
    const newlyUnlocked = [];
    // Debt Slayer: Any debt paid to zero
    const completedDebts = debts.filter(d => d.type === 'debt' && d.balance === 0);
    if (completedDebts.length > 0) {
        const badgeId = 'debt-slayer';
        if (!gam.badges.find(b => b.id === badgeId && b.earned)) {
            store_1.store.unlockBadge(badgeId, 'Debt Slayer', '⚔️', 100);
            newlyUnlocked.push({
                id: badgeId,
                name: 'Debt Slayer',
                icon: '⚔️',
                condition: 'Pay off any debt completely',
                points: 100,
                earned: true
            });
        }
    }
    // Chase Hunter: Chase CC paid to zero
    const chaseDebt = debts.find(d => d.name.toLowerCase().includes('chase'));
    if (chaseDebt && chaseDebt.balance === 0) {
        const badgeId = 'chase-hunter';
        if (!gam.badges.find(b => b.id === badgeId && b.earned)) {
            store_1.store.unlockBadge(badgeId, 'Chase Hunter', '🎯', 200);
            newlyUnlocked.push({
                id: badgeId,
                name: 'Chase Hunter',
                icon: '🎯',
                condition: 'Pay off Chase CC',
                points: 200,
                earned: true
            });
        }
    }
    // Savings Master: $500+ in interest saved
    // (This would be tracked separately in transaction analysis)
    const gam2 = store_1.store.getGamification();
    if (gam2.badges.find(b => b.id === 'savings-master' && b.earned)) {
        // Already unlocked
    }
    return newlyUnlocked;
}
/**
 * Update streak for on-time payment
 */
function recordOnTimePayment() {
    const gam = store_1.store.getGamification();
    gam.streaks.onTimePay++;
    if (gam.streaks.onTimePay > gam.streaks.bestOnTimeStreak) {
        gam.streaks.bestOnTimeStreak = gam.streaks.onTimePay;
    }
    gam.streaks.lastPaymentDate = new Date().toISOString().split('T')[0];
    store_1.store.updateGamification(gam);
    return gam.streaks.onTimePay;
}
/**
 * Reset on-time payment streak (e.g., when payment is late)
 */
function resetStreak() {
    const gam = store_1.store.getGamification();
    gam.streaks.onTimePay = 0;
    store_1.store.updateGamification(gam);
    return 0;
}
/**
 * Get today's daily challenge
 */
function getTodayChallenge() {
    const gam = store_1.store.getGamification();
    const today = new Date().toISOString().split('T')[0];
    // Check if already completed today
    if (gam.dailyChallenges.completed && gam.dailyChallenges.completed.includes(today)) {
        return undefined; // Already completed
    }
    // Rotate through challenges based on day of year
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const challengeIndex = dayOfYear % exports.DAILY_CHALLENGES.length;
    const challenge = exports.DAILY_CHALLENGES[challengeIndex];
    return {
        id: `${today}-${challengeIndex}`,
        title: challenge.title,
        description: challenge.description,
        points: challenge.points,
        completed: false
    };
}
/**
 * Complete today's daily challenge
 */
function completeDailyChallenge() {
    const gam = store_1.store.getGamification();
    const today = new Date().toISOString().split('T')[0];
    const challenge = getTodayChallenge();
    if (!challenge)
        return 0; // Already completed or no challenge
    if (!gam.dailyChallenges.completed) {
        gam.dailyChallenges.completed = [];
    }
    gam.dailyChallenges.completed.push(today);
    const points = challenge.points;
    gam.chaoPoints += points;
    store_1.store.updateGamification(gam);
    return points;
}
/**
 * Record a milestone achievement (e.g., "$1000 paid on Chase CC")
 */
function recordMilestone(debtId, milestone) {
    const gam = store_1.store.getGamification();
    const today = new Date().toISOString().split('T')[0];
    // Check if already recorded
    const existing = gam.milestonesAchieved.find(m => m.debtId === debtId && m.milestone === milestone);
    if (existing)
        return false; // Already recorded
    gam.milestonesAchieved.push({
        debtId,
        milestone,
        achievedDate: today
    });
    store_1.store.updateGamification(gam);
    return true;
}
/**
 * Get all earned badges with progress info
 */
function getEarnedBadges() {
    const gam = store_1.store.getGamification();
    return gam.badges.filter(b => b.earned);
}
/**
 * Get badge progress for incomplete badges
 */
function getBadgeProgress(badgeId) {
    const gam = store_1.store.getGamification();
    const debts = store_1.store.getDebts();
    switch (badgeId) {
        case 'consistency-star':
            // Track months with on-time payments (would need monthly payment tracking)
            // For now, estimate from current streak
            const months = Math.floor(gam.streaks.onTimePay / 30);
            return { progress: Math.min(months, 3), required: 3 };
        case 'savings-master':
            // Track interest saved (would need transaction analysis)
            return { progress: 0, required: 500 };
        default:
            return null;
    }
}
/**
 * Add Chaos Points for an achievement
 */
function awardPoints(points, reason) {
    const newTotal = store_1.store.addChaoPoints(points);
    return newTotal;
}
exports.default = {
    checkBadgeUnlocks,
    recordOnTimePayment,
    resetStreak,
    getTodayChallenge,
    completeDailyChallenge,
    recordMilestone,
    getEarnedBadges,
    getBadgeProgress,
    awardPoints,
    DEFAULT_BADGES: exports.DEFAULT_BADGES,
    DAILY_CHALLENGES: exports.DAILY_CHALLENGES
};
