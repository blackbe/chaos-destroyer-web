import { useAppStore } from '../store/appStore';

export default function GoalsPage() {
  const { goals } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold chaos-text">🎯 MANAGE GOALS</h1>
        <button className="chaos-button">➕ Add Goal</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {goals.length === 0 ? (
          <div className="chaos-card text-center py-8 text-gray-400">
            No goals yet. Set your financial goals!
          </div>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="chaos-card">
              <h3 className="text-xl font-bold text-white">{goal.name}</h3>
              <div className="text-sm text-gray-400 mt-1">
                Progress: ${goal.currentAmount} / ${goal.targetAmount}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
