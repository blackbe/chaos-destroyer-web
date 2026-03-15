import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import DebtsPage from './pages/DebtsPage';
import BillsPage from './pages/BillsPage';
import IncomePage from './pages/IncomePage';
import GoalsPage from './pages/GoalsPage';
import PayoffPlannerPage from './pages/PayoffPlannerPage';
import RemindersPage from './pages/RemindersPage';
import LoginPage from './pages/LoginPage';
import BadgesPage from './pages/BadgesPage';
import ChallengesPage from './pages/ChallengesPage';
import ReportsPage from './pages/ReportsPage';

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user);
      setLoading(false);
      
      // On login, navigate to the last page they were on
      if (event === 'SIGNED_IN' && session?.user) {
        const lastPage = localStorage.getItem('lastPage');
        if (lastPage && lastPage !== '/') {
          navigate(lastPage);
        }
      }
    });

    return () => data?.subscription?.unsubscribe();
  }, [navigate]);

  // Save current page to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('lastPage', location.pathname);
    }
  }, [location.pathname, user]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleNavigate = (pageId) => {
    if (pageId === 'dashboard') {
      navigate('/');
    } else {
      navigate(`/${pageId}`);
    }
  };

  const getCurrentPage = () => {
    return location.pathname === '/' ? 'dashboard' : location.pathname.slice(1);
  };

  return (
    <>
      <Navbar currentPage={getCurrentPage()} onNavigate={handleNavigate} />
      <div className="pt-24 p-6 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/debts" element={<DebtsPage />} />
          <Route path="/bills" element={<BillsPage />} />
          <Route path="/income" element={<IncomePage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/payoff-planner" element={<PayoffPlannerPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/badges" element={<BadgesPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
