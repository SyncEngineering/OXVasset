import React, { useState, useEffect } from 'react';
import * as api from '../../api/reports/assetManagementApi';
import axiosInstance from '../../api/axiosInstance.js';
import FormField from '../../components/common/FormField.jsx';
import Table from '../../components/common/Table.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import '../../styles/form.css';
import '../../styles/table.css';

const AssetManagement = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ division_code: '', category_code: '', asset_status: '' });
  const [options, setOptions] = useState({ divisions: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOptions = async () => {
    try {
      const [resDiv, resCat] = await Promise.all([
        axiosInstance.get('/asset-divisions'),
        axiosInstance.get('/asset-categories')
      ]);
      setOptions({
        divisions: resDiv.data.data,
        categories: resCat.data.data
      });
    } catch (err) {
      console.error('Failed to fetch options');
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.getReport(filters);
      if (res.success) setData(res.data);
    } catch (err) {
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
    fetchReport();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const columns = [
    { key: 'asset_code', label: 'Code', width: '100px' },
    { key: 'asset_name', label: 'Asset Name', width: '180px' },
    { key: 'division_name', label: 'Division', width: '120px' },
    { key: 'category_name', label: 'Category', width: '120px' },
    { key: 'status_display', label: 'Status', width: '100px' },
    { key: 'purchase_cost', label: 'Cost', width: '100px' },
    { key: 'current_book_value', label: 'Book Value', width: '100px' },
    { key: 'transfer_count', label: 'Trfs', width: '60px' },
    { key: 'branch_transfer_count', label: 'B-Trfs', width: '60px' },
    { key: 'wip_count', label: 'WIPs', width: '60px' },
    { key: 'active_docs', label: 'Active Docs', width: '80px' },
    { key: 'expired_docs_display', label: 'Expired', width: '80px' }
  ];

  const tableData = data.map(r => ({
    ...r,
    status_display: <StatusBadge status={r.asset_status} />,
    expired_docs_display: <span style={{ color: r.expired_docs > 0 ? 'red' : 'inherit', fontWeight: r.expired_docs > 0 ? 'bold' : 'normal' }}>{r.expired_docs}</span>
  }));

  return (
    <div>
      <style>
        {`
          @media print {
            .filter-bar, .print-btn, .sidebar, .header { display: none !important; }
            .main-content { margin: 0 !important; padding: 0 !important; }
          }
        `}
      </style>
      
      <div className="header" style={{ marginBottom: '10px' }}>
        <div className="header-title">KSRTC Asset Management Report</div>
      </div>

      <div className="form-container filter-bar">
        <div className="form-row">
          <FormField label="Division" name="division_code" type="select" options={options.divisions.map(d => ({ id: d.division_code, label: d.division_name }))} value={filters.division_code} onChange={handleInputChange} />
          <FormField label="Category" name="category_code" type="select" options={options.categories.map(c => ({ id: c.category_code, label: c.category_name }))} value={filters.category_code} onChange={handleInputChange} />
          <FormField label="Status" name="asset_status" type="select" options={[
            { id: 'active', label: 'Active' }, { id: 'disposed', label: 'Disposed' }, { id: 'transferred', label: 'Transferred' }, { id: 'wip', label: 'WIP' }, { id: 'scrapped', label: 'Scrapped' }
          ]} value={filters.asset_status} onChange={handleInputChange} />
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button className="primary" onClick={fetchReport}>Search</button>
            <button className="secondary" onClick={() => setFilters({ division_code: '', category_code: '', asset_status: '' })}>Clear</button>
            <button className="secondary print-btn" onClick={() => window.print()}>Print</button>
          </div>
        </div>
      </div>

      {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}

      <div className="form-container">
        <Table columns={columns} data={tableData} />
      </div>
    </div>
  );
};

export default AssetManagement;
