import { useAppStore } from '../store/appStore';

export default function ChallengesPage() {
  const { gamification } = useAppStore();

  if (!gamification) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold chaos-text">📅 DAILY CHALLENGES</h1>
        <div className="chaos-card text-center py-8 text-gray-400">
          Loading challenges data...
        </div>
      </div>
    );
  }

  const today = gamification.dailyChallenges.today;
  const completedCount = gamification.dailyChallenges.completed.length;
  const monthProgress = (completedCount / 30) * 100;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold chaos-text">📅 DAILY CHALLENGES</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="chaos-card text-center">
          <div className="text-sm text-gray-400">THIS MONTH</div>
          <div className="text-3xl font-bold text-vibe-lime">{completedCount}/30</div>
        </div>
        <div className="chaos-card text-center">
          <div className="text-sm text-gray-400">COMPLETION RATE</div>
          <div className="text-3xl font-bold text-vibe-cyan">{Math.round(monthProgress)}%</div>
        </div>
        <div className="chaos-card text-center">
          <div className="text-sm text-gray-400">TOTAL POINTS</div>
          <div className="text-3xl font-bold text-vibe-gold">{gamification.chaoPoints}</div>
        </div>
      </div>

      {today && (
        <div className="chaos-card border-2 border-vibe-cyan/50">
          <h2 className="text-2xl font-bold chaos-text mb-4">📅 TODAY'S CHALLENGE</h2>
          <div className="bg-vibe-dark/50 p-4 rounded-lg border border-chaos-600/20">
            <div className="text-lg font-bold text-vibe-cyan mb-2">{today.title}</div>
            <div className="text-sm text-gray-300 mb-3">{today.description}</div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-vibe-gold font-bold">+{today.points} CHAO POINTS</div>
              <button className={`px-4 py-2 rounded-lg font-bold ${
                today.completed
                  ? 'bg-green-600/30 border border-green-500 text-green-300'
                  : 'bg-gradient-to-r from-vibe-cyan to-chaos-500 text-white hover:shadow-lg hover:shadow-vibe-cyan/50'
              }`}>
                {today.completed ? '✅ COMPLETED' : '✅ COMPLETE'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="chaos-card">
        <h2 className="text-xl font-bold chaos-text mb-4">Previous Challenges</h2>
        <div className="text-gray-400 text-center py-8">
          Completed {gamification.dailyChallenges.completed.length} challenges this month
        </div>
      </div>
    </div>
  );
}
