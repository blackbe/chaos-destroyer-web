# ✨ Chaos Destroyer - Financial Freedom Game

A powerful, interactive CLI tool for debt payoff planning with **gamification, visual progress tracking, and boss fights**. Built with TypeScript, designed to help you become debt-free and achieve all your life goals systematically.

> Transform financial management from chore to game. Make paying off debt feel like a boss fight you're winning.

## 🚀 Features

### Phase 2: Gamification & UI Polish ✨ NEW

#### 🏆 **Badges & Achievement System**
- **6 Unique Badges** with unlock conditions:
  - ⚔️ **Debt Slayer**: Pay off any debt completely
  - ⭐ **Consistency Star**: 3 months of on-time payments
  - 🎯 **Chase Hunter**: Pay off Chase CC (the boss!)
  - 💰 **Savings Master**: Save $500+ in interest
  - 🏆 **Goal Getter**: Complete any life goal
  - 🔥 **Week of Wins**: Hit financial target + complete 3 habits
- Badge progress tracking for incomplete badges
- Points system: Earn Chao Points for badges and challenges

#### 🔥 **Streaks & Consistency Rewards**
- **On-Time Payment Streaks**: Track consecutive perfect payments
- **Streak Milestones**: Celebrations at 7, 14, 30+ days
- **Best Streak Tracking**: See your personal record
- Reset on missed payments, track progress toward recovery

#### ⚔️ **Boss Fight: Chase CC**
- Chase CC displays as the "Current Boss"
- Health bar shows remaining balance ($HP)
- Every payment is damage against the boss
- Celebration when Chase is defeated
- Next boss automatically becomes your focus

#### 📅 **Daily Challenges**
- **New Challenge Each Day**: Rotate through 6 different challenges
  - No-spend days (+10 points)
  - Extra payments (+25 points)
  - Expense logging (+5 points)
  - Progress reviews (+5 points)
  - Interest awareness (+15 points)
  - Debt analysis (+10 points)
- Track completion, earn points
- Unlimited daily challenges possible

#### 🎉 **Milestone Celebrations**
- **$1,000 damage milestones**: "You've damaged Chase by $1,000! 🎯"
- **50% progress**: "Chase is halfway defeated! 💪"
- **Perfect months**: "Perfect month! 1/3 for consistency star ⭐"
- **Interest savings**: "$100 saved in interest this month 💰"
- **Multiple debts paid**: "Unstoppable force! 🔥"
- **Extra payments**: "That extra $100 saved you 3 days of interest! 💡"
- **Streak celebrations**: Major announcements at milestone days

#### 📊 **Enhanced Dashboard**
- **Visual Progress Bars**: Color-coded debt progress (red→orange→yellow→green)
- **Boss Fight Section**: Current boss health bar and damage dealt
- **Achievements Section**: Earned badges, current streak display
- **Today's Challenge**: Always visible with points reward
- **Prettier Layout**: Box-drawing characters, emoji markers, better organization

#### 📈 **Visual Progress Tracking**
- ASCII progress bars for all debts
- Color-coded by completion: 0-25% red → 50% yellow → 75% yellow-bright → 100% green
- Monthly timeline visualization
- Interest breakdown charts (ASCII style)
- Numbered emoji indicators (1️⃣ 2️⃣ 3️⃣ etc.)

#### 📄 **Prettier Reports**
- **Enhanced Monthly Reports**: Now include gamification stats
- Chao Points earned this month
- Badges unlocked and progress
- Current streak information
- Progress breakdown with visual bars
- Next steps recommendations based on data
- Beautiful header/footer with box-drawing characters

#### 🎮 **New Menu Options**
- **Badges & Streaks Menu**: View all earned badges, progress, streaks, and total points
- **Daily Challenges Menu**: See today's challenge, track completion, earn points
- Enhanced reminders with gamification awareness

### Phase 1: Core Debt Management Features

