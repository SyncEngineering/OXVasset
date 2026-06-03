import React from 'react';

/**
 * Common modal component.
 */
const Modal = ({ title, isOpen, onClose, children, width = '500px' }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        width: width,
        border: '1px solid #ccc',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          backgroundColor: '#003399',
          color: 'white',
          padding: '6px 10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
          fontSize: '13px'
        }}>
          <span>{title}</span>
          <span
            onClick={onClose}
            style={{ cursor: 'pointer', fontSize: '18px' }}
          >
            &times;
          </span>
        </div>
        <div style={{ padding: '15px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
