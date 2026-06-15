import React, { useState, useEffect } from 'react';
import * as api from '../../api/reports/fixedAssetSummaryXLApi';
import FormField from '../../components/common/FormField.jsx';
import '../../styles/form.css';
import axiosInstance from '../../api/axiosInstance.js';

const FixedAssetSummaryXL = () => {
  const [filters, setFilters] = useState({ division_code: '', category_code: '', asset_status: '' });
  const [options, setOptions] = useState({ divisions: [], categories: [] });
  const [exporting, setExporting] = useState(false);

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

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await api.exportXL(filters);
    } catch (err) {
      alert('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="header" style={{ marginBottom: '10px' }}>
        <div className="header-title">KSRTC Asset Register Export (XL)</div>
      </div>

      <div className="form-container">
        <div className="form-section-title">Select Filters</div>
        <div className="form-row">
          <FormField label="Division" name="division_code" type="select" options={options.divisions.map(d => ({ id: d.division_code, label: d.division_name }))} value={filters.division_code} onChange={handleInputChange} />
          <FormField label="Category" name="category_code" type="select" options={options.categories.map(c => ({ id: c.category_code, label: c.category_name }))} value={filters.category_code} onChange={handleInputChange} />
          <FormField label="Status" name="asset_status" type="select" options={[
            { id: 'active', label: 'Active' }, { id: 'disposed', label: 'Disposed' }, { id: 'transferred', label: 'Transferred' }, { id: 'wip', label: 'WIP' }, { id: 'scrapped', label: 'Scrapped' }
          ]} value={filters.asset_status} onChange={handleInputChange} />
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <button className="primary" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Generating Excel...' : 'Export to Excel'}
          </button>
          <p style={{ fontSize: '11px', color: '#666', marginTop: '10px' }}>
            All active assets matching the filters will be exported.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FixedAssetSummaryXL;
