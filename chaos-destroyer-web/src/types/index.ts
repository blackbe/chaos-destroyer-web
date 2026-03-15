export interface Debt {
  id: string;
  name: string;
  type: 'debt' | 'asset';
  balance: number;
  minimumPayment: number;
  dueDate: string;
  apr: number;
  payoffPriority: number;
  originalBalance?: number;
  notes: string;
  lastPaid?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  debtId?: string;
  billId?: string;
  category: string;
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
  dueDate: string;
  frequency: 'monthly' | 'biweekly' | 'weekly' | 'one-time';
  category: 'housing' | 'utilities' | 'insurance' | 'subscription' | 'food' | 'transport' | 'other';
  isRecurring: boolean;
  splitAmount?: number;
  notes: string;
  status?: 'active' | 'paused' | 'completed';
  lastPaid?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  dueDate: string;
  type: 'debt' | 'bill' | 'goal' | 'review';
  status: 'pending' | 'done' | 'snoozed';
  daysBefore: number;
  relatedDebtId?: string;
  relatedBillId?: string;
  customText?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount?: number;
  currentAmount: number;
  dueDate: string;
  progressPercent: number;
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
  monthsWithExtra?: number;
  interestPaid: number;
  payoffDate: string;
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
  progress?: number;
  required?: number;
}

export interface Streak {
  onTimePay: number;
  bestOnTimeStreak: number;
  lastPaymentDate?: string;
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
  chaoPoints: number;
  badges: Badge[];
  streaks: Streak;
  dailyChallenges: {
    today?: DailyChallenge;
    completed: string[];
  };
  milestonesAchieved: {
    debtId: string;
    milestone: string;
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

export interface User {
  id: string;
  email: string;
  createdAt: string;
}
