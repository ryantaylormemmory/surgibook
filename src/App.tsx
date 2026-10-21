import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthGuard } from './components/AuthGuard';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BookSurgery from './pages/BookSurgery';
import CompletedSurgeries from './pages/CompletedSurgeries';
import Anaesthetists from './pages/Anaesthetists';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import TeamChat from './pages/TeamChat';
import OnCallStatus from './pages/OnCallStatus';
import { needsOnCallNotification } from './lib/auth';

function OnCallRedirect({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const needsOnCall = needsOnCallNotification();

  useEffect(() => {
    if (needsOnCall && location.pathname !== '/oncall') {
      window.location.href = '/oncall';
    }
  }, [needsOnCall, location.pathname]);

  if (needsOnCall && location.pathname !== '/oncall') {
    return <Navigate to="/oncall" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/oncall" element={<AuthGuard><OnCallStatus /></AuthGuard>} />
      <Route element={<AuthGuard><OnCallRedirect><Layout /></OnCallRedirect></AuthGuard>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/book" element={<BookSurgery />} />
        <Route path="/completed" element={<CompletedSurgeries />} />
        <Route path="/anaesthetists" element={<Anaesthetists />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/chat" element={<TeamChat />} />
      </Route>
    </Routes>
  );
}