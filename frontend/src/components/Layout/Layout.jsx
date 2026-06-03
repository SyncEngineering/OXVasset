import React from 'react';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import '../../styles/global.css';
import '../../styles/layout.css';

/**
 * Main layout component that wraps the entire application.
 */
const Layout = ({ children, title }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header title={title} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
