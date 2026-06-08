import React, { useState, useEffect } from 'react';
import * as api from '../../api/tasks/assetChangeWipApi';
import { getDummyData } from '../../utils/dummyDataGenerator';
import FormField from '../../components/common/FormField.jsx';
import Table from '../../components/common/Table.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import '../../styles/form.css';
import '../../styles/table.css';

const AssetChangeWip = () => {
  const [records, setRecords] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [formData, setFormData] = useState({
    asset_id: '', change_date: new Date().toISOString().split('T')[0], change_type: '', 
    old_value: '', new_value: '', cost_incurred: 0, remarks: ''
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRecords, resAssets] = await Promise.all([
        api.getAll(),
        api.getAssetOptions()
      ]);
      if (resRecords.success) setRecords(resRecords.data);
      if (resAssets.success) setAssetOptions(resAssets.data);
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
    const dummy = getDummyData('AssetChangeWip');
    setFormData(prev => ({ ...prev, ...dummy }));
    setFieldErrors({});
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    try {
      if (editId) {
        await api.update(editId, formData);
      } else {
        await api.create(formData);
      }
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

  const handleEdit = (record) => {
    if (record.status !== 'pending') {
      alert('Only pending entries can be edited');
      return;
    }
    const cleanRecord = { ...record };
    if (cleanRecord.change_date) cleanRecord.change_date = cleanRecord.change_date.split('T')[0];
    
    setFormData(cleanRecord);
    setEditId(record.id);
    setFieldErrors({});
    setShowForm(true);
  };

  const handleApprove = async (id, action) => {
    if (!window.confirm(`${action === 'approved' ? 'Approve' : 'Reject'} this entry?`)) return;
    try {
      await api.approve(id, action);
      fetchData();
    } catch (err) {
      setError(err.message || 'Action failed');
    }
  };

  const resetForm = () => {
    setFormData({
      asset_id: '', change_date: new Date().toISOString().split('T')[0], change_type: '', 
      old_value: '', new_value: '', cost_incurred: 0, remarks: ''
    });
    setEditId(null);
    setFieldErrors({});
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.asset_code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         r.asset_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? r.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: 'asset_code', label: 'Asset Code', width: '100px' },
    { key: 'asset_name', label: 'Asset Name', width: '150px' },
    { key: 'change_date_display', label: 'Date', width: '100px' },
    { key: 'change_type', label: 'Type', width: '120px' },
    { key: 'old_value', label: 'Old Value', width: '100px' },
    { key: 'new_value', label: 'New Value', width: '100px' },
    { key: 'cost_incurred', label: 'Cost', width: '100px' },
    { key: 'status_display', label: 'Status', width: '100px' }
  ];

  const tableData = filteredRecords.map(r => ({
    ...r,
    change_date_display: new Date(r.change_date).toLocaleDateString(),
    status_display: <StatusBadge status={r.status} />
  }));

  const actions = (row) => [
    row.status === 'pending' && { label: 'Edit', onClick: handleEdit },
    row.status === 'pending' && { label: 'Approve', onClick: (r) => handleApprove(r.id, 'approved'), className: 'action-link' },
    row.status === 'pending' && { label: 'Reject', onClick: (r) => handleApprove(r.id, 'rejected'), className: 'action-link' }
  ].filter(Boolean);

  // Custom table render to handle row-specific actions
  const renderActions = (row) => {
    if (row.status !== 'pending') return null;
    return (
      <div className="action-links">
        <span className="action-link" onClick={() => handleEdit(row)}>Edit</span>
        <span className="action-link" onClick={() => handleApprove(row.id, 'approved')} style={{ color: 'green' }}>Approve</span>
        <span className="action-link" onClick={() => handleApprove(row.id, 'rejected')} style={{ color: 'red' }}>Reject</span>
      </div>
    );
  };

  return (
    <div>
      <div className="header" style={{ marginBottom: '10px' }}>
        <div className="header-title">KSRTC — Asset Change WIP</div>
      </div>

      <div className="form-container" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search asset..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">-- All Status --</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button className="secondary" onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>Clear</button>
        <button className="primary" style={{ marginLeft: 'auto' }} onClick={() => { setShowForm(true); resetForm(); }}>Add New WIP Entry</button>
      </div>

      {showForm && (
        <div className="form-container">
          <div className="form-section-title">{editId ? `Edit WIP Entry` : 'New Asset Change WIP Entry'}</div>
          <form onSubmit={handleSave}>
            <div className="form-row">
              <FormField label="Asset" name="asset_id" type="select" 
                options={assetOptions.map(a => ({ id: a.id, label: `${a.asset_code} — ${a.asset_name}` }))} 
                value={formData.asset_id} onChange={handleInputChange} required error={fieldErrors.asset_id} />
              <FormField label="Change Date" name="change_date" type="date" value={formData.change_date} onChange={handleInputChange} required error={fieldErrors.change_date} />
              <FormField label="Change Type" name="change_type" value={formData.change_type} onChange={handleInputChange} required placeholder="Upgrade, Repair, etc." error={fieldErrors.change_type} />
            </div>
            <div className="form-row">
              <FormField label="Old Value" name="old_value" value={formData.old_value} onChange={handleInputChange} error={fieldErrors.old_value} />
              <FormField label="New Value" name="new_value" value={formData.new_value} onChange={handleInputChange} error={fieldErrors.new_value} />
              <FormField label="Cost Incurred" name="cost_incurred" type="number" value={formData.cost_incurred} onChange={handleInputChange} error={fieldErrors.cost_incurred} />
            </div>
            <div className="form-row">
              <FormField label="Remarks" name="remarks" type="textarea" value={formData.remarks} onChange={handleInputChange} error={fieldErrors.remarks} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="primary">Save Entry</button>
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
              <th style={{ width: '150px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? tableData.map((row, idx) => (
              <tr key={idx}>
                {columns.map(col => <td key={col.key}>{row[col.key]}</td>)}
                <td>{renderActions(row)}</td>
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

export default AssetChangeWip;
