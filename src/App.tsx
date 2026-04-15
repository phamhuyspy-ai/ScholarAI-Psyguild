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
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="design" element={<ResearchDesign />} />
        <Route path="topic" element={<TopicCheck />} />
        <Route path="plagiarism" element={<PlagiarismCheck />} />
        <Route path="translation" element={<Translation />} />
        <Route path="content-strategy" element={<ContentStrategy />} />
        <Route path="channel-strategy" element={<ChannelStrategy />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="settings" element={isAdmin ? <Settings /> : <Navigate to="/" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
