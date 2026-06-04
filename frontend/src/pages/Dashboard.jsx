import React from 'react';
import Table from '../components/common/Table.jsx';
import '../styles/form.css';
import '../styles/table.css';

/**
 * Dashboard page with overview statistics.
 */
const Dashboard = () => {
  const stats = [
    { label: 'Total Assets', value: '1,245' },
    { label: 'Active Assets', value: '1,102' },
    { label: 'Assets Due for Depreciation', value: '45' },
    { label: 'Expiring Documents', value: '12' }
  ];

  const columns = [
    { key: 'label', label: 'Statistic', width: '300px' },
    { key: 'value', label: 'Count / Value', width: '150px' }
  ];

  return (
    <div>
      <h2 style={{ fontSize: '16px', marginBottom: '15px', color: '#003399' }}>
        ASSETS MODULE - Dashboard
      </h2>
      
      <div className="form-container">
        <div className="form-section-title">Module Overview</div>
        <Table columns={columns} data={stats} />
      </div>
    </div>
  );
};

export default Dashboard;
