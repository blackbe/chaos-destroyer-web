import fs from 'fs-extra';
import path from 'path';
import { AppData, Debt, Transaction, Income, Reminder, Goal, Bill } from './models';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const SEED_FILE = path.join(DATA_DIR, 'seed.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

const INITIAL_DATA: AppData = {
  debts: [],
  bills: [],
  transactions: [],
  income: [],
  reminders: [],
  goals: [],
  gamification: {
    chaoPoints: 0,
    badges: [],
    streaks: {
      onTimePay: 0,
      bestOnTimeStreak: 0
    },
    dailyChallenges: {
      completed: []
    },
    milestonesAchieved: []
  }
};

class Store {
  private data: AppData;

  constructor() {
    this.data = { ...INITIAL_DATA };
    this.load();
  }

  private load() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirpSync(DATA_DIR);
      }

      if (fs.existsSync(STORE_FILE)) {
        this.data = fs.readJSONSync(STORE_FILE);
      } else if (fs.existsSync(SEED_FILE)) {
        console.log('🌱 Loading seed data...');
        this.data = fs.readJSONSync(SEED_FILE);
        this.save(); // Create the store file immediately
      } else {
        this.save();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      this.data = { ...INITIAL_DATA };
    }
  }

  private save() {
    try {
      // Create backup before saving
      if (fs.existsSync(STORE_FILE)) {
        if (!fs.existsSync(BACKUP_DIR)) {
          fs.mkdirpSync(BACKUP_DIR);
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(BACKUP_DIR, `store-${timestamp}.json`);
        fs.copySync(STORE_FILE, backupPath);
      }
      fs.writeJSONSync(STORE_FILE, this.data, { spaces: 2 });
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // --- Getters ---
  getData(): AppData {
    return this.data;
  }

  getDebts(): Debt[] {
    return this.data.debts;
  }

  getDebt(id: string): Debt | undefined {
    return this.data.debts.find(d => d.id === id);
  }

  getBills(): Bill[] {
    return this.data.bills;
  }

  getBill(id: string): Bill | undefined {
    return this.data.bills.find(b => b.id === id);
  }

  getIncome(): Income[] {
    return this.data.income;
  }

  getReminders(): Reminder[] {
    return this.data.reminders;
  }

  getTransactions(): Transaction[] {
    return this.data.transactions;
  }

  getGoals(): Goal[] {
    return this.data.goals;
  }

  // --- Debt Mutations ---
  addDebt(debt: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const newDebt: Debt = { 
      ...debt, 
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    this.data.debts.push(newDebt);
    this.save();
    return newDebt;
  }

  updateDebt(id: string, updates: Partial<Debt>) {
    const index = this.data.debts.findIndex(d => d.id === id);
    if (index !== -1) {
      this.data.debts[index] = { 
        ...this.data.debts[index], 
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.save();
      return this.data.debts[index];
    }
    return undefined;
  }

  deleteDebt(id: string) {
    this.data.debts = this.data.debts.filter(d => d.id !== id);
    this.save();
  }

  // --- Bill Mutations ---
  addBill(bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const newBill: Bill = {
      ...bill,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    this.data.bills.push(newBill);
    this.save();
    return newBill;
  }

  updateBill(id: string, updates: Partial<Bill>) {
    const index = this.data.bills.findIndex(b => b.id === id);
    if (index !== -1) {
      this.data.bills[index] = {
        ...this.data.bills[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.save();
      return this.data.bills[index];
    }
    return undefined;
  }

  deleteBill(id: string) {
    this.data.bills = this.data.bills.filter(b => b.id !== id);
    this.save();
  }

  // --- Income Mutations ---
  addIncome(income: Omit<Income, 'id'>) {
    const newIncome: Income = { ...income, id: uuidv4() };
    this.data.income.push(newIncome);
    this.save();
    return newIncome;
  }

  updateIncome(id: string, updates: Partial<Income>) {
    const index = this.data.income.findIndex(i => i.id === id);
    if (index !== -1) {
      this.data.income[index] = { ...this.data.income[index], ...updates };
      this.save();
      return this.data.income[index];
    }
    return undefined;
  }

  deleteIncome(id: string) {
    this.data.income = this.data.income.filter(i => i.id !== id);
    this.save();
  }

  // --- Transaction Mutations ---
  addTransaction(tx: Omit<Transaction, 'id'>) {
    const newTx: Transaction = { ...tx, id: uuidv4() };
    this.data.transactions.push(newTx);
    
    // Update debt balance if transaction is a payment
    if (tx.debtId && tx.category === 'payment') {
      const debt = this.data.debts.find(d => d.id === tx.debtId);
      if (debt) {
        debt.balance = Math.max(0, debt.balance - tx.amount);
        this.updateDebt(debt.id, { balance: debt.balance });
      }
    }
    
    this.save();
    return newTx;
  }

  getTransactionsByDebt(debtId: string): Transaction[] {
    return this.data.transactions.filter(t => t.debtId === debtId);
  }

  // --- Reminder Mutations ---
  addReminder(reminder: Omit<Reminder, 'id' | 'createdAt'>) {
    const newReminder: Reminder = { 
      ...reminder, 
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    this.data.reminders.push(newReminder);
    this.save();
    return newReminder;
  }

  updateReminder(id: string, updates: Partial<Reminder>) {
    const index = this.data.reminders.findIndex(r => r.id === id);
    if (index !== -1) {
      this.data.reminders[index] = { ...this.data.reminders[index], ...updates };
      this.save();
      return this.data.reminders[index];
    }
    return undefined;
  }

  deleteReminder(id: string) {
    this.data.reminders = this.data.reminders.filter(r => r.id !== id);
    this.save();
  }

  // --- Goal Mutations ---
  addGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const newGoal: Goal = { 
      ...goal, 
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    this.data.goals.push(newGoal);
    this.save();
    return newGoal;
  }

  updateGoal(id: string, updates: Partial<Goal>) {
    const index = this.data.goals.findIndex(g => g.id === id);
    if (index !== -1) {
      this.data.goals[index] = { 
        ...this.data.goals[index], 
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.save();
      return this.data.goals[index];
    }
    return undefined;
  }

  deleteGoal(id: string) {
    this.data.goals = this.data.goals.filter(g => g.id !== id);
    this.save();
  }

  // --- Gamification Mutations ---
  getGamification() {
    if (!this.data.gamification) {
      this.data.gamification = {
        chaoPoints: 0,
        badges: [],
        streaks: {
          onTimePay: 0,
          bestOnTimeStreak: 0
        },
        dailyChallenges: {
          completed: []
        },
        milestonesAchieved: []
      };
      this.save();
    }
    return this.data.gamification;
  }

  updateGamification(updates: Partial<import('./models').Gamification>) {
    if (!this.data.gamification) {
      this.getGamification(); // Initialize if doesn't exist
    }
    this.data.gamification = { ...this.data.gamification, ...updates } as any;
    this.save();
    return this.data.gamification;
  }

  addChaoPoints(points: number) {
    const gam = this.getGamification();
    gam.chaoPoints += points;
    this.updateGamification(gam);
    return gam.chaoPoints;
  }

  unlockBadge(badgeId: string, badgeName: string, icon: string, points: number) {
    const gam = this.getGamification();
    const existing = gam.badges.find(b => b.id === badgeId);
    if (!existing) {
      gam.badges.push({
        id: badgeId,
        name: badgeName,
        icon,
        condition: '',
        points,
        earned: true,
        unlockedDate: new Date().toISOString()
      });
      this.updateGamification(gam);
      return true;
    }
    return false; // Already unlocked
  }

  // --- Validation ---
  validateDebt(debt: Partial<Debt>): string[] {
    const errors: string[] = [];
    if (debt.apr && (debt.apr < 0 || debt.apr > 100)) errors.push('APR must be 0-100%');
    if (debt.balance && debt.balance < 0) errors.push('Balance must be positive');
    if (debt.minimumPayment && debt.minimumPayment < 0) errors.push('Minimum payment must be positive');
    if (!debt.name || debt.name.trim() === '') errors.push('Name is required');
    return errors;
  }
}

export const store = new Store();
