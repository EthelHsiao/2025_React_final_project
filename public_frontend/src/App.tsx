import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CreateMusicianPage from './pages/CreateMusicianPage';
import AssembleBandPage from './pages/AssembleBandPage';
import Header from './components/layout/Header';
import './styles/index.css'; // 全域樣式

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/assemble-band" replace />} />
            <Route path="/create-musician" element={<CreateMusicianPage />} />
            <Route path="/assemble-band" element={<AssembleBandPage />} />
            {/* 未來可以加入 404 頁面 */}
          </Routes>
        </main>
        {/* Footer 可以加在這裡 */}
      </div>
    </Router>
  );
}

export default App;

// 基本樣式 (可以在 index.css 或 App.css 中)
// 確保在 public_frontend/src/styles/index.css 中有基本樣式
/*
:root {
  --primary-color: #c0392b;
  --secondary-color: #2c3e50;
  --background-color: #ecf0f1;
  --card-background: #ffffff;
  --text-color: #34495e;
  --light-text-color: #f8f9fa;
  --border-color: #bdc3c7;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--background-color);
  color: var(--text-color);
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex-grow: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
*/
