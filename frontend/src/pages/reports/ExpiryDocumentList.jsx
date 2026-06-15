import React, { useState, useEffect } from 'react';
import * as api from '../../api/reports/expiryDocumentListApi';
import * as assetApi from '../../api/masters/assetMasterApi';
import * as docTypeApi from '../../api/masters/expiryDocTypeApi';
import FormField from '../../components/common/FormField.jsx';
import Table from '../../components/common/Table.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import '../../styles/form.css';
import '../../styles/table.css';

const ExpiryDocumentList = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  
  const [assetOptions, setAssetOptions] = useState([]);
  const [docTypeOptions, setDocTypeOptions] = useState([]);
  
  const [filters, setFilters] = useState({
    asset_id: '',
    expiry_doc_type_code: '',
    expiry_status: 'all',
    from_date: '',
    to_date: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOptions = async () => {
    try {
      const [resAssets, resDocs] = await Promise.all([
        assetApi.getAll(),
        docTypeApi.getAll()
      ]);
      if (resAssets.success) setAssetOptions(resAssets.data);
      if (resDocs.success) setDocTypeOptions(resDocs.data);
    } catch (err) {
      console.error('Failed to fetch options', err);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getReport(filters);
      if (res.success) {
        setRecords(res.data);
        setSummary(res.summary);
      }
    } catch (err) {
      setError('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFilters({ asset_id: '', expiry_doc_type_code: '', expiry_status: 'all', from_date: '', to_date: '' });
    setRecords([]);
    setSummary(null);
  };

  const getStatusColor = (days, alertDays) => {
    if (days < 0) return 'red';
    if (days <= alertDays) return 'orange';
    return 'green';
  };

  const columns = [
    { key: 'entry_no', label: 'Entry No', width: '100px' },
    { key: 'asset_code', label: 'Asset Code', width: '100px' },
    { key: 'asset_name', label: 'Asset Name', width: '150px' },
    { key: 'division_name', label: 'Division', width: '120px' },
    { key: 'doc_type_name', label: 'Doc Type', width: '120px' },
    { key: 'document_no', label: 'Doc No', width: '120px' },
    { key: 'issue_date_display', label: 'Issue Date', width: '100px' },
    { key: 'expiry_date_display', label: 'Expiry Date', width: '100px' },
    { key: 'alert_before_days', label: 'Alert Days', width: '80px' },
    { key: 'days_to_expiry_display', label: 'Days to Expiry', width: '130px' },
    { key: 'issuing_authority', label: 'Authority', width: '120px' },
    { key: 'status_display', label: 'Status', width: '80px' }
  ];

  const tableData = records.map(r => ({
    ...r,
    issue_date_display: r.issue_date ? new Date(r.issue_date).toLocaleDateString() : 'N/A',
    expiry_date_display: new Date(r.expiry_date).toLocaleDateString(),
    days_to_expiry_display: (
      <span style={{ color: getStatusColor(r.days_to_expiry, r.alert_before_days), fontWeight: 'bold' }}>
        {r.days_to_expiry < 0 ? `EXPIRED (${Math.abs(r.days_to_expiry)} days)` : `${r.days_to_expiry} days`}
      </span>
    ),
    status_display: <StatusBadge status={r.is_active ? 'active' : 'inactive'} />
  }));

  return (
    <div className="report-container">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .report-header { display: block !important; margin-bottom: 20px; }
          .summary-bar { margin-bottom: 20px !important; }
        }
        .summary-bar { display: flex; gap: 15px; margin-bottom: 15px; }
        .summary-box { 
          flex: 1; 
          padding: 10px; 
          border: 1px solid #ccc; 
          background: #f9f9f9; 
          text-align: center; 
          border-radius: 4px;
        }
        .summary-label { font-size: 11px; color: #666; margin-bottom: 5px; }
        .summary-value { font-size: 20px; font-weight: bold; }
        .expired-box { background-color: #ffebee; border-color: #ef9a9a; color: #c62828; }
        .upcoming-box { background-color: #fff3e0; border-color: #ffcc80; color: #ef6c00; }
        .valid-box { background-color: #e8f5e9; border-color: #a5d6a7; color: #2e7d32; }
      `}</style>

      <div className="header no-print" style={{ marginBottom: '10px' }}>
        <div className="header-title">KSRTC Bus Document Expiry List</div>
      </div>

      <div className="report-header" style={{ display: 'none', textAlign: 'center' }}>
        <h2>OXVasset — Expiry Document List</h2>
        <p>Report Date: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="form-container no-print" style={{ marginBottom: '20px' }}>
        <div className="form-row">
          <FormField 
            label="Asset" 
            type="select" 
            options={assetOptions.map(a => ({ id: a.asset_id, label: `${a.asset_code} — ${a.asset_name}` }))}
            value={filters.asset_id}
            onChange={(e) => setFilters({...filters, asset_id: e.target.value})}
          />
          <FormField 
            label="Doc Type" 
            type="select" 
            options={docTypeOptions.map(dt => ({ id: dt.expiry_doc_type_code, label: dt.doc_type_name }))}
            value={filters.expiry_doc_type_code}
            onChange={(e) => setFilters({...filters, expiry_doc_type_code: e.target.value})}
          />
          <FormField 
            label="Expiry Status" 
            type="select" 
            options={[
              { id: 'all', label: 'All Status' },
              { id: 'expired', label: 'Expired' },
              { id: 'upcoming', label: 'Upcoming (Alert Period)' },
              { id: 'valid', label: 'Valid (Outside Alert)' }
            ]}
            value={filters.expiry_status}
            onChange={(e) => setFilters({...filters, expiry_status: e.target.value})}
          />
        </div>
        <div className="form-row">
          <FormField 
            label="Expiry Date From" 
            type="date" 
            value={filters.from_date}
            onChange={(e) => setFilters({...filters, from_date: e.target.value})}
          />
          <FormField 
            label="Expiry Date To" 
            type="date" 
            value={filters.to_date}
            onChange={(e) => setFilters({...filters, to_date: e.target.value})}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button className="primary" onClick={handleSearch} disabled={loading}>Search Report</button>
          <button className="secondary" onClick={handleClear}>Clear</button>
          <button className="secondary" onClick={() => window.print()} disabled={records.length === 0}>Print Report</button>
        </div>
      </div>

      {summary && (
        <div className="summary-bar">
          <div className="summary-box">
            <div className="summary-label">Total Documents</div>
            <div className="summary-value">{summary.total}</div>
          </div>
          <div className={`summary-box ${summary.expired > 0 ? 'expired-box' : ''}`}>
            <div className="summary-label">Expired</div>
            <div className="summary-value">{summary.expired}</div>
          </div>
          <div className={`summary-box ${summary.upcoming > 0 ? 'upcoming-box' : ''}`}>
            <div className="summary-label">Upcoming (Alert)</div>
            <div className="summary-value">{summary.upcoming}</div>
          </div>
          <div className={`summary-box valid-box`}>
            <div className="summary-label">Valid</div>
            <div className="summary-value">{summary.valid}</div>
          </div>
        </div>
      )}

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <div className="form-container">
        <Table columns={columns} data={tableData} />
      </div>

      {records.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#888', fontStyle: 'italic' }}>
          Select filters and click "Search Report" to view results.
        </div>
      )}
    </div>
  );
};

export default ExpiryDocumentList;
