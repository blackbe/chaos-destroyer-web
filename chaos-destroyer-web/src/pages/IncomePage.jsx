import { useAppStore } from '../store/appStore';
import { formatCurrency } from '../lib/utils';

export default function IncomePage() {
  const { income } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold chaos-text">💵 MANAGE INCOME</h1>
        <button className="chaos-button">➕ Add Income</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {income.length === 0 ? (
          <div className="chaos-card text-center py-8 text-gray-400">
            No income sources yet. Add your income to calculate breathing room!
          </div>
        ) : (
          income.map((inc) => (
            <div key={inc.id} className="chaos-card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{inc.source}</h3>
                  <div className="text-sm text-gray-400 mt-1">
                    {formatCurrency(inc.amount)} | {inc.frequency}
                  </div>
                </div>
                <button className="text-red-400 hover:text-red-300">🗑️ Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
