"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.formatPercent = formatPercent;
exports.drawProgressBar = drawProgressBar;
exports.getDaysUntil = getDaysUntil;
exports.addMonths = addMonths;
exports.getDateAsString = getDateAsString;
exports.colorizeStatus = colorizeStatus;
exports.getPaymentStatus = getPaymentStatus;
exports.formatDateShort = formatDateShort;
exports.formatDateLong = formatDateLong;
const chalk_1 = __importDefault(require("chalk"));
function formatCurrency(amount) {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(absAmount);
    if (isNegative) {
        return chalk_1.default.red(`-${formatted}`);
    }
    return chalk_1.default.green(formatted);
}
function formatPercent(val) {
    return `${val.toFixed(2)}%`;
}
function drawProgressBar(current, total, width = 20) {
    const pct = Math.max(0, Math.min(1, current / total));
    const filled = Math.round(width * pct);
    const empty = width - filled;
    const chars = '█'.repeat(filled) + '░'.repeat(empty);
    return `[${chars}] ${(pct * 100).toFixed(0)}%`;
}
function getDaysUntil(dateStr) {
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
function addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}
function getDateAsString(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}
function colorizeStatus(status) {
    switch (status) {
        case 'overdue':
            return chalk_1.default.red(status);
        case 'due-soon':
            return chalk_1.default.yellow(status);
        case 'upcoming':
            return chalk_1.default.green(status);
        default:
            return status;
    }
}
function getPaymentStatus(daysUntil) {
    if (daysUntil < 0)
        return 'overdue';
    if (daysUntil <= 3)
        return 'due-soon';
    return 'upcoming';
}
function formatDateShort(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}
function formatDateLong(date) {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
