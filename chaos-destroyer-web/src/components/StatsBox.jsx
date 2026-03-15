export default function StatsBox({ label, value, color }) {
  return (
    <div className="chaos-card">
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-xs font-bold ${color}`}>{value}</div>
    </div>
  );
}
