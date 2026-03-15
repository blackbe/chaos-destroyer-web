import type { Debt, Bill, Income, Transaction } from '../types';

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function calculateNetWorth(debts: Debt[]): number {
  return debts.reduce((total, debt) => {
    if (debt.type === 'asset') {
      return total + debt.balance;
    } else {
      return total - debt.balance;
    }
  }, 0);
}

export function calculateTotalDebt(debts: Debt[]): number {
  return debts
    .filter((d) => d.type === 'debt')
    .reduce((total, debt) => total + debt.balance, 0);
}

export function calculateTotalMonthlyIncome(income: Income[]): number {
  return income.reduce((total, inc) => {
    if (inc.isPaused) return total;
    
    switch (inc.frequency) {
      case 'weekly':
        return total + (inc.amount * 52) / 12;
      case 'biweekly':
        return total + (inc.amount * 26) / 12;
      case 'monthly':
        return total + inc.amount;
      case 'irregular':
        return total; // Don't include irregular in calculations
      default:
        return total;
    }
  }, 0);
}

export function calculateTotalMonthlyBills(bills: Bill[]): number {
  return bills.reduce((total, bill) => {
    if (!bill.isRecurring && bill.frequency === 'one-time') {
      return total;
    }

    switch (bill.frequency) {
      case 'weekly':
        return total + (bill.amount * 52) / 12;
      case 'biweekly':
        return total + (bill.amount * 26) / 12;
      case 'monthly':
        return total + bill.amount;
      case 'one-time':
        return total;
      default:
        return total;
    }
  }, 0);
}

export function calculateMonthlyBreathingRoom(
  income: Income[],
  bills: Bill[],
  debts: Debt[]
): number {
  const monthlyIncome = calculateTotalMonthlyIncome(income);
  const monthlyBills = calculateTotalMonthlyBills(bills);
  const monthlyDebtMinimums = debts.reduce((total, debt) => {
    return total + debt.minimumPayment;
  }, 0);

  return monthlyIncome - monthlyBills - monthlyDebtMinimums;
}

export function calculateMonthlyInterest(debt: Debt): number {
  return (debt.balance * debt.apr) / 12 / 100;
}

export function calculatePayoffProjection(
  balance: number,
  apr: number,
  payment: number
): {
  months: number;
  interestPaid: number;
  payoffDate: string;
  totalPaid: number;
} {
  let remaining = balance;
  let interest = 0;
  let months = 0;
  const monthlyRate = apr / 12 / 100;

  while (remaining > 0 && months < 600) {
    const monthlyInterest = remaining * monthlyRate;
    interest += monthlyInterest;
    remaining = remaining + monthlyInterest - payment;
    months++;

    if (months >= 600) {
      // Cap at 50 years
      return {
        months: 600,
        interestPaid: interest,
        payoffDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 50)
        ).toISOString(),
        totalPaid: balance + interest,
      };
    }
  }

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + months);

  return {
    months,
    interestPaid: interest,
    payoffDate: payoffDate.toISOString(),
    totalPaid: balance + interest,
  };
}

export function getProgressPercentage(
  current: number,
  total: number
): number {
  if (total === 0) return 100;
  return Math.min(100, Math.max(0, (1 - current / total) * 100));
}

export function getDayOfMonth(dateString: string): number {
  const date = new Date(dateString);
  return date.getDate();
}

export function getDebtProgressColor(percentage: number): string {
  if (percentage < 25) return 'text-red-500';
  if (percentage < 50) return 'text-orange-500';
  if (percentage < 75) return 'text-yellow-500';
  return 'text-green-500';
}

export function getProgressBarColor(percentage: number): string {
  if (percentage < 25) return 'bg-red-500';
  if (percentage < 50) return 'bg-orange-500';
  if (percentage < 75) return 'bg-yellow-500';
  return 'bg-green-500';
}

export function calculateChallengeProgress(
  completed: string[]
): {
  completed: number;
  percentage: number;
} {
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.substring(0, 7);
  
  const monthCompleted = completed.filter((date) =>
    date.startsWith(thisMonth)
  ).length;

  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();

  return {
    completed: monthCompleted,
    percentage: (monthCompleted / daysInMonth) * 100,
  };
}

export function isTodayChallenge(dateString: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
}

export function getUpcomingReminders(reminders: any[]) {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  return reminders
    .filter((r) => r.status === 'pending')
    .filter((r) => {
      const dueDate = new Date(r.dueDate);
      return dueDate >= today && dueDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}
