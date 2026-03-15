import { useAppStore } from '../store/appStore';

export default function BadgesPage() {
  const { gamification } = useAppStore();

  if (!gamification) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold chaos-text">🏆 BADGES & STREAKS</h1>
        <div className="chaos-card text-center py-8 text-gray-400">
          Loading gamification data...
        </div>
      </div>
    );
  }

  const earned = gamification.badges.filter((b) => b.earned);
  const locked = gamification.badges.filter((b) => !b.earned);

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold chaos-text">🏆 BADGES & STREAKS</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="chaos-card text-center">
          <div className="text-sm text-gray-400">CHAO POINTS</div>
          <div className="text-3xl font-bold text-vibe-gold">{gamification.chaoPoints}</div>
        </div>
        <div className="chaos-card text-center">
          <div className="text-sm text-gray-400">CURRENT STREAK</div>
          <div className="text-3xl font-bold text-vibe-cyan">{gamification.streaks.onTimePay} days</div>
        </div>
        <div className="chaos-card text-center">
          <div className="text-sm text-gray-400">BEST STREAK</div>
          <div className="text-3xl font-bold text-vibe-lime">{gamification.streaks.bestOnTimeStreak} days</div>
        </div>
        <div className="chaos-card text-center">
          <div className="text-sm text-gray-400">EARNED BADGES</div>
          <div className="text-3xl font-bold text-chaos-400">{earned.length}/{gamification.badges.length}</div>
        </div>
      </div>

      {earned.length > 0 && (
        <div className="chaos-card">
          <h2 className="text-xl font-bold chaos-text mb-4">✅ EARNED BADGES</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {earned.map((badge) => (
              <div key={badge.id} className="bg-chaos-600/20 border border-chaos-400 rounded-lg p-3 text-center">
                <div className="text-3xl mb-1">{badge.icon}</div>
                <div className="font-bold text-sm text-white">{badge.name}</div>
                <div className="text-xs text-vibe-gold">+{badge.points}pts</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div className="chaos-card">
          <h2 className="text-xl font-bold chaos-text mb-4">🔒 LOCKED BADGES</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {locked.map((badge) => (
              <div key={badge.id} className="bg-gray-900/50 border border-gray-600/30 rounded-lg p-3 text-center opacity-60">
                <div className="text-3xl mb-1">{badge.icon}</div>
                <div className="font-bold text-sm text-gray-400">{badge.name}</div>
                <div className="text-xs text-gray-500">{badge.condition}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
