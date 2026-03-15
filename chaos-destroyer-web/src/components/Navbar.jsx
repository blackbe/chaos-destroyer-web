import { supabase } from '../lib/supabase';

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'debts', label: 'Debts' },
  { id: 'bills', label: 'Bills' },
  { id: 'income', label: 'Income' },
  { id: 'goals', label: 'Goals' },
  { id: 'payoff-planner', label: 'Payoff Planner' },
  { id: 'badges', label: 'Badges' },
  { id: 'challenges', label: 'Challenges' },
  { id: 'reminders', label: 'Reminders' },
  { id: 'reports', label: 'Reports' },
];

export default function Navbar({ currentPage, onNavigate, user }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-vibe-dark/95 to-transparent backdrop-blur-md border-b border-chaos-600/30">
      <div className="max-w-7xl mx-auto px-4 py-2">
        {/* Header and Navigation on same line */}
        <div className="flex items-center gap-4 justify-between">
          <h1 className="text-sm font-bold chaos-text flex-shrink-0 px-2 py-0.5 border border-chaos-500 rounded shadow-md shadow-chaos-600/40 bg-gradient-to-r from-chaos-900/50 to-transparent">CHAOS DESTROYER</h1>

          {/* Navigation menu centered */}
          <div className="flex gap-1 justify-center flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-2 py-0.5 text-xs font-bold rounded whitespace-nowrap transition-all flex-shrink-0 border ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-chaos-600 to-purple-600 text-white shadow-md shadow-chaos-600/60 border-chaos-400'
                    : 'text-cyan-300 border-gray-600 hover:text-white hover:bg-chaos-600/40 hover:border-chaos-500'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Logout button on right */}
          <button
            onClick={handleLogout}
            className="px-2 py-0.5 text-xs font-bold text-red-300 border border-red-600 rounded whitespace-nowrap transition-all flex-shrink-0 hover:bg-red-900/40 hover:text-red-200 hover:border-red-400 hover:shadow-md hover:shadow-red-600/40"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
