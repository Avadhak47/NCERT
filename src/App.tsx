import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/core/MainLayout';
import ExplorePage from './pages/ExplorePage';
import TimelinePage from './pages/TimelinePage';
import ArtFormsPage from './pages/ArtFormsPage';
import GamesPage from './pages/GamesPage';
import GlossaryPage from './pages/GlossaryPage';
import AcknowledgementPage from './pages/AcknowledgementPage';
import AdminPage from './pages/AdminPage';

function App() {

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
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
