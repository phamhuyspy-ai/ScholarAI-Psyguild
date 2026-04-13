import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ResearchDesign from './pages/ResearchDesign';
import TopicCheck from './pages/TopicCheck';
import PlagiarismCheck from './pages/PlagiarismCheck';
import VideoAnalysis from './pages/VideoAnalysis';
import Translation from './pages/Translation';
import ContentStrategy from './pages/ContentStrategy';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="design" element={<ResearchDesign />} />
        <Route path="topic" element={<TopicCheck />} />
        <Route path="plagiarism" element={<PlagiarismCheck />} />
        <Route path="video" element={<VideoAnalysis />} />
        <Route path="translation" element={<Translation />} />
        <Route path="content-strategy" element={<ContentStrategy />} />
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
