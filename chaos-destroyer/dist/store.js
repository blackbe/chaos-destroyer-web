"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const DATA_DIR = path_1.default.join(process.cwd(), 'data');
const STORE_FILE = path_1.default.join(DATA_DIR, 'store.json');
const SEED_FILE = path_1.default.join(DATA_DIR, 'seed.json');
const BACKUP_DIR = path_1.default.join(DATA_DIR, 'backups');
const INITIAL_DATA = {
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
    constructor() {
        this.data = { ...INITIAL_DATA };
        this.load();
    }
    load() {
        try {
            if (!fs_extra_1.default.existsSync(DATA_DIR)) {
                fs_extra_1.default.mkdirpSync(DATA_DIR);
            }
            if (fs_extra_1.default.existsSync(STORE_FILE)) {
                this.data = fs_extra_1.default.readJSONSync(STORE_FILE);
            }
            else if (fs_extra_1.default.existsSync(SEED_FILE)) {
                console.log('🌱 Loading seed data...');
                this.data = fs_extra_1.default.readJSONSync(SEED_FILE);
                this.save(); // Create the store file immediately
            }
            else {
                this.save();
            }
        }
        catch (error) {
            console.error('Error loading data:', error);
            this.data = { ...INITIAL_DATA };
        }
    }
    save() {
        try {
            // Create backup before saving
            if (fs_extra_1.default.existsSync(STORE_FILE)) {
                if (!fs_extra_1.default.existsSync(BACKUP_DIR)) {
                    fs_extra_1.default.mkdirpSync(BACKUP_DIR);
                }
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const backupPath = path_1.default.join(BACKUP_DIR, `store-${timestamp}.json`);
                fs_extra_1.default.copySync(STORE_FILE, backupPath);
            }
            fs_extra_1.default.writeJSONSync(STORE_FILE, this.data, { spaces: 2 });
        }
        catch (error) {
            console.error('Error saving data:', error);
        }
    }
    // --- Getters ---
    getData() {
        return this.data;
    }
    getDebts() {
        return this.data.debts;
    }
    getDebt(id) {
        return this.data.debts.find(d => d.id === id);
    }
    getBills() {
        return this.data.bills;
    }
    getBill(id) {
        return this.data.bills.find(b => b.id === id);
    }
    getIncome() {
        return this.data.income;
    }
    getReminders() {
        return this.data.reminders;
    }
    getTransactions() {
        return this.data.transactions;
    }
    getGoals() {
        return this.data.goals;
    }
    // --- Debt Mutations ---
    addDebt(debt) {
        const now = new Date().toISOString();
        const newDebt = {
            ...debt,
            id: (0, uuid_1.v4)(),
            createdAt: now,
            updatedAt: now
        };
        this.data.debts.push(newDebt);
        this.save();
        return newDebt;
    }
    updateDebt(id, updates) {
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
    deleteDebt(id) {
        this.data.debts = this.data.debts.filter(d => d.id !== id);
        this.save();
    }
    // --- Bill Mutations ---
    addBill(bill) {
        const now = new Date().toISOString();
        const newBill = {
            ...bill,
            id: (0, uuid_1.v4)(),
            createdAt: now,
            updatedAt: now
        };
        this.data.bills.push(newBill);
        this.save();
        return newBill;
    }
    updateBill(id, updates) {
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
    deleteBill(id) {
        this.data.bills = this.data.bills.filter(b => b.id !== id);
        this.save();
    }
    // --- Income Mutations ---
    addIncome(income) {
        const newIncome = { ...income, id: (0, uuid_1.v4)() };
        this.data.income.push(newIncome);
        this.save();
        return newIncome;
    }
    updateIncome(id, updates) {
        const index = this.data.income.findIndex(i => i.id === id);
        if (index !== -1) {
            this.data.income[index] = { ...this.data.income[index], ...updates };
            this.save();
            return this.data.income[index];
        }
        return undefined;
    }
    deleteIncome(id) {
        this.data.income = this.data.income.filter(i => i.id !== id);
        this.save();
    }
    // --- Transaction Mutations ---
    addTransaction(tx) {
        const newTx = { ...tx, id: (0, uuid_1.v4)() };
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
    getTransactionsByDebt(debtId) {
        return this.data.transactions.filter(t => t.debtId === debtId);
    }
    // --- Reminder Mutations ---
    addReminder(reminder) {
        const newReminder = {
            ...reminder,
            id: (0, uuid_1.v4)(),
            createdAt: new Date().toISOString()
        };
        this.data.reminders.push(newReminder);
        this.save();
        return newReminder;
    }
    updateReminder(id, updates) {
        const index = this.data.reminders.findIndex(r => r.id === id);
        if (index !== -1) {
            this.data.reminders[index] = { ...this.data.reminders[index], ...updates };
            this.save();
            return this.data.reminders[index];
        }
        return undefined;
    }
    deleteReminder(id) {
        this.data.reminders = this.data.reminders.filter(r => r.id !== id);
        this.save();
    }
    // --- Goal Mutations ---
    addGoal(goal) {
        const now = new Date().toISOString();
        const newGoal = {
            ...goal,
            id: (0, uuid_1.v4)(),
            createdAt: now,
            updatedAt: now
        };
        this.data.goals.push(newGoal);
        this.save();
        return newGoal;
    }
    updateGoal(id, updates) {
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
    deleteGoal(id) {
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
    updateGamification(updates) {
        if (!this.data.gamification) {
            this.getGamification(); // Initialize if doesn't exist
        }
        this.data.gamification = { ...this.data.gamification, ...updates };
        this.save();
        return this.data.gamification;
    }
    addChaoPoints(points) {
        const gam = this.getGamification();
        gam.chaoPoints += points;
        this.updateGamification(gam);
        return gam.chaoPoints;
    }
    unlockBadge(badgeId, badgeName, icon, points) {
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
    validateDebt(debt) {
        const errors = [];
        if (debt.apr && (debt.apr < 0 || debt.apr > 100))
            errors.push('APR must be 0-100%');
        if (debt.balance && debt.balance < 0)
            errors.push('Balance must be positive');
        if (debt.minimumPayment && debt.minimumPayment < 0)
            errors.push('Minimum payment must be positive');
        if (!debt.name || debt.name.trim() === '')
            errors.push('Name is required');
        return errors;
    }
}
exports.store = new Store();
