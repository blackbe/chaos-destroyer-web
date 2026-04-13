export default function DailyChallenge({ challenge, onComplete }) {
  if (!challenge) {
    return (
      <div className="chaos-card">
        <h2 className="text-xl font-bold chaos-text mb-2">📅 TODAY'S CHALLENGE</h2>
        <p className="text-gray-400">Check back tomorrow for a new challenge!</p>
      </div>
    );
  }

  return (
    <div className="chaos-card border-2 border-vibe-cyan/50 shadow-lg shadow-vibe-cyan/20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-bold chaos-text mb-2">📅 TODAY'S CHALLENGE</h2>
          <div className="bg-vibe-dark/50 p-3 rounded-lg border border-chaos-600/20 mb-3">
            <div className="text-lg font-bold text-vibe-cyan mb-1">{challenge.title}</div>
            <div className="text-sm text-gray-300 mb-2">{challenge.description}</div>
            <div className="text-xs text-vibe-gold">+{challenge.points} CHAO POINTS</div>
          </div>
        </div>

        {!challenge.completed && (
          <button
            onClick={onComplete}
            className="ml-4 px-4 py-2 bg-gradient-to-r from-vibe-cyan to-chaos-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-vibe-cyan/50 transition-all whitespace-nowrap"
          >
            ✅ COMPLETE
          </button>
        )}

        {challenge.completed && (
          <div className="ml-4 px-4 py-2 bg-green-600/30 border border-green-500 text-green-300 font-bold rounded-lg flex items-center gap-2">
            <span>✅ COMPLETED</span>
          </div>
        )}
      </div>
    </div>
  );
}
