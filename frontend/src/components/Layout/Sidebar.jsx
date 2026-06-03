import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Sidebar navigation component with collapsible menu groups.
 */
const Sidebar = () => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState({
    masters: true,
    tasks: false,
    reports: false
  });

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const menu = {
    masters: [
      { label: 'Asset Division', path: '/masters/division' },
      { label: 'Asset Type', path: '/masters/type' },
      { label: 'Asset Category', path: '/masters/category' },
      { label: 'Asset Group', path: '/masters/group' },
      { label: 'Asset Sub Group', path: '/masters/sub-group' },
      { label: 'Asset Sub Type', path: '/masters/sub-type' },
      { label: 'Location', path: '/masters/location' },
      { label: 'Common Doc Type', path: '/masters/common-doc-type' },
      { label: 'Expiry Doc Type', path: '/masters/expiry-doc-type' },
      { label: 'Odometer Reset', path: '/masters/odometer-reset' },
      { label: 'Asset Change WIP', path: '/masters/asset-change-wip' },
      { label: 'Asset Master', path: '/masters/asset-master' }
    ],
    tasks: [
      { label: 'Depreciation Entry', path: '/tasks/depreciation' },
      { label: 'Asset Reclassify', path: '/tasks/reclassify' },
      { label: 'Asset Sale/Disposal', path: '/tasks/disposal' },
      { label: 'Asset Transfer', path: '/tasks/transfer' },
      { label: 'Branch Transfer', path: '/tasks/branch-transfer' },
      { label: 'Expiry Document Entry', path: '/tasks/expiry-doc-entry' },
      { label: 'Company License Documents', path: '/tasks/company-license' }
    ],
    reports: [
      { label: 'Fixed Asset List', path: '/reports/asset-list' },
      { label: 'Asset Summary', path: '/reports/asset-summary' },
      { label: 'Management Report', path: '/reports/management-report' },
      { label: 'Fixed Asset XL', path: '/reports/asset-xl' },
      { label: 'Asset Transfer XL', path: '/reports/transfer-xl' },
      { label: 'Company License List', path: '/reports/license-list' },
      { label: 'Asset Barcode', path: '/reports/barcode' },
      { label: 'Expiry Document List', path: '/reports/expiry-doc-list' }
    ]
  };

  const renderGroup = (key, label) => (
    <div className="sidebar-group" key={key}>
      <div className="sidebar-group-title" onClick={() => toggleGroup(key)}>
        <span>{label}</span>
        <span>{expandedGroups[key] ? '−' : '+'}</span>
      </div>
      {expandedGroups[key] && (
        <div className="sidebar-items">
          {menu[key].map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <aside className="sidebar">
      <Link 
        to="/" 
        className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}
        style={{ fontWeight: 'bold', padding: '10px' }}
      >
        Dashboard
      </Link>
      {renderGroup('masters', 'Masters')}
      {renderGroup('tasks', 'Tasks')}
      {renderGroup('reports', 'Reports')}
    </aside>
  );
};

export default Sidebar;
