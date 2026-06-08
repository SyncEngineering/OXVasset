import React, { useState, useEffect } from 'react';
import * as api from '../../api/reports/fixedAssetListApi';
// import axiosInstance from '../../api/axiosInstance.js';
import FormField from '../../components/common/FormField.jsx';
import Table from '../../components/common/Table.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import '../../styles/form.css';
import '../../styles/table.css';
import axiosInstance from '../../api/axiosInstance.js';

const FixedAssetList = () => {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({
    division_code: '', category_code: '', asset_status: '', from_date: '', to_date: ''
  });
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
      if (res.success) {
        setData(res.data);
        setSummary(res.summary);
      }
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
    { key: 'asset_name', label: 'Asset Name', width: '200px' },
    { key: 'division_name', label: 'Division', width: '120px' },
    { key: 'category_name', label: 'Category', width: '120px' },
    { key: 'location_name', label: 'Location', width: '120px' },
    { key: 'purchase_date_display', label: 'Pur. Date', width: '100px' },
    { key: 'purchase_cost', label: 'Cost', width: '100px' },
    { key: 'accumulated_depreciation', label: 'Accum Depr', width: '100px' },
    { key: 'current_book_value', label: 'Book Value', width: '100px' },
    { key: 'status_display', label: 'Status', width: '100px' }
  ];

  const tableData = data.map(r => ({
    ...r,
    purchase_date_display: r.purchase_date ? new Date(r.purchase_date).toLocaleDateString() : 'N/A',
    status_display: <StatusBadge status={r.asset_status} />
  }));

  return (
    <div>
      <style>
        {`
          @media print {
            .filter-bar, .print-btn, .sidebar, .header { display: none !important; }
            .main-content { margin: 0 !important; padding: 0 !important; }
            .data-table { border: 1px solid #000 !important; }
          }
        `}
      </style>
      
      <div className="header" style={{ marginBottom: '10px' }}>
        <div className="header-title">KSRTC — Fixed Asset Register</div>
      </div>

      <div className="form-container filter-bar">
        <div className="form-row">
          <FormField label="Division" name="division_code" type="select" options={options.divisions.map(d => ({ id: d.division_code, label: d.division_name }))} value={filters.division_code} onChange={handleInputChange} />
          <FormField label="Category" name="category_code" type="select" options={options.categories.map(c => ({ id: c.category_code, label: c.category_name }))} value={filters.category_code} onChange={handleInputChange} />
          <FormField label="Status" name="asset_status" type="select" options={[
            { id: 'active', label: 'Active' }, { id: 'disposed', label: 'Disposed' }, { id: 'transferred', label: 'Transferred' }, { id: 'wip', label: 'WIP' }, { id: 'scrapped', label: 'Scrapped' }
          ]} value={filters.asset_status} onChange={handleInputChange} />
        </div>
        <div className="form-row">
          <FormField label="Purchase From" name="from_date" type="date" value={filters.from_date} onChange={handleInputChange} />
          <FormField label="Purchase To" name="to_date" type="date" value={filters.to_date} onChange={handleInputChange} />
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button className="primary" onClick={fetchReport}>Search</button>
            <button className="secondary" onClick={() => setFilters({ division_code: '', category_code: '', asset_status: '', from_date: '', to_date: '' })}>Clear</button>
            <button className="secondary print-btn" onClick={() => window.print()}>Print</button>
          </div>
        </div>
      </div>

      {summary && (
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          {[
            { label: 'Total Assets', value: summary.total_assets },
            { label: 'Total Purchase Cost', value: summary.total_purchase_cost.toFixed(2) },
            { label: 'Total Accum. Depr.', value: summary.total_accumulated_depreciation.toFixed(2) },
            { label: 'Total Book Value', value: summary.total_current_book_value.toFixed(2) }
          ].map((item, idx) => (
            <div key={idx} style={{ flex: 1, background: '#fff', border: '1px solid #ccc', padding: '10px' }}>
              <div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold' }}>{item.label}</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#003399' }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}

      {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}

      <div className="form-container">
        <Table columns={columns} data={tableData} />
      </div>
    </div>
  );
};

export default FixedAssetList;
