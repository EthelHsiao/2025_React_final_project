import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MusicianManagementPage from './pages/MusicianManagementPage';
import BandAssemblyPage from './pages/BandAssemblyPage';
// import NotFoundPage from './pages/NotFoundPage'; // 稍後創建
import './App.css'; // 可以保留或移除，視您的 CSS 策略而定

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/musicians" replace />} />
        <Route path="/musicians" element={<MusicianManagementPage />} />
        <Route path="/assemble" element={<BandAssemblyPage />} />
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App; 