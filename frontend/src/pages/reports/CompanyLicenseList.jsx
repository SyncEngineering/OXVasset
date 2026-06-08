import React, { useState, useEffect } from 'react';
import * as api from '../../api/reports/companyLicenseListApi';
import FormField from '../../components/common/FormField.jsx';
import Table from '../../components/common/Table.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import '../../styles/form.css';
import '../../styles/table.css';
import axiosInstance from '../../api/axiosInstance.js';

const CompanyLicenseList = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ expiry_doc_type_code: '', is_active: '', expiry_status: 'all' });
  const [docOptions, setDocOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const fetchOptions = async () => {
    try {
      const res = await axiosInstance.get('/expiry-doc-types');
      setDocOptions(res.data.data);
    } catch (err) {
      console.error('Failed to fetch doc types');
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

  const columns = [
    { key: 'entry_no', label: 'No', width: '100px' },
    { key: 'doc_type_name', label: 'Type', width: '120px' },
    { key: 'document_name', label: 'Name', width: '180px' },
    { key: 'document_no', label: 'Doc No', width: '120px' },
    { key: 'expiry_date_display', label: 'Expiry Date', width: '100px' },
    { key: 'days_display', label: 'Days Left', width: '100px' },
    { key: 'status_display', label: 'Active', width: '80px' }
  ];

  const tableData = data.map(r => {
    const days = r.days_to_expiry;
    let color = 'green';
    if (days < 0) color = 'red';
    else if (days <= 30) color = 'orange';

    return {
      ...r,
      expiry_date_display: r.expiry_date ? new Date(r.expiry_date).toLocaleDateString() : 'N/A',
      days_display: <span style={{ color, fontWeight: 'bold' }}>{days !== null ? days : '-'}</span>,
      status_display: <StatusBadge status={r.is_active ? 'active' : 'inactive'} />
    };
  });

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
        <div className="header-title">KSRTC — Corporation License List</div>
      </div>

      <div className="form-container filter-bar">
        <div className="form-row">
          <FormField label="Doc Type" name="expiry_doc_type_code" type="select" options={docOptions.map(d => ({ id: d.expiry_doc_type_code, label: d.doc_type_name }))} value={filters.expiry_doc_type_code} onChange={handleInputChange} />
          <FormField label="Status" name="is_active" type="select" options={[{ id: '1', label: 'Active' }, { id: '0', label: 'Inactive' }]} value={filters.is_active} onChange={handleInputChange} />
          <FormField label="Expiry Filter" name="expiry_status" type="select" options={[
            { id: 'all', label: 'All' }, { id: 'expired', label: 'Expired' }, { id: 'upcoming', label: 'Upcoming' }
          ]} value={filters.expiry_status} onChange={handleInputChange} />
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button className="primary" onClick={fetchReport}>Search</button>
            <button className="secondary" onClick={() => setFilters({ expiry_doc_type_code: '', is_active: '', expiry_status: 'all' })}>Clear</button>
            <button className="secondary print-btn" onClick={() => window.print()}>Print</button>
            <button className="secondary" onClick={handleExport} disabled={exporting}>
              {exporting ? '...' : 'Export XL'}
            </button>
          </div>
        </div>
      </div>

      {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}

      <div className="form-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => <th key={col.key} style={{ width: col.width }}>{col.label}</th>)}
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? tableData.map((row, idx) => (
              <tr key={idx}>
                {columns.map(col => <td key={col.key}>{row[col.key]}</td>)}
                <td>
                  {row.file_path && (
                    <a href={`http://localhost:5000/${row.file_path}`} target="_blank" rel="noreferrer" className="action-link">View File</a>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '10px' }}>No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyLicenseList;
