import React from 'react';

/**
 * Global header component.
 */
const Header = ({ title }) => {
  return (
    <header className="header">
      <div className="header-title">OXIVE ERP - ASSETS MODULE</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ fontSize: '12px' }}>{title}</span>
        <button className="secondary" style={{ padding: '2px 8px' }}>Logout</button>
      </div>
    </header>
  );
};

export default Header;
