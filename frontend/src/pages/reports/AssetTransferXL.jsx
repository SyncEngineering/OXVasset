import React, { useState } from 'react';
import * as api from '../../api/reports/assetTransferXLApi';
import FormField from '../../components/common/FormField.jsx';
import '../../styles/form.css';

const AssetTransferXL = () => {
  const [filters, setFilters] = useState({ from_date: '', to_date: '', status: '' });
  const [exporting, setExporting] = useState(false);

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
        <div className="header-title">KSRTC — Inter-Depot Transfer Export (XL)</div>
      </div>

      <div className="form-container">
        <div className="form-section-title">Select Filters</div>
        <div className="form-row">
          <FormField label="Date From" name="from_date" type="date" value={filters.from_date} onChange={handleInputChange} />
          <FormField label="Date To" name="to_date" type="date" value={filters.to_date} onChange={handleInputChange} />
          <FormField label="Status" name="status" type="select" options={[
            { id: 'draft', label: 'Draft' }, { id: 'approved', label: 'Approved' }, { id: 'completed', label: 'Completed' }, { id: 'rejected', label: 'Rejected' }
          ]} value={filters.status} onChange={handleInputChange} />
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <button className="primary" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Generating Excel...' : 'Export to Excel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetTransferXL;
