import React, { useState, useEffect } from 'react';
import * as api from '../../api/tasks/assetDisposalApi';
import FormField from '../../components/common/FormField.jsx';
import Table from '../../components/common/Table.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import '../../styles/form.css';
import '../../styles/table.css';

const AssetDisposal = () => {
  const [records, setRecords] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [formData, setFormData] = useState({
    asset_id: '', disposal_date: new Date().toISOString().split('T')[0], disposal_type: 'sale',
    book_value_at_disposal: 0, sale_amount: 0, buyer_name: '', buyer_contact: '', reason: ''
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRec, resAssets] = await Promise.all([api.getAll(), api.getAssetOptions()]);
      if (resRec.success) setRecords(resRec.data);
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

  const handleAssetSelect = (e) => {
    const assetId = e.target.value;
    const { name } = e.target;
    const asset = assetOptions.find(a => a.id === parseInt(assetId));
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (asset) {
      setFormData(prev => ({
        ...prev,
        asset_id: assetId,
        book_value_at_disposal: parseFloat(asset.current_book_value).toFixed(2)
      }));
    } else {
      setFormData(prev => ({ ...prev, asset_id: '', book_value_at_disposal: 0 }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    try {
      if (editId) await api.update(editId, formData);
      else await api.create(formData);
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

  const handleApproveAction = async (id, action) => {
    const msg = action === 'completed' ? 'Complete disposal? This will deactivate the asset.' : `${action} this entry?`;
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
    if (clean.disposal_date) clean.disposal_date = clean.disposal_date.split('T')[0];
    setFormData(clean);
    setEditId(row.id);
    setFieldErrors({});
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      asset_id: '', disposal_date: new Date().toISOString().split('T')[0], disposal_type: 'sale',
      book_value_at_disposal: 0, sale_amount: 0, buyer_name: '', buyer_contact: '', reason: ''
    });
    setEditId(null);
    setFieldErrors({});
  };

  const filteredRecords = records.filter(r => {
    return statusFilter ? r.status === statusFilter : true;
  });

  const columns = [
    { key: 'disposal_no', label: 'No', width: '100px' },
    { key: 'asset_code', label: 'Asset', width: '100px' },
    { key: 'disposal_date_display', label: 'Date', width: '100px' },
    { key: 'disposal_type', label: 'Type', width: '100px' },
    { key: 'book_value_at_disposal', label: 'Book Value', width: '100px' },
    { key: 'sale_amount', label: 'Sale Amt', width: '100px' },
    { key: 'gain_loss_display', label: 'Gain/Loss', width: '100px' },
    { key: 'status_display', label: 'Status', width: '100px' }
  ];

  const tableData = filteredRecords.map(r => {
    const gl = parseFloat(r.sale_amount || 0) - parseFloat(r.book_value_at_disposal || 0);
    return {
      ...r,
      disposal_date_display: new Date(r.disposal_date).toLocaleDateString(),
      gain_loss_display: <span style={{ color: gl < 0 ? 'red' : 'green' }}>{gl.toFixed(2)}</span>,
      status_display: <StatusBadge status={r.status} />
    };
  });

  const renderActions = (row) => (
    <div className="action-links">
      {row.status === 'draft' && <span className="action-link" onClick={() => handleEdit(row)}>Edit</span>}
      {row.status === 'draft' && <span className="action-link" onClick={() => handleApproveAction(row.id, 'approved')} style={{ color: 'green' }}>Approve</span>}
      {row.status === 'approved' && <span className="action-link" onClick={() => handleApproveAction(row.id, 'completed')} style={{ color: 'blue' }}>Complete</span>}
    </div>
  );

  const gainLoss = (parseFloat(formData.sale_amount || 0) - parseFloat(formData.book_value_at_disposal || 0)).toFixed(2);

  return (
    <div>
      <div className="header" style={{ marginBottom: '10px' }}>
        <div className="header-title">KSRTC Bus Disposal / Scrapping</div>
      </div>

      <div className="form-container" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">-- All Status --</option>
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
        </select>
        <button className="primary" style={{ marginLeft: 'auto' }} onClick={() => { setShowForm(true); resetForm(); }}>New Disposal</button>
      </div>

      {showForm && (
        <div className="form-container">
          <div className="form-section-title">Disposal Entry</div>
          <form onSubmit={handleSave}>
            <div className="form-row">
              <FormField label="Asset" name="asset_id" type="select" options={assetOptions.map(a => ({ id: a.id, label: a.asset_code }))} value={formData.asset_id} onChange={handleAssetSelect} required disabled={!!editId} error={fieldErrors.asset_id} />
              <FormField label="Date" name="disposal_date" type="date" value={formData.disposal_date} onChange={handleInputChange} required error={fieldErrors.disposal_date} />
              <FormField label="Type" name="disposal_type" type="select" options={[
                { id: 'sale', label: 'Auction / Sale' }, { id: 'scrap', label: 'Scrap / Condemn' }, { id: 'donation', label: 'Donation' }, { id: 'write_off', label: 'Write-Off' }
              ]} value={formData.disposal_type} onChange={handleInputChange} required error={fieldErrors.disposal_type} />
            </div>
            
            <div className="form-row">
              <FormField label="Book Value" name="book_value_at_disposal" type="number" value={formData.book_value_at_disposal} disabled error={fieldErrors.book_value_at_disposal} />
              <FormField label="Sale Amount" name="sale_amount" type="number" value={formData.sale_amount} onChange={handleInputChange} error={fieldErrors.sale_amount} />
              <div className="form-group">
                <label>Gain / Loss</label>
                <div style={{ padding: '4px', border: '1px solid #ccc', height: '24px', fontSize: '12px', background: '#eee', color: gainLoss < 0 ? 'red' : 'green' }}>
                  {gainLoss}
                </div>
              </div>
            </div>

            {formData.disposal_type === 'sale' && (
              <div className="form-row">
                <FormField label="Buyer Name" name="buyer_name" value={formData.buyer_name} onChange={handleInputChange} error={fieldErrors.buyer_name} />
                <FormField label="Buyer Contact" name="buyer_contact" value={formData.buyer_contact} onChange={handleInputChange} error={fieldErrors.buyer_contact} />
              </div>
            )}

            <div className="form-row">
              <FormField label="Reason" name="reason" type="textarea" value={formData.reason} onChange={handleInputChange} error={fieldErrors.reason} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button type="submit" className="primary">Save</button>
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
                {columns.map(col => <td key={col.key}>{row[col.key]}</td>)}
                <td>{renderActions(row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetDisposal;

