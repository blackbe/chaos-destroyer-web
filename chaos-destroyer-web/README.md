# ⚔️ CHAOS DESTROYER - Web Edition

**The Financial Freedom Game**

A React web application for gamified debt management, built with Supabase for real-time persistence. Defeat your debts like a boss fight, earn badges, maintain streaks, and unlock achievements as you climb toward financial freedom.

## 🎮 Features

### Gamification System
- **Boss Fights**: Your highest-priority debt is the boss. Watch its HP decrease with every payment
- **Badges & Achievements**: 6 unique badges with unlock conditions (Debt Slayer, Consistency Star, Chase Hunter, Savings Master, Goal Getter, Week of Wins)
- **Streak Tracking**: Maintain on-time payment streaks with milestone celebrations at 7, 14, 30+ days
- **Daily Challenges**: Rotate through 6 challenges (No-Spend Day, Extra Payment, Log Expenses, etc.) for bonus Chao Points
- **Chao Points**: Earn points from challenges, badges, and milestones to track progress

### Financial Management
- **Dashboard**: Real-time net worth, debt total, monthly income, breathing room
- **Debt Management**: Track multiple debts with balance, APR, minimum payment, due date, and priority
- **Bills Tracker**: Categorize bills (housing, utilities, insurance, subscription, food, transport, other)
- **Income Sources**: Add multiple income sources with frequency (weekly, biweekly, monthly, irregular)
- **Financial Goals**: Set and track goals with progress visualization
- **Reminders**: Customizable reminders for payments, bills, and reviews

### Analysis & Planning
- **Avalanche Payoff Planner**: Sort debts by APR (highest first) for optimal interest savings
- **Payoff Projections**: See months to payoff, interest paid, and total cost for each debt
- **Cash Flow Analysis**: Monthly income, obligations (bills + minimum debt payments), breathing room
- **Visual Progress Bars**: Color-coded bars (red → orange → yellow → green) show progress at a glance
- **Reports & Export**: PDF and JSON exports for sharing or archival

### User Interface
- **Vibrant Chaos Theme**: Dark gradient background with purple/magenta accents
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Drag-to-Reorder**: Reorder debts and priorities with drag-and-drop
- **Clickable Navigation**: Fully mouse-driven UI (no keyboard required)
- **Real-time Updates**: Supabase integration keeps everything in sync

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Supabase account (free tier available at supabase.com)

### Installation

1. **Clone or navigate to the project**
   ```bash
   cd /Users/benblack/.openclaw/workspace/chaos-destroyer-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a Supabase project at https://supabase.com
   - Get your project URL and anon key from Settings → API
   - Create the following tables:
     - `users` - User profiles
     - `debts` - Debt tracking
     - `bills` - Bill management
     - `income` - Income sources
     - `transactions` - Payment transactions
     - `goals` - Financial goals
     - `reminders` - Payment/review reminders
     - `gamification` - Gamification state (streaks, badges, points)

4. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173 in your browser

### Build for Production
```bash
npm run build
```

## 📊 Database Schema

### users
```sql
- id (UUID, PK)
- email (VARCHAR)
- created_at (TIMESTAMP)
```

### debts
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- name (VARCHAR)
- balance (DECIMAL)
- minimum_payment (DECIMAL)
- due_date (VARCHAR)
- apr (DECIMAL)
- payoff_priority (INTEGER)
- original_balance (DECIMAL)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### gamification
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- chao_points (INTEGER)
- badges (JSONB)
- streaks (JSONB)
- daily_challenges (JSONB)
- milestones_achieved (JSONB)
- updated_at (TIMESTAMP)
```

## 🔄 Data Migration

Migrate from the CLI version (Phase 2) to the React web version:

```bash
node scripts/migrate.js
```

This script reads from `../chaos-destroyer/data/store.json` and imports all data into Supabase.

## 🎯 How to Use

