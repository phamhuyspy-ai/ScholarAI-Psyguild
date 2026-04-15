import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ResearchDesign from './pages/ResearchDesign';
import TopicCheck from './pages/TopicCheck';
import PlagiarismCheck from './pages/PlagiarismCheck';
import Translation from './pages/Translation';
import ContentStrategy from './pages/ContentStrategy';
import ChannelStrategy from './pages/ChannelStrategy';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import { useAuth } from './lib/auth';

function AppRoutes() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="design" element={user ? <ResearchDesign /> : <Navigate to="/" replace />} />
        <Route path="topic" element={user ? <TopicCheck /> : <Navigate to="/" replace />} />
        <Route path="plagiarism" element={user ? <PlagiarismCheck /> : <Navigate to="/" replace />} />
        <Route path="translation" element={user ? <Translation /> : <Navigate to="/" replace />} />
        <Route path="content-strategy" element={user ? <ContentStrategy /> : <Navigate to="/" replace />} />
        <Route path="channel-strategy" element={user ? <ChannelStrategy /> : <Navigate to="/" replace />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="settings" element={isAdmin ? <Settings /> : <Navigate to="/" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('current_user');
      // Optionally clear other session-specific data
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
