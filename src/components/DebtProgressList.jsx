import { getProgressPercentage, formatCurrency } from '../lib/utils';
import ProgressBar from './ProgressBar';

export default function DebtProgressList({ debts }) {
  const sortedDebts = [...debts].sort((a, b) => a.payoffPriority - b.payoffPriority);

  if (!sortedDebts.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        No debts yet. Start by adding your first debt!
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {sortedDebts.map((debt, index) => {
        const progress = getProgressPercentage(debt.balance || 0, debt.originalBalance || debt.balance || 0);

        return (
          <div
            key={debt.id}
            className="bg-vibe-dark/50 p-1 rounded-lg border border-chaos-600/20 hover:border-chaos-600/50 transition-all"
          >
            <div className="flex justify-between items-center mb-0.5">
              <div className="text-sm font-bold text-gray-400">
                {debt.name}
              </div>
              <div className="text-xs text-gray-400 font-bold">{(progress || 0).toFixed(0)}%</div>
            </div>

            <ProgressBar
              percentage={progress || 0}
              label=""
              showLabel={false}
              height="h-1"
            />

            <div className="flex justify-between mt-0.5 text-xs text-gray-400">
              <span>APR: {(debt.apr || 0).toFixed(2)}%</span>
              <span>Min: {formatCurrency(debt.minimumPayment || 0)}</span>
              <span>{formatCurrency(debt.balance || 0)}</span>
              {debt.notes && <span className="text-gray-500">{debt.notes}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
