import chalk from 'chalk';
import { format } from 'date-fns';

export function formatCurrency(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(absAmount);
  
  if (isNegative) {
    return chalk.red(`-${formatted}`);
  }
  return chalk.green(formatted);
}

export function formatPercent(val: number): string {
  return `${val.toFixed(2)}%`;
}

export function drawProgressBar(current: number, total: number, width: number = 20): string {
  const pct = Math.max(0, Math.min(1, current / total));
  const filled = Math.round(width * pct);
  const empty = width - filled;
  const chars = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${chars}] ${(pct * 100).toFixed(0)}%`;
}

export function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // If it looks like a day of month (1-31)
  if (dateStr.match(/^\d{1,2}$/)) {
    const day = parseInt(dateStr, 10);
    let target = new Date(today.getFullYear(), today.getMonth(), day);
    if (target < today) {
      target = new Date(today.getFullYear(), today.getMonth() + 1, day);
    }
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // ISO Date
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function getDateAsString(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function colorizeStatus(status: string): string {
  switch (status) {
    case 'overdue':
      return chalk.red(status);
    case 'due-soon':
      return chalk.yellow(status);
    case 'upcoming':
      return chalk.green(status);
    default:
      return status;
  }
}

export function getPaymentStatus(daysUntil: number): string {
  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= 3) return 'due-soon';
  return 'upcoming';
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
