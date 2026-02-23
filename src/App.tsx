import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/core/MainLayout';
import ExplorePage from './pages/ExplorePage';
import TimelinePage from './pages/TimelinePage';
import ArtFormsPage from './pages/ArtFormsPage';
import GamesPage from './pages/GamesPage';
import GlossaryPage from './pages/GlossaryPage';
import AcknowledgementPage from './pages/AcknowledgementPage';

function App() {
  // #region agent log
  try {
    const payload = { sessionId: 'a384df', runId: 'init', hypothesisId: 'H1', location: 'App.tsx:render', message: 'App render', data: { path: typeof window !== 'undefined' ? window.location.pathname : 'ssr' }, timestamp: Date.now() };
    console.log('[DEBUG a384df]', JSON.stringify(payload));
    fetch('http://127.0.0.1:7916/ingest/c9913420-3ae7-4281-95f6-9d1d10e6cbdc', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a384df' }, body: JSON.stringify(payload) }).catch(() => {});
  } catch (_) {}
  // #endregion
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/explore" replace />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="explore/:stateId" element={<ExplorePage />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="artforms" element={<ArtFormsPage />} />
          <Route path="games" element={<GamesPage />} />
          <Route path="glossary" element={<GlossaryPage />} />
          <Route path="acknowledgement" element={<AcknowledgementPage />} />
          <Route path="admin" element={<div className="p-8 text-center text-slate-600">Admin (coming soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
