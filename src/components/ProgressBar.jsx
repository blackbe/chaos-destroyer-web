import { getProgressBarColor } from '../lib/utils';

export default function ProgressBar({ percentage = 0, label, showLabel = true, height = 'h-6' }) {
  const safePercentage = percentage || 0;
  const color = getProgressBarColor(safePercentage);

  return (
    <div>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-300">{label}</span>
          <span className="text-sm font-bold text-chaos-400">{safePercentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-700/50 rounded-full overflow-hidden border border-chaos-600/30 ${height}`}>
        <div
          className={`${color} ${height} transition-all duration-300 rounded-full`}
          style={{ width: `${Math.min(100, safePercentage)}%` }}
        />
      </div>
    </div>
  );
}
