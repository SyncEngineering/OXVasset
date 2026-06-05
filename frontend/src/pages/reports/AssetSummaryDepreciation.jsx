import React, { useState, useEffect } from 'react';
import * as api from '../../api/reports/assetSummaryApi';
import axiosInstance from '../../api/axiosInstance.js';
import FormField from '../../components/common/FormField.jsx';
import Table from '../../components/common/Table.jsx';
import '../../styles/form.css';
import '../../styles/table.css';

const AssetSummaryDepreciation = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    asset_id: '', from_date: '', to_date: '', status: 'all'
  });
  const [assetOptions, setAssetOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAssets = async () => {
    try {
      const res = await axiosInstance.get('/assets');
      setAssetOptions(res.data.data);
    } catch (err) {
      console.error('Failed to fetch assets');
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
    fetchAssets();
    fetchReport();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const columns = [
    { key: 'asset_code', label: 'Code', width: '100px' },
    { key: 'asset_name', label: 'Asset Name', width: '180px' },
    { key: 'purchase_cost', label: 'Cost', width: '100px' },
    { key: 'current_book_value', label: 'Book Value', width: '100px' },
    { key: 'total_entries', label: 'Entries', width: '80px' },
    { key: 'total_posted_depreciation', label: 'Total Posted', width: '100px' },
    { key: 'total_reversed', label: 'Reversed', width: '100px' },
    { key: 'earliest_period_display', label: 'Earliest', width: '100px' },
    { key: 'latest_period_display', label: 'Latest', width: '100px' }
  ];

  const tableData = data.map(r => ({
    ...r,
    earliest_period_display: r.earliest_period ? new Date(r.earliest_period).toLocaleDateString() : '-',
    latest_period_display: r.latest_period ? new Date(r.latest_period).toLocaleDateString() : '-'
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
        <div className="header-title">Asset Depreciation Summary</div>
      </div>

      <div className="form-container filter-bar">
        <div className="form-row">
          <FormField label="Asset" name="asset_id" type="select" options={assetOptions.map(a => ({ id: a.asset_id, label: a.asset_code }))} value={filters.asset_id} onChange={handleInputChange} />
          <FormField label="Date From" name="from_date" type="date" value={filters.from_date} onChange={handleInputChange} />
          <FormField label="Date To" name="to_date" type="date" value={filters.to_date} onChange={handleInputChange} />
          <FormField label="Status" name="status" type="select" options={[
            { id: 'all', label: 'All' }, { id: 'posted', label: 'Posted' }, { id: 'draft', label: 'Draft' }, { id: 'reversed', label: 'Reversed' }
          ]} value={filters.status} onChange={handleInputChange} />
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button className="primary" onClick={fetchReport}>Search</button>
            <button className="secondary" onClick={() => setFilters({ asset_id: '', from_date: '', to_date: '', status: 'all' })}>Clear</button>
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

export default AssetSummaryDepreciation;