### 1. **Complete CRUD Operations**
- ✅ **Debts**: Add, edit, delete with full validation
- ✅ **Bills**: Manage recurring and one-time expenses
- ✅ **Income**: Track all income sources (Centene, Uber/Lyft, etc.)
- ✅ **Payments**: Record payments against any debt; auto-updates balances
- ✅ **Goals**: Track personal and financial goals with progress

### 2. **Avalanche Payoff Planner**
- **Kill Chase First Strategy**: Chase CC (26.49% APR) is priority #1
- **Automatic Sorting**: Debts ranked by APR (Avalanche method)
- **Scenario Runner**: Ask "What if I earn $1,000 extra?" and see instant payoff dates
- **Interest Calculations**: See exact interest costs and savings
- **Big Wow Moment**: Shows your exact debt-free date (e.g., "January 2028")

### 3. **Smart Dashboard**
- Monthly income vs. obligations
- "Breathing room" calculation
- Upcoming payments (next 30 days) with urgency coloring
- Interest cost alerts (e.g., "Chase costs you $262/month")
- Kill Chase First progress tracking
- Quick alerts for budget status

### 4. **Intelligent Reminders**
- Auto-generates reminders 2 days before due dates (Ben's preference)
- Color-coded by urgency (overdue=red, due soon=yellow, upcoming=green)
- Snooze, mark done, or customize text
- Applies to both debts and recurring bills

### 5. **Export & Reports**
- **JSON**: Full data snapshot for backup
- **CSV**: Debts, bills, transactions, income (individual or combined)
- **Monthly Report**: Formatted text summary with all key metrics
- Auto-organized in `exports/` directory

### 6. **Interactive CLI Menu**
- Keyboard-navigable with arrow keys + Enter
- Organized submenus for each feature
- Color-coded for visual clarity
- Validation on all inputs

### 7. **Full Data Persistence**
- All data auto-saves to `data/store.json`
- Automatic backups before each save
- Seed data with Ben's actual financial info
- Validation on APR (0-100%), balances, dates

## 🏗️ Phase 2 Architecture

### New Modules
- **`gamification.ts`**: Badge system, streaks, points, challenge rotation
- **`visualizations.ts`**: Progress bars, boss health bars, ASCII charts
- **`celebrations.ts`**: Milestone alerts, celebration messages, random variations
- **Data Model Updates**: New `Gamification` interface in `models.ts`
- **Store Updates**: Gamification persistence in `store.ts`

### Gamification Data Structure
```json
{
  "gamification": {
    "chaoPoints": 450,
    "badges": [
      {
        "id": "debt-slayer",
        "name": "Debt Slayer",
        "icon": "⚔️",
        "condition": "Pay off any debt completely",
        "points": 100,
        "earned": true,
        "unlockedDate": "2026-01-15T..."
      }
    ],
    "streaks": {
      "onTimePay": 14,
      "bestOnTimeStreak": 21,
      "lastPaymentDate": "2026-02-12"
    },
    "dailyChallenges": {
      "today": { /* today's challenge */ },
      "completed": ["2026-01-22", "2026-01-21"]
    },
    "milestonesAchieved": [
      { "debtId": "chase-id", "milestone": "$1000-paid", "achievedDate": "2026-02-10" }
    ]
  }
}
```

## 📊 Ben's Seeded Data

### Debts (Priority Order)
1. **Chase CC** - $11,887.24 @ 26.49% APR 🔴 TARGET
2. **OnPoint CC** - $6,078.09 @ 15.25% APR
3. **Car Loan** - $15,000 @ 5.9% (moved up!)
4. **Mom Loan** - $36,000 @ 0%
5. **Lawyer Fees** - $26,000 @ 0%
6. **Delilah College** - $2,000 @ 0%

### Income
- **Centene**: $7,137/month (primary)
- **Uber/Lyft**: Track variable earnings

### 20+ Bills
- Housing, utilities, subscriptions, food, transport
- All with configurable due dates
- Support for split/shared expenses

## 🎯 Getting Started

### Installation

```bash
cd /Users/benblack/.openclaw/workspace/chaos-destroyer
npm install
npm run build
npm start
```

### First Run

The app loads `data/seed.json` with Ben's data automatically. You'll see:
1. Dashboard with current debt total
2. Upcoming payment reminders
3. Breathing room calculation
4. Payoff plan options

### Main Menu Options

```
┌─────────────────────────────────────┐
│  ✨ CHAOS DESTROYER - MAIN MENU     │
├─────────────────────────────────────┤
│ • Dashboard                         │
│ • Debts (Add/Edit/Delete)           │
│ • Bills (Add/Edit/Delete)           │
│ • Income (Add/Edit/Delete)          │
│ • Payments (Record Payment)         │
│ • Reminders (View/Manage)           │
│ • Payoff Planner (Scenarios)        │
│ • Goals (View/Edit)                 │
│ • Export & Reports                  │
│ • Settings (Edit due dates, etc.)   │
│ • Exit                              │
└─────────────────────────────────────┘
```

## 💪 Kill Chase First Strategy

### The Default Plan
1. Pay **minimum** on all other debts
2. Send **all extra money** to Chase CC (26.49% APR)
3. Then hit OnPoint CC (15.25% APR)
4. Then tackle Car Loan (5.9% APR)
5. Finally Mom Loan and remaining debts
6. Become debt-free in ~2-3 years

### Example Scenarios

**Scenario 1: Current income only**
```
> View Default Plan
🎉 DEBT-FREE DATE: January 2029
   In 47 months (3.9 years)
Total Interest: $18,492
```

**Scenario 2: +$500/month extra (side gigs)**
```
> Run Scenario → +$500/month
🎉 DEBT-FREE DATE: July 2028
   In 29 months (2.4 years)
Total Interest: $14,203
💰 SAVES: $4,289 in interest!
```

**Scenario 3: +$1,000/month (Uber/Lyft)**
```
> Run Scenario → +$1,000/month
🎉 DEBT-FREE DATE: February 2028
   In 24 months (2.0 years)
Total Interest: $11,847
💰 SAVES: $6,645 in interest!
```

## 📋 Example Workflow

### 1. View Dashboard on Launch
```bash
$ npm start
> Dashboard
```
Shows: Total debt ($96,965), monthly income ($8,087), obligations, breathing room

### 2. Record a Payment
```bash
> Payments
Select debt: Chase CC
Amount: $1,000
✅ Payment of $1,000 recorded!
   New balance: $10,887.24
```

### 3. Run Payoff Scenario
```bash
> Payoff Planner
> Run Scenario
> What if I add $1,000/month extra?
🎉 DEBT-FREE DATE: February 2028
```

### 4. Export Monthly Report
```bash
> Export & Reports
> Monthly Report (text)
✅ Exported to exports/debt-destroyer-report-2026-02-12.txt
```

## 🔧 Configuration

### Edit Due Dates
```bash
> Settings
> Change Debt Due Dates
Select debt → Chase CC
New due date → 26
✅ Updated!
```

### Pause/Resume Income
```bash
> Income
Edit: Centene
New amount (to pause, set to 0)
```

### Customize Reminders
```bash
> Reminders
Select reminder → Chase payment due
Snooze 3 days / Mark done / Delete
```

## 📈 Payoff Progression

The dashboard shows your progress:
- **% Paid** for each debt (based on original balance)
- **Months to payoff** at current rate
- **Interest per month** for each debt
- **Total monthly interest cost**

Example:
```
Chase CC:      45.2% paid, $10,887 remaining, $262/month interest
OnPoint CC:     0% paid, $6,078 remaining, $77/month interest
Mom Loan:       0% paid, $36,000 remaining (paused)
```

## 📤 Export Formats

### JSON Export
```bash
> Export & Reports > JSON
Creates: exports/chaos-destroyer-export-2026-02-12.json
Full state snapshot: debts, bills, income, transactions, goals, reminders
```

### CSV Export
```bash
> Export & Reports > CSV (all)
Creates:
  - chaos-destroyer-debts-2026-02-12.csv
  - chaos-destroyer-bills-2026-02-12.csv
  - chaos-destroyer-transactions-2026-02-12.csv
  - chaos-destroyer-income-2026-02-12.csv
```

### Monthly Report
```bash
> Export & Reports > Monthly Report (text)
Creates: exports/chaos-destroyer-report-2026-02-12.txt
Includes: summary, debts, bills, income, cash flow, interest analysis, goals
```

## 🎯 Goals Tracking (All Life Goals)

Chao Destroyer now tracks all your goals, not just debt! Ben's seeded goals:
- **Netflix SDET 4** job application (pending)
- **Centene full-time** (50% progress, ends 3/31/26)
- **HugBack app launch** (60% progress)
- **Debt freedom** (5% progress) 🎉
- **Rebuild relationship** with child (40% progress)

Update progress anytime:
```bash
> Goals > Edit: Debt freedom
Progress (0-100): 25
```

This is what makes Chao Destroyer different—it helps you achieve all your life goals while crushing your debt.

## 🔐 Data Files

```
chaos-destroyer/
├── data/
│   ├── store.json          # Main data (auto-persisted)
│   ├── seed.json           # Ben's initial financial data
│   └── backups/            # Auto-created backups
├── exports/                # CSV, JSON, reports
├── src/                    # TypeScript source
├── dist/                   # Compiled JS
└── README.md               # This file
```

## ⚙️ Validation & Safeguards

- ✅ APR validated 0-100%
- ✅ Balances must be positive
- ✅ Minimum payments must be positive
- ✅ Debt names required
- ✅ Due dates validated (day 1-31 or ISO format)
- ✅ Warn if monthly obligations exceed income
- ✅ Auto-backup before every save

## 🐛 Troubleshooting

### Data not persisting?
Check permissions on `data/` directory. App requires write access.

### Reminders not showing?
Reminders auto-generate on app launch. If a debt due date is >2 days away, no reminder yet. Edit due dates in Settings to test.

### Want to start fresh?
```bash
rm data/store.json
npm start
# Loads seed.json again
```

## 📝 Phase 1 Checklist

- ✅ Enhanced models with Bills and full schema
- ✅ Full CRUD operations for all entities
- ✅ Avalanche payoff planner with scenarios
- ✅ Interactive CLI with all menus
- ✅ Dashboard with stats & alerts
- ✅ Reminders engine (2-day-before logic)
- ✅ Export (CSV, JSON, Report)
- ✅ Ben's full financial seed data
- ✅ End-to-end: add → pay → progress → export
- ✅ Comprehensive README

## 🎮 Try It Now

```bash
# Build and start
npm run build && npm start

# Dashboard view
> Dashboard

# Run payoff scenario
> Payoff Planner
> Run Scenario
> +$1,000/month extra

# Export report
> Export & Reports
> Monthly Report

# Record a payment
> Payments
> Chase CC
> $1,000
```

## 🚀 Next Steps

### Phase 2: UI/Gamification
- UI Polish (better tables, animations)
- Gamification (streaks, badges, progress celebrations)
- Data visualization (charts, graphs)
- Spending predictions

### Phase 3: Web UI
- Web-based dashboard
- Same vibrant color scheme
- Real-time sync with CLI
- Mobile companion app
- Bank API integrations

---

**Built with ❤️ for Ben's goals**

*Kill Chase First. Track everything. Stay focused. Achieve all your goals.*

**Chaos Destroyer: Your personal goals and debt-payoff partner**

🎯 Netflix SDET | 💼 Centene full-time | 🤗 HugBack launch | 💰 Debt-free by Jan 2029 | 💕 Rebuild family
