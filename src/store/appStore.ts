import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Debt, Bill, Income, Transaction, Goal, Reminder, Gamification } from '../types';

interface AppStore {
  // Data
  debts: Debt[];
  bills: Bill[];
  income: Income[];
  transactions: Transaction[];
  goals: Goal[];
  reminders: Reminder[];
  gamification: Gamification | null;

  // Loading state
  loading: boolean;
  error: string | null;

  // Debt actions
  setDebts: (debts: Debt[]) => void;
  addDebt: (debt: Debt) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  reorderDebts: (debts: Debt[]) => void;

  // Bill actions
  setBills: (bills: Bill[]) => void;
  addBill: (bill: Bill) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  deleteBill: (id: string) => void;

  // Income actions
  setIncome: (income: Income[]) => void;
  addIncome: (inc: Income) => void;
  updateIncome: (id: string, updates: Partial<Income>) => void;
  deleteIncome: (id: string) => void;

  // Transaction actions
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;

  // Goal actions
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // Reminder actions
  setReminders: (reminders: Reminder[]) => void;
  addReminder: (reminder: Reminder) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;

  // Gamification actions
  setGamification: (gamification: Gamification) => void;
  addChaoPoints: (points: number) => void;
  unlockBadge: (badgeId: string) => void;
  completeDailyChallenge: (challengeId: string) => void;
  recordOnTimePayment: () => void;

  // UI/Loading
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppStore>(
  persist(
    (set) => ({
  // Initial state
  debts: [],
  bills: [],
  income: [],
  transactions: [],
  goals: [],
  reminders: [],
  gamification: null,
  loading: false,
  error: null,

  // Debt actions
  setDebts: (debts) => set({ debts }),
  addDebt: (debt) => set((state) => ({ debts: [...state.debts, debt] })),
  updateDebt: (id, updates) =>
    set((state) => ({
      debts: state.debts.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),
  deleteDebt: (id) =>
    set((state) => ({
      debts: state.debts.filter((d) => d.id !== id),
    })),
  reorderDebts: (debts) => set({ debts }),

  // Bill actions
  setBills: (bills) => set({ bills }),
  addBill: (bill) => set((state) => ({ bills: [...state.bills, bill] })),
  updateBill: (id, updates) =>
    set((state) => ({
      bills: state.bills.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    })),
  deleteBill: (id) =>
    set((state) => ({
      bills: state.bills.filter((b) => b.id !== id),
    })),

  // Income actions
  setIncome: (income) => set({ income }),
  addIncome: (inc) => set((state) => ({ income: [...state.income, inc] })),
  updateIncome: (id, updates) =>
    set((state) => ({
      income: state.income.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    })),
  deleteIncome: (id) =>
    set((state) => ({
      income: state.income.filter((i) => i.id !== id),
    })),

  // Transaction actions
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({ transactions: [...state.transactions, transaction] })),

  // Goal actions
  setGoals: (goals) => set({ goals }),
  addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
  updateGoal: (id, updates) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    })),
  deleteGoal: (id) =>
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
    })),

  // Reminder actions
  setReminders: (reminders) => set({ reminders }),
  addReminder: (reminder) =>
    set((state) => ({ reminders: [...state.reminders, reminder] })),
  updateReminder: (id, updates) =>
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),
  deleteReminder: (id) =>
    set((state) => ({
      reminders: state.reminders.filter((r) => r.id !== id),
    })),

  // Gamification actions
  setGamification: (gamification) => set({ gamification }),
  addChaoPoints: (points) =>
    set((state) => ({
      gamification: state.gamification
        ? {
            ...state.gamification,
            chaoPoints: state.gamification.chaoPoints + points,
          }
        : null,
    })),
  unlockBadge: (badgeId) =>
    set((state) => ({
      gamification: state.gamification
        ? {
            ...state.gamification,
            badges: state.gamification.badges.map((b) =>
              b.id === badgeId ? { ...b, earned: true } : b
            ),
          }
        : null,
    })),
  completeDailyChallenge: (challengeId) =>
    set((state) => ({
      gamification: state.gamification
        ? {
            ...state.gamification,
            dailyChallenges: {
              ...state.gamification.dailyChallenges,
              today:
                state.gamification.dailyChallenges.today?.id === challengeId
                  ? {
                      ...state.gamification.dailyChallenges.today,
                      completed: true,
                    }
                  : state.gamification.dailyChallenges.today,
            },
          }
        : null,
    })),
  recordOnTimePayment: () =>
    set((state) => ({
      gamification: state.gamification
        ? {
            ...state.gamification,
            streaks: {
              ...state.gamification.streaks,
              onTimePay: state.gamification.streaks.onTimePay + 1,
              lastPaymentDate: new Date().toISOString(),
            },
          }
        : null,
    })),

  // UI/Loading
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
    }),
    {
      name: 'chaos-destroyer-store',
      storage: typeof window !== 'undefined' ? localStorage : undefined,
    }
  )
);
