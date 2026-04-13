export default function AchievementsSection({ gamification }) {
  const earnedBadges = gamification.badges.filter((b) => b.earned);
  const streak = gamification.streaks.onTimePay;

  if (!earnedBadges.length && streak === 0) {
    return null;
  }

  return (
    <div className="chaos-card border-2 border-vibe-gold/50 shadow-lg shadow-vibe-gold/20">
      <h2 className="text-2xl font-bold chaos-text mb-4">🏆 ACHIEVEMENTS</h2>

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-vibe-gold mb-2">EARNED BADGES</h3>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="badge earned hover:scale-110 transition-transform cursor-pointer"
              >
                <span className="text-lg">{badge.icon}</span>
                <span>{badge.name}</span>
                <span className="text-xs text-vibe-gold">+{badge.points}pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streak */}
      {streak > 0 && (
        <div className="bg-gradient-to-r from-vibe-gold/20 to-chaos-600/20 p-3 rounded-lg border border-vibe-gold/30">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-vibe-gold">🔥 CURRENT STREAK</span>
            <span className="text-3xl font-bold text-vibe-gold">{streak} days</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Best streak: {gamification.streaks.bestOnTimeStreak} days
          </div>
        </div>
      )}
    </div>
  );
}
