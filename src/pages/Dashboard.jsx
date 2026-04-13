import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import {
  calculateNetWorth,
  calculateTotalDebt,
  calculateTotalMonthlyIncome,
  calculateTotalMonthlyBills,
  calculateMonthlyBreathingRoom,
  getProgressPercentage,
  getProgressBarColor,
} from '../lib/utils';
import StatsBox from '../components/StatsBox';
import ProgressBar from '../components/ProgressBar';
import BossFight from '../components/BossFight';
import AchievementsSection from '../components/AchievementsSection';
import DailyChallenge from '../components/DailyChallenge';
import DebtProgressList from '../components/DebtProgressList';
import CashFlowSummary from '../components/CashFlowSummary';

export default function Dashboard() {
  const location = useLocation();
  const {
    debts,
    bills,
    income,
    gamification,
    setDebts,
    setBills,
    setIncome,
    setGamification,
  } = useAppStore();

  // Load data from Supabase on mount and when returning to dashboard
  useEffect(() => {
    loadDashboardData();
  }, [location.pathname]);

  async function loadDashboardData() {
    try {
      const { supabase } = await import('../lib/supabase');
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user?.id) return;
      
      const userId = user.user.id;
      
      // Fetch bills
      const { data: billsData } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', userId);
      
      // Map bills to ensure numeric values
      const mappedBills = billsData?.map(bill => ({
        ...bill,
        amount: parseFloat(bill.amount) || 0,
        dueDate: bill.due_date,
        status: bill.status || 'active',
      })) || [];
      
      // Fetch debts and remap schema columns
      const { data: debtsData } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', userId);
      
      // Fetch income
      const { data: incomeData } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', userId);
      
      // Remap debt columns to match app expectations
      const priorityMap = {
        'Chase CC': 1,
        'OnPoint CC': 2,
        'Pay Mom': 3,
        'Lawyer Fees': 4,
        'Car Loan': 5,
      };
      
      const mappedDebts = debtsData?.map(debt => ({
        ...debt,
        balance: parseFloat(debt.amount) || 0, // Map amount -> balance
        apr: parseFloat(debt.interest_rate) || 0, // Map interest_rate -> apr
        originalBalance: parseFloat(debt.original_amount) || 0, // Map original_amount -> originalBalance
        minimumPayment: parseFloat(debt.minimum_payment) || 0,
        dueDate: debt.due_date,
        lastPaid: debt.last_paid, // Include payment tracking
        payoffPriority: priorityMap[debt.name] || 99,
      })) || [];
      
      if (mappedBills.length > 0) setBills(mappedBills);
      if (mappedDebts.length > 0) setDebts(mappedDebts);
      if (incomeData && incomeData.length > 0) {
        const mappedIncome = incomeData.map(inc => ({
          ...inc,
          amount: parseFloat(inc.amount) || 0,
        }));
        setIncome(mappedIncome);
      } else {
        // Default income from Centene
        setIncome([{
          id: 'centene',
          source: 'Centene',
          amount: 7137,
          frequency: 'monthly',
          isPaused: false,
          lastUpdated: new Date().toISOString(),
        }]);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  }

  const netWorth = calculateNetWorth(debts);
  const totalDebt = calculateTotalDebt(debts);
  const monthlyIncome = calculateTotalMonthlyIncome(income);
  const monthlyBills = calculateTotalMonthlyBills(bills);
  const breathingRoom = calculateMonthlyBreathingRoom(income, bills, debts);

  // Get the main boss (first debt with highest priority)
  const bossFight = debts.sort((a, b) => a.payoffPriority - b.payoffPriority)[0];
  const bossProgress = bossFight ? getProgressPercentage(bossFight.balance, bossFight.originalBalance || bossFight.balance) : 0;

  return (
    <div className="space-y-2">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <StatsBox
          label="NET WORTH"
          value={`$${netWorth.toLocaleString()}`}
          color={netWorth >= 0 ? 'text-green-400' : 'text-red-400'}
        />
        <StatsBox
          label="TOTAL DEBT"
          value={`$${totalDebt.toLocaleString()}`}
          color="text-chaos-400"
        />
        <StatsBox
          label="MONTHLY INCOME"
          value={`$${Math.round(monthlyIncome).toLocaleString()}`}
          color="text-vibe-lime"
        />
        <StatsBox
          label="BREATHING ROOM"
          value={`$${Math.round(breathingRoom).toLocaleString()}`}
          color={breathingRoom > 0 ? 'text-green-400' : 'text-orange-400'}
        />
      </div>

      {/* Gamification Stats */}
      {gamification && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <StatsBox
            label="CHAO POINTS"
            value={gamification.chaoPoints}
            color="text-vibe-gold"
          />
          <StatsBox
            label="CURRENT STREAK"
            value={`${gamification.streaks.onTimePay} days`}
            color="text-vibe-cyan"
          />
          <StatsBox
            label="BEST STREAK"
            value={`${gamification.streaks.bestOnTimeStreak} days`}
            color="text-vibe-lime"
          />
        </div>
      )}

      {/* Boss Fight Section */}
      {bossFight && (
        <BossFight
          boss={bossFight}
          progress={bossProgress}
          chaoPoints={gamification?.chaoPoints || 0}
        />
      )}

      {/* Achievements Section - Only show if streak > 0 */}
      {gamification && gamification.streaks.onTimePay > 0 && (
        <AchievementsSection
          gamification={gamification}
        />
      )}

      {/* Daily Challenge */}
      {gamification && (
        <DailyChallenge
          challenge={gamification.dailyChallenges.today}
          onComplete={() => {
            // This would update in Supabase
            console.log('Challenge completed');
          }}
        />
      )}

      {/* Debt Progress */}
      <div className="chaos-card">
        <h2 className="text-sm font-bold chaos-text mb-2">DEBT PROGRESS</h2>
        <DebtProgressList debts={debts} />
      </div>

      {/* Cash Flow Summary */}
      <CashFlowSummary
        income={monthlyIncome}
        bills={monthlyBills}
        debtMinimums={debts.reduce((sum, d) => sum + (d.minimumPayment || 0), 0)}
        breathingRoom={breathingRoom}
      />

      {/* Quick Stats */}
      <div className="chaos-card">
        <h2 className="text-sm font-bold chaos-text mb-2">QUICK STATS</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="text-center">
            <div className="text-xs text-gray-400">Active Debts</div>
            <div className="text-xs font-bold text-chaos-400">{debts.length}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Avg APR</div>
            <div className="text-xs font-bold text-vibe-gold">
              {debts.length > 0
                ? (debts.reduce((sum, d) => sum + (d.apr || 0), 0) / debts.length).toFixed(1)
                : 0}
              %
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Debt Progress</div>
            <div className="text-xs font-bold text-vibe-cyan">
              {bossFight ? bossProgress.toFixed(0) : 0}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Income Sources</div>
            <div className="text-xs font-bold text-vibe-lime">{income.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
