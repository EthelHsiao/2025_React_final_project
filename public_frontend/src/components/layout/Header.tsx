import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="logo">
          虛擬樂隊產生器
        </Link>
        <nav className="main-nav">
          <Link 
            to="/create-musician" 
            className={`nav-link ${location.pathname === '/create-musician' ? 'active' : ''}`}
          >
            建立音樂家
          </Link>
          <Link 
            to="/assemble-band" 
            className={`nav-link ${location.pathname === '/assemble-band' ? 'active' : ''}`}
          >
            樂隊組建
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 