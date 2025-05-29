import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AssembleBandPage from './pages/AssembleBandPage';
import CreateMusicianPage from './pages/CreateMusicianPage';
import Header from './components/layout/Header';
import type { Musician } from './types';
// import './styles/index.css'; // Tailwind CSS is imported in main.tsx via index.css

const baseRouterPath = import.meta.env.BASE_URL;

function App() {
  const [musicians, setMusicians] = useState<Musician[]>(() => {
    const savedMusicians = localStorage.getItem('musicians');
    return savedMusicians ? JSON.parse(savedMusicians) : [];
  });

  useEffect(() => {
    localStorage.setItem('musicians', JSON.stringify(musicians));
  }, [musicians]);

  const addMusician = (musician: Musician) => {
    setMusicians((prev) => {
      // Prevent adding musician with duplicate ID (should be rare with UUIDs from form)
      if (prev.find(m => m.id === musician.id)) {
        console.warn("Attempted to add musician with duplicate ID in App:", musician.id);
        // If somehow a duplicate ID is submitted for a new musician, generate a new one or handle error
        // For now, we just update if found.
        return prev.map(m => m.id === musician.id ? musician : m);
      }
      return [...prev, musician];
    });
  };

  const updateMusician = (musicianToUpdate: Musician) => {
    setMusicians(prev => prev.map(m => m.id === musicianToUpdate.id ? musicianToUpdate : m));
  };

  const deleteMusician = (musicianId: string) => {
    setMusicians(prev => prev.filter(m => m.id !== musicianId));
  };

  return (
    <Router basename={baseRouterPath}>
      {/* Apply global background, text color, and font family */}
      <div className="app-container bg-background text-text-main font-sans min-h-screen flex flex-col">
        <Header />
        {/* page-container equivalent for max-width and centering, applied per page or here if truly global */}
        <main className="main-content flex-grow w-full">
          <Routes>
            <Route path="/" element={<Navigate to="/assemble-band" replace />} />
            <Route 
              path="/create-musician" 
              element={
                <CreateMusicianPage 
                  musicians={musicians}
                  addMusician={addMusician}
                  updateMusician={updateMusician}
                  deleteMusician={deleteMusician}
                />
              } 
            />
            <Route 
              path="/assemble-band" 
              element={<AssembleBandPage musicians={musicians} />} 
            />
            {/* 未來可以加入 404 頁面 */}
          </Routes>
        </main>
        {/* Footer 可以加在這裡 */}
      </div>
    </Router>
  );
}

export default App;

// Removed old CSS comments as styles are now handled by Tailwind and index.css for Tailwind directives
