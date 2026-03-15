export default function CashFlowSummary({
  income,
  bills,
  debtMinimums,
  breathingRoom,
}) {
  const totalObligations = bills + debtMinimums;

  return (
    <div className="chaos-card">
      <h2 className="text-sm font-bold chaos-text mb-2">MONTHLY CASH FLOW</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Income */}
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-2">
          <div className="text-xs text-gray-400">INCOME</div>
          <div className="text-xs font-bold text-green-400">
            ${income.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* Obligations */}
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-2">
          <div className="flex justify-between items-start">
            <div className="text-xs text-gray-400">OBLIGATIONS</div>
            <div className="text-xs text-gray-400">
              Bills: ${bills.toLocaleString(undefined, { maximumFractionDigits: 0 })} | Debt Min: ${debtMinimums.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="text-xs font-bold text-red-400">
            ${totalObligations.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Breathing Room */}
      <div className="mt-1 bg-gradient-to-r from-chaos-600/20 to-vibe-cyan/20 border border-chaos-600/30 rounded-lg p-2">
        <div className="text-xs text-gray-400">BREATHING ROOM (AVAILABLE TO SAVE/EXTRA PAY)</div>
        <div className={`text-xs font-bold ${breathingRoom > 0 ? 'text-green-400' : 'text-orange-400'}`}>
          ${breathingRoom.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
        {breathingRoom > 0 ? (
          <div className="text-xs text-green-300">
            ✨ You have extra money! Consider putting it towards your highest APR debt.
          </div>
        ) : (
          <div className="text-xs text-orange-300">
            ⚠️ You're tight this month. Review your discretionary spending.
          </div>
        )}
      </div>
    </div>
  );
}
