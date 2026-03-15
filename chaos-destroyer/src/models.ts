export interface Debt {
  id: string;
  name: string;
  type: 'debt' | 'asset';
  balance: number; // current balance (positive for all; type determines interpretation)
  minimumPayment: number;
  dueDate: string; // day of month (e.g., "15") or ISO date
  apr: number; // annual percentage rate (e.g. 24.99)
  payoffPriority: number; // user-customizable, lower = higher priority (Avalanche default)
  originalBalance?: number; // track for progress calculations
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO date
  amount: number;
  debtId?: string; // optional, for payments toward specific debts
  billId?: string; // optional, for bill payments
  category: string; // 'payment', 'income', 'bill', etc.
  description?: string;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'irregular';
  isPaused?: boolean;
  lastUpdated: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // day of month or ISO date
  frequency: 'monthly' | 'biweekly' | 'weekly' | 'one-time'; // one-time for non-recurring
  category: 'housing' | 'utilities' | 'insurance' | 'subscription' | 'food' | 'transport' | 'other';
  isRecurring: boolean;
  splitAmount?: number; // if shared expense
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  dueDate: string; // ISO date when reminder should trigger
  type: 'debt' | 'bill' | 'goal' | 'review';
  status: 'pending' | 'done' | 'snoozed';
  daysBefore: number; // default 2
  relatedDebtId?: string; // Link to debt if auto-generated
  relatedBillId?: string; // Link to bill if auto-generated
  customText?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount?: number;
  currentAmount: number;
  dueDate: string;
  progressPercent: number; // 0-100
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayoffProjection {
  debtId: string;
  debtName: string;
  apr: number;
  currentBalance: number;
  monthsToPayoff: number;
  monthsWithExtra?: number; // with extra payment
  interestPaid: number;
  payoffDate: string; // ISO date
  totalPaid: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  condition: string;
  points: number;
  earned: boolean;
  unlockedDate?: string;
  progress?: number; // For badges with progress tracking (e.g., "2/3 months")
  required?: number; // Total required for progress badges
}

export interface Streak {
  onTimePay: number; // current on-time payment streak
  bestOnTimeStreak: number; // best all-time
  lastPaymentDate?: string; // date of last on-time payment
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  completedDate?: string;
}

export interface Gamification {
  chaoPoints: number; // total points earned
  badges: Badge[];
  streaks: Streak;
  dailyChallenges: {
    today?: DailyChallenge;
    completed: string[]; // dates of completed challenges (YYYY-MM-DD)
  };
  milestonesAchieved: {
    debtId: string;
    milestone: string; // e.g., "$1000-paid", "50%-paid", "100%-paid"
    achievedDate: string;
  }[];
}

export interface AppData {
  debts: Debt[];
  bills: Bill[];
  transactions: Transaction[];
  income: Income[];
  reminders: Reminder[];
  goals: Goal[];
  gamification?: Gamification;
  lastBackup?: string;
}