### Dashboard
The main view shows your financial health:
- **Net Worth**: Assets minus liabilities
- **Total Debt**: Sum of all debt balances
- **Monthly Income**: Projected monthly income
- **Breathing Room**: Income minus obligations
- **Boss Fight**: Your highest-priority debt visualized as an enemy with HP

### Record a Payment
1. Navigate to **Debts** page
2. Find the debt
3. Click "Record Payment"
4. Enter amount and confirm
5. Streak updates, milestones trigger, boss takes damage!

### Complete a Daily Challenge
1. Go to **Challenges** page
2. See today's challenge description
3. Complete the action in real life
4. Click "Complete" to earn points
5. Challenge rotates tomorrow

### View Your Badges
1. Navigate to **Badges** page
2. See earned badges (gold) and locked badges (gray)
3. See progress toward multi-step badges (e.g., "2/3 months" for Consistency Star)

### Use Payoff Planner
1. Go to **Payoff Planner** page
2. Debts auto-sorted by APR (highest first) using Avalanche method
3. See months to payoff, interest cost, and payoff date for each debt
4. Adjust your extra payment amount to see updated projections

## 🎨 Customization

### Change Color Scheme
Edit `tailwind.config.js` to customize the chaos theme colors:
```js
colors: {
  chaos: {
    600: '#c000e8',  // Primary purple
    500: '#d000ff',  // Bright magenta
  },
  vibe: {
    accent: '#ff006e',  // Hot pink accent
    cyan: '#00f5ff',    // Neon cyan
  },
}
```

### Add New Badges
Edit `src/store/appStore.ts` and define new badge unlock conditions.

### Customize Challenges
Edit the challenge definitions to match your financial goals.

## 🔧 Development

### Project Structure
```
src/
├── components/        # React components (Dashboard, Cards, etc)
├── pages/            # Page components (Debts, Bills, etc)
├── store/            # Zustand state management
├── lib/              # Utilities (calculations, Supabase)
├── types/            # TypeScript interfaces
├── services/         # API services
├── App.jsx           # Main app component
├── index.css         # Global styles with Tailwind
└── main.jsx          # React entry point
```

### Add a New Page
1. Create `src/pages/NewPage.jsx`
2. Import and add to `App.jsx` route
3. Add navigation button in `Navbar.jsx`

### State Management
Using Zustand for simple, scalable state:
```jsx
import { useAppStore } from '../store/appStore';

function MyComponent() {
  const { debts, addDebt } = useAppStore();
  // ...
}
```

## 🐛 Troubleshooting

### "Authentication failed"
- Check your Supabase URL and anon key in `.env.local`
- Ensure Supabase project is active and accessible

### "Data not persisting"
- Verify database tables exist in Supabase
- Check browser console for SQL errors
- Ensure row-level security (RLS) policies allow reads/writes

### Styling issues
- Run `npm run build:tailwind` to regenerate CSS
- Clear browser cache (Cmd+Shift+R on Mac)
- Check that `src/index.css` imports Tailwind directives

## 📱 Mobile Support

The app is fully responsive:
- **Mobile**: Single column, touch-friendly buttons
- **Tablet**: Two columns, optimized spacing
- **Desktop**: Full 4-column grid with all features

## 🔐 Security

- **Authentication**: Supabase Auth handles user login
- **Row-Level Security**: RLS policies ensure users only see their own data
- **Anon Key**: Use the anon key only (never expose the service role key)
- **HTTPS**: Deploy on Vercel, Netlify, or similar for HTTPS

## 🚢 Deployment

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Drop the 'dist' folder onto Netlify
```

Set environment variables in your hosting provider's dashboard.

## 📝 License

MIT

## 🙏 Credits

Built to help Ben achieve financial freedom. Game on! ⚔️🎯✨

---

**Current Version**: 1.0.0  
**Last Updated**: February 2026

For issues or feature requests, reach out directly!
