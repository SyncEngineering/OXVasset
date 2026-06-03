import React from 'react';

/**
 * Common status badge component with pre-defined color mapping.
 */
const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    
    if (['active', 'approved', 'completed', 'posted'].includes(s)) return '#28a745'; // green
    if (['draft', 'pending'].includes(s)) return '#ffc107'; // orange
    if (['rejected', 'disposed', 'scrapped'].includes(s)) return '#dc3545'; // red
    if (['transferred', 'wip'].includes(s)) return '#007bff'; // blue
    
    return '#6c757d'; // gray default
  };

  return (
    <span
      className="status-badge"
      style={{ backgroundColor: getStatusColor(status) }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
