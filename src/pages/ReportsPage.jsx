import { useAppStore } from '../store/appStore';
import { formatCurrency } from '../lib/utils';

export default function ReportsPage() {
  const { debts, bills, income, gamification } = useAppStore();

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMonthlyIncome = income.reduce((sum, i) => sum + (i.amount || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold chaos-text">📊 REPORTS & EXPORT</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="chaos-card">
          <div className="text-sm text-gray-400">Total Debt</div>
          <div className="text-3xl font-bold text-red-400">{formatCurrency(totalDebt)}</div>
        </div>
        <div className="chaos-card">
          <div className="text-sm text-gray-400">Monthly Income</div>
          <div className="text-3xl font-bold text-green-400">{formatCurrency(totalMonthlyIncome)}</div>
        </div>
        {gamification && (
          <div className="chaos-card">
            <div className="text-sm text-gray-400">Chao Points</div>
            <div className="text-3xl font-bold text-vibe-gold">{gamification.chaoPoints}</div>
          </div>
        )}
      </div>

      <div className="chaos-card">
        <h2 className="text-xl font-bold chaos-text mb-4">Export Options</h2>
        <button className="chaos-button mr-2">📥 Export as PDF</button>
        <button className="chaos-button">💾 Export as JSON</button>
      </div>
    </div>
  );
}
