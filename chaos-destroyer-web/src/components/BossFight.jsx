import ProgressBar from './ProgressBar';
import { formatCurrency } from '../lib/utils';

export default function BossFight({ boss, progress = 0, chaoPoints = 0 }) {
  if (!boss) return null;

  const bossNames = {
    'chase': 'CHASE CC',
    'onpoint': 'ONPOINT CC',
    'discover': 'DISCOVER CARD',
  };

  const bossName = bossNames[boss.id?.toLowerCase()] || boss.name.toUpperCase();
  const hpPercent = 100 - (progress || 0);

  return (
    <div className="chaos-card border-2 border-chaos-600 shadow-xl shadow-chaos-600/20">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-bold chaos-text">⚔️ CURRENT BOSS FIGHT</h2>
        <div className="text-xs text-vibe-gold font-bold">
          {chaoPoints} ⚡ CHAO POINTS
        </div>
      </div>

      <div className="bg-vibe-dark/50 p-1 rounded-lg border border-chaos-600/20 mb-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold text-gray-400">{bossName}</span>
          <span className="text-xs font-bold text-gray-400">
            {boss.balance > 0 ? `HP: ${hpPercent.toFixed(0)}%` : '💀 DEFEATED'}
          </span>
        </div>

        <ProgressBar
          percentage={hpPercent}
          label="BOSS HEALTH"
          showLabel={false}
          height="h-3"
        />

        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>Remaining: {formatCurrency(boss.balance || 0)}</span>
          <span>APR: {(boss.apr || 0).toFixed(2)}%</span>
          <span>Original: {formatCurrency(boss.originalBalance || boss.balance || 0)}</span>
        </div>
      </div>

      {(progress || 0) > 0 && (
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-1">
          <div className="text-xs text-green-300">
            ✨ You're damaging {boss.name}! {(progress || 0).toFixed(1)}% defeated
          </div>
        </div>
      )}
    </div>
  );
}
