import React, { useState, useEffect } from 'react';
import * as api from '../../api/tasks/branchTransferApi';
import { getDummyData } from '../../utils/dummyDataGenerator';
import FormField from '../../components/common/FormField.jsx';
import Table from '../../components/common/Table.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import '../../styles/form.css';
import '../../styles/table.css';

const BranchTransfer = () => {
  const [records, setRecords] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  
  const [formData, setFormData] = useState({
    asset_id: '', transfer_date: new Date().toISOString().split('T')[0], reason: '',
    from_branch: '', to_branch: '',
    from_location_id: '', to_location_id: ''
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRec, resAssets, resLocs] = await Promise.all([
        api.getAll(), api.getAssetOptions(), api.getLocationOptions()
      ]);
      if (resRec.success) setRecords(resRec.data);
      if (resAssets.success) setAssetOptions(resAssets.data);
      if (resLocs.success) setLocationOptions(resLocs.data);
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
  };

  const handleFillDummy = () => {
    const dummy = getDummyData('BranchTransfer');
    setFormData(prev => ({ ...prev, ...dummy }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) await api.update(editId, formData);
      else await api.create(formData);
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.message || 'Save failed');
    }
  };

  const handleApproveAction = async (id, action) => {
    const msg = action === 'completed' ? 'Complete branch transfer? This will update asset location.' : `${action} this entry?`;
    if (!window.confirm(msg)) return;
    try {
      await api.approve(id, action);
      fetchData();
    } catch (err) {
      setError(err.message || 'Action failed');
    }
  };

  const handleEdit = (row) => {
    if (row.status !== 'draft') return alert('Only draft entries can be edited');
    const clean = { ...row };
    if (clean.transfer_date) clean.transfer_date = clean.transfer_date.split('T')[0];
    setFormData(clean);
    setEditId(row.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      asset_id: '', transfer_date: new Date().toISOString().split('T')[0], reason: '',
      from_branch: '', to_branch: '',
      from_location_id: '', to_location_id: ''
    });
    setEditId(null);
  };

  const filteredRecords = records.filter(r => {
    return statusFilter ? r.status === statusFilter : true;
  });

  const columns = [
    { key: 'branch_transfer_no', label: 'No', width: '100px' },
    { key: 'asset_code', label: 'Asset', width: '100px' },
    { key: 'date_display', label: 'Date', width: '100px' },
    { key: 'from_branch', label: 'From Branch', width: '150px' },
    { key: 'to_branch', label: 'To Branch', width: '150px' },
    { key: 'status_display', label: 'Status', width: '100px' }
  ];

  const tableData = filteredRecords.map(r => ({
    ...r,
    date_display: new Date(r.transfer_date).toLocaleDateString(),
    status_display: <StatusBadge status={r.status} />
  }));

  const renderActions = (row) => (
    <div className="action-links">
      {row.status === 'draft' && <span className="action-link" onClick={() => handleEdit(row)}>Edit</span>}
      {row.status === 'draft' && <span className="action-link" onClick={() => handleApproveAction(row.id, 'approved')} style={{ color: 'green' }}>Approve</span>}
      {row.status === 'approved' && <span className="action-link" onClick={() => handleApproveAction(row.id, 'completed')} style={{ color: 'blue' }}>Complete</span>}
      {row.status !== 'completed' && row.status !== 'rejected' && <span className="action-link" onClick={() => handleApproveAction(row.id, 'rejected')} style={{ color: 'red' }}>Reject</span>}
    </div>
  );

  return (
    <div>
      <div className="header" style={{ marginBottom: '10px' }}>
        <div className="header-title">Asset Branch Transfer</div>
      </div>

      <div className="form-container" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">-- All Status --</option>
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
        <button className="primary" style={{ marginLeft: 'auto' }} onClick={() => { setShowForm(true); resetForm(); }}>New Branch Transfer</button>
      </div>

      {showForm && (
        <div className="form-container">
          <div className="form-section-title">Transfer Details</div>
          <form onSubmit={handleSave}>
            <div className="form-row">
              <FormField label="Asset" name="asset_id" type="select" options={assetOptions.map(a => ({ id: a.id, label: a.asset_code }))} value={formData.asset_id} onChange={handleInputChange} required disabled={!!editId} />
              <FormField label="Date" name="transfer_date" type="date" value={formData.transfer_date} onChange={handleInputChange} required />
              <FormField label="From Branch" name="from_branch" value={formData.from_branch} onChange={handleInputChange} required />
              <FormField label="To Branch" name="to_branch" value={formData.to_branch} onChange={handleInputChange} required />
            </div>

            <div className="form-row">
              <FormField label="From Location" name="from_location_id" type="select" options={locationOptions} value={formData.from_location_id} onChange={handleInputChange} />
              <FormField label="To Location" name="to_location_id" type="select" options={locationOptions} value={formData.to_location_id} onChange={handleInputChange} />
            </div>

            <div className="form-row">
              <FormField label="Reason" name="reason" type="textarea" value={formData.reason} onChange={handleInputChange} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button type="submit" className="primary">Save</button>
              <button type="button" className="secondary" onClick={handleFillDummy}>Fill Dummy</button>
              <button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="form-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => <th key={col.key} style={{ width: col.width }}>{col.label}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 && tableData.map((row, idx) => (
              <tr key={idx}>
                {columns.map(col => <td key={col.key} style={{ width: col.width }}>{row[col.key]}</td>)}
                <td>{renderActions(row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BranchTransfer;
