import { useAppStore } from '../store/appStore';
import { calculatePayoffProjection, formatCurrency } from '../lib/utils';

export default function PayoffPlannerPage() {
  const { debts } = useAppStore();

  const sortedDebts = [...debts].sort((a, b) => b.apr - a.apr);

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold chaos-text">⚡ AVALANCHE PAYOFF PLANNER</h1>

      <div className="chaos-card">
        <h2 className="text-xl font-bold chaos-text mb-4">Recommended Payoff Order (Highest APR First)</h2>
        <div className="space-y-3">
          {sortedDebts.map((debt, index) => {
            const projection = calculatePayoffProjection(debt.balance, debt.apr, debt.minimumPayment + 200);
            return (
              <div key={debt.id} className="bg-vibe-dark/50 p-3 rounded-lg border border-chaos-600/20">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white">
                      #{index + 1}: {debt.name}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Balance: {formatCurrency(debt.balance || 0)} | APR: {(debt.apr || 0).toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-vibe-cyan font-bold">{projection.months} months</div>
                    <div className="text-gray-400">Interest: {formatCurrency(projection.interestPaid)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
