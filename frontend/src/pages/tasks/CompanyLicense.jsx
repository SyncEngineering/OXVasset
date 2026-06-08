import React, { useState, useEffect } from 'react';
import * as api from '../../api/tasks/companyLicenseApi';
import { getDummyData } from '../../utils/dummyDataGenerator';
import FormField from '../../components/common/FormField.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import '../../styles/form.css';
import '../../styles/table.css';

const CompanyLicense = () => {
  const [records, setRecords] = useState([]);
  const [docOptions, setDocOptions] = useState([]);
  
  const [formData, setFormData] = useState({
    expiry_doc_type_code: '', document_name: '', document_no: '',
    issue_date: '', expiry_date: '', issuing_authority: '',
    alert_before_days: 30, remarks: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRec, resDocs] = await Promise.all([api.getAll(), api.getDocTypeOptions()]);
      if (resRec.success) setRecords(resRec.data);
      if (resDocs.success) setDocOptions(resDocs.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFillDummy = () => {
    const dummy = getDummyData('CompanyLicense');
    setFormData(prev => ({ ...prev, ...dummy }));
    setFieldErrors({});
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (selectedFile) data.append('document', selectedFile);

    try {
      if (editId) await api.update(editId, data);
      else await api.create(data);
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data.errors) {
        const errors = {};
        err.response.data.errors.forEach(e => {
          errors[e.path] = e.msg;
        });
        setFieldErrors(errors);
      } else {
        setError(err.response?.data?.message || 'Failed to save entry');
      }
    }
  };

  const handleEdit = (row) => {
    const clean = { ...row };
    if (clean.issue_date) clean.issue_date = clean.issue_date.split('T')[0];
    if (clean.expiry_date) clean.expiry_date = clean.expiry_date.split('T')[0];
    
    setFormData({
        expiry_doc_type_code: clean.expiry_doc_type_code,
        document_name: clean.document_name,
        document_no: clean.document_no || '',
        issue_date: clean.issue_date || '',
        expiry_date: clean.expiry_date || '',
        issuing_authority: clean.issuing_authority || '',
        alert_before_days: clean.alert_before_days,
        remarks: clean.remarks || ''
    });
    setEditId(row.id);
    setFieldErrors({});
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      expiry_doc_type_code: '', document_name: '', document_no: '',
      issue_date: '', expiry_date: '', issuing_authority: '',
      alert_before_days: 30, remarks: ''
    });
    setSelectedFile(null);
    setEditId(null);
    setFieldErrors({});
  };

  const getExpiryAlert = (expiryDate, alertDays) => {
    if (!expiryDate) return <span style={{ color: '#999' }}>N/A</span>;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return <span style={{ color: 'red', fontWeight: 'bold' }}>EXPIRED</span>;
    if (diffDays <= alertDays) return <span style={{ color: 'orange', fontWeight: 'bold' }}>Due in {diffDays} days</span>;
    return <span style={{ color: 'green' }}>OK</span>;
  };

  const columns = [
    { key: 'entry_no', label: 'Entry No', width: '100px' },
    { key: 'doc_type_name', label: 'Doc Type', width: '120px' },
    { key: 'document_name', label: 'Doc Name', width: '150px' },
    { key: 'document_no', label: 'Doc No', width: '120px' },
    { key: 'expiry_date_display', label: 'Expiry Date', width: '100px' },
    { key: 'expiry_alert', label: 'Alert', width: '120px' },
    { key: 'status_display', label: 'Active', width: '80px' }
  ];

  const tableData = records.map(r => ({
    ...r,
    expiry_date_display: r.expiry_date ? new Date(r.expiry_date).toLocaleDateString() : 'N/A',
    expiry_alert: getExpiryAlert(r.expiry_date, r.alert_before_days),
    status_display: <StatusBadge status={r.is_active ? 'active' : 'inactive'} />
  }));

  return (
    <div>
      <div className="header" style={{ marginBottom: '10px' }}>
        <div className="header-title">KSRTC — Corporation License Documents</div>
      </div>

      <div className="form-container" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button className="primary" onClick={() => { setShowForm(true); resetForm(); }}>Add License</button>
      </div>

      {showForm && (
        <div className="form-container">
          <div className="form-section-title">{editId ? 'Edit License' : 'New License Entry'}</div>
          <form onSubmit={handleSave}>
            <div className="form-row">
              <FormField label="Doc Type" name="expiry_doc_type_code" type="select" options={docOptions.map(d => ({ id: d.expiry_doc_type_code, label: d.doc_type_name }))} value={formData.expiry_doc_type_code} onChange={handleInputChange} required error={fieldErrors.expiry_doc_type_code} />
              <FormField label="Document Name" name="document_name" value={formData.document_name} onChange={handleInputChange} required error={fieldErrors.document_name} />
              <FormField label="Document No" name="document_no" value={formData.document_no} onChange={handleInputChange} error={fieldErrors.document_no} />
            </div>
            <div className="form-row">
              <FormField label="Issue Date" name="issue_date" type="date" value={formData.issue_date} onChange={handleInputChange} error={fieldErrors.issue_date} />
              <FormField label="Expiry Date" name="expiry_date" type="date" value={formData.expiry_date} onChange={handleInputChange} error={fieldErrors.expiry_date} />
              <FormField label="Alert Before (Days)" name="alert_before_days" type="number" value={formData.alert_before_days} onChange={handleInputChange} error={fieldErrors.alert_before_days} />
            </div>
            <div className="form-row">
              <FormField label="Issuing Authority" name="issuing_authority" value={formData.issuing_authority} onChange={handleInputChange} error={fieldErrors.issuing_authority} />
              <div className="form-group">
                <label>Document File</label>
                <input type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                {editId && records.find(r => r.id === editId)?.file_path && (
                  <span style={{ fontSize: '11px' }}>Current: {records.find(r => r.id === editId).file_path.split('/').pop()}</span>
                )}
              </div>
            </div>
            <div className="form-row">
              <FormField label="Remarks" name="remarks" type="textarea" value={formData.remarks} onChange={handleInputChange} error={fieldErrors.remarks} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button type="submit" className="primary">Save</button>
              <button type="button" className="secondary" onClick={handleFillDummy}>Fill Dummy</button>
              <button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}

      <div className="form-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => <th key={col.key} style={{ width: col.width }}>{col.label}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? tableData.map((row, idx) => (
              <tr key={idx}>
                {columns.map(col => <td key={col.key}>{row[col.key]}</td>)}
                <td>
                  <div className="action-links">
                    <span className="action-link" onClick={() => handleEdit(row)}>Edit</span>
                    <span className="action-link" onClick={() => api.toggleActive(row.id).then(fetchData)}>Toggle</span>
                  </div>
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

export default CompanyLicense;
