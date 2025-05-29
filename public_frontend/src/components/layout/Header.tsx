import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// import './Header.css'; // Removed as styles will be applied via Tailwind CSS

const Header: React.FC = () => {
  const location = useLocation();

  const getNavLinkClass = (path: string) => {
    const baseClass = "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out";
    if (location.pathname === path) {
      return `${baseClass} bg-primary text-text-inverted shadow-lg`;
    }
    return `${baseClass} text-secondary hover:bg-primary hover:text-text-inverted hover:shadow-md`;
  };

  return (
    <header className="bg-card shadow-DEFAULT sticky top-0 z-50 h-header-height border-b border-tertiary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary font-serif tracking-wider">
          虛擬樂隊產生器
        </Link>
        <nav className="flex space-x-4">
          <Link 
            to="/create-musician" 
            className={getNavLinkClass('/create-musician')}
          >
            建立音樂家
          </Link>
          <Link 
            to="/assemble-band" 
            className={getNavLinkClass('/assemble-band')}
          >
            樂隊組建
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 