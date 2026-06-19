import React, { useState, useEffect } from 'react';
import * as api from '../../api/tasks/depreciationEntryApi';
import FormField from '../../components/common/FormField.jsx';
import Table from '../../components/common/Table.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import '../../styles/form.css';
import '../../styles/table.css';

const DepreciationEntry = () => {
  const [records, setRecords] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [formData, setFormData] = useState({
    asset_id: '', entry_date: new Date().toISOString().split('T')[0], 
    period_from: '', period_to: '', depreciation_method: 'straight_line',
    opening_book_value: 0, depreciation_amount: 0, closing_book_value: 0, remarks: ''
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
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

  const handleAssetSelect = (e) => {
    const assetId = e.target.value;
    const { name } = e.target;
    const asset = assetOptions.find(a => a.id === parseInt(assetId));
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (asset) {
      let depAmount = 0;
      const { depreciation_method, purchase_cost, salvage_value, useful_life_years, depreciation_rate, current_book_value } = asset;
      
      if (depreciation_method === 'straight_line') {
        const annual = (parseFloat(purchase_cost) - parseFloat(salvage_value)) / parseInt(useful_life_years || 1);
        depAmount = annual / 12;
      } else if (depreciation_method === 'wdv') {
        depAmount = parseFloat(current_book_value) * (parseFloat(depreciation_rate || 0) / 100) / 12;
      }

      setFormData(prev => ({
        ...prev,
        asset_id: assetId,
        depreciation_method: depreciation_method === 'none' ? 'straight_line' : depreciation_method,
        opening_book_value: parseFloat(current_book_value).toFixed(2),
        depreciation_amount: depAmount.toFixed(2),
        closing_book_value: (parseFloat(current_book_value) - depAmount).toFixed(2)
      }));
    } else {
      setFormData(prev => ({ ...prev, asset_id: '' }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'opening_book_value' || name === 'depreciation_amount') {
        newState.closing_book_value = (parseFloat(newState.opening_book_value || 0) - parseFloat(newState.depreciation_amount || 0)).toFixed(2);
      }
      return newState;
    });
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
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

  const handlePost = async (id) => {
    if (!window.confirm('Post this depreciation entry? This will update the asset book value.')) return;
    try {
      await api.postEntry(id);
      fetchData();
    } catch (err) {
      setError(err.message || 'Post failed');
    }
  };

  const handleReverse = async (id) => {
    if (!window.confirm('Reverse this entry? The asset book value will be restored.')) return;
    try {
      await api.reverseEntry(id);
      fetchData();
    } catch (err) {
      setError(err.message || 'Reverse failed');
    }
  };

  const handleEdit = (record) => {
    if (record.status !== 'draft') {
      alert('Only draft entries can be edited');
      return;
    }
    const cleanRecord = { ...record };
    if (cleanRecord.entry_date) cleanRecord.entry_date = cleanRecord.entry_date.split('T')[0];
    if (cleanRecord.period_from) cleanRecord.period_from = cleanRecord.period_from.split('T')[0];
    if (cleanRecord.period_to) cleanRecord.period_to = cleanRecord.period_to.split('T')[0];
    
    setFormData(cleanRecord);
    setEditId(record.id);
    setFieldErrors({});
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      asset_id: '', entry_date: new Date().toISOString().split('T')[0], 
      period_from: '', period_to: '', depreciation_method: 'straight_line',
      opening_book_value: 0, depreciation_amount: 0, closing_book_value: 0, remarks: ''
    });
    setEditId(null);
    setFieldErrors({});
  };

  const filteredRecords = records.filter(r => {
    const matchesStatus = statusFilter ? r.status === statusFilter : true;
    const matchesDateFrom = dateFrom ? new Date(r.entry_date) >= new Date(dateFrom) : true;
    const matchesDateTo = dateTo ? new Date(r.entry_date) <= new Date(dateTo) : true;
    return matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const columns = [
    { key: 'entry_no', label: 'Entry No', width: '100px' },
    { key: 'asset_code', label: 'Asset Code', width: '100px' },
    { key: 'asset_name', label: 'Asset Name', width: '150px' },
    { key: 'entry_date_display', label: 'Date', width: '100px' },
    { key: 'depreciation_amount', label: 'Depr. Amount', width: '100px' },
    { key: 'closing_book_value', label: 'Closing Value', width: '100px' },
    { key: 'depreciation_method', label: 'Method', width: '100px' },
    { key: 'status_display', label: 'Status', width: '100px' }
  ];

  const tableData = filteredRecords.map(r => ({
    ...r,
    entry_date_display: new Date(r.entry_date).toLocaleDateString(),
    status_display: <StatusBadge status={r.status} />
  }));

  const renderActions = (row) => (
    <div className="action-links">
      {row.status === 'draft' && <span className="action-link" onClick={() => handleEdit(row)}>Edit</span>}
      {row.status === 'draft' && <span className="action-link" onClick={() => handlePost(row.id)} style={{ color: 'green' }}>Post</span>}
      {row.status === 'posted' && <span className="action-link" onClick={() => handleReverse(row.id)} style={{ color: 'red' }}>Reverse</span>}
    </div>
  );

  return (
    <div>
      <div className="header" style={{ marginBottom: '10px' }}>
        <div className="header-title">KSRTC Depreciation Entry</div>
      </div>

      <div className="form-container" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">-- All Status --</option>
          <option value="draft">Draft</option>
          <option value="posted">Posted</option>
          <option value="reversed">Reversed</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <label style={{ fontSize: '12px' }}>From:</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <label style={{ fontSize: '12px' }}>To:</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <button className="secondary" onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo(''); }}>Clear</button>
        <button className="primary" style={{ marginLeft: 'auto' }} onClick={() => { setShowForm(true); resetForm(); }}>Add New Entry</button>
      </div>

      {showForm && (
        <div className="form-container">
          <div className="form-section-title">{editId ? `Edit Entry - ${formData.entry_no}` : 'New Depreciation Entry'}</div>
          <form onSubmit={handleSave}>
            <div className="form-section-title" style={{ background: '#eee', color: '#333' }}>Section 1 - Entry Details</div>
            <div className="form-row">
              <FormField label="Asset" name="asset_id" type="select" 
                options={assetOptions.map(a => ({ id: a.id, label: `${a.asset_code} - ${a.asset_name}` }))} 
                value={formData.asset_id} onChange={handleAssetSelect} required disabled={!!editId} error={fieldErrors.asset_id} />
              <FormField label="Entry Date" name="entry_date" type="date" value={formData.entry_date} onChange={handleInputChange} required error={fieldErrors.entry_date} />
              <FormField label="Period From" name="period_from" type="date" value={formData.period_from} onChange={handleInputChange} required error={fieldErrors.period_from} />
              <FormField label="Period To" name="period_to" type="date" value={formData.period_to} onChange={handleInputChange} required error={fieldErrors.period_to} />
              <FormField label="Depr. Method" name="depreciation_method" type="select" options={[
                { id: 'straight_line', label: 'Straight Line' }, { id: 'wdv', label: 'WDV' }
              ]} value={formData.depreciation_method} onChange={handleInputChange} required error={fieldErrors.depreciation_method} />
            </div>
            <div className="form-row">
              <FormField label="Remarks" name="remarks" type="textarea" value={formData.remarks} onChange={handleInputChange} error={fieldErrors.remarks} />
            </div>

            <div className="form-section-title" style={{ background: '#eee', color: '#333' }}>Section 2 - Calculation</div>
            <div className="form-row">
              <FormField label="Opening Book Value" name="opening_book_value" type="number" value={formData.opening_book_value} onChange={handleInputChange} required error={fieldErrors.opening_book_value} />
              <FormField label="Depreciation Amount" name="depreciation_amount" type="number" value={formData.depreciation_amount} onChange={handleInputChange} required error={fieldErrors.depreciation_amount} />
              <FormField label="Closing Book Value" name="closing_book_value" type="number" value={formData.closing_book_value} onChange={handleInputChange} required error={fieldErrors.closing_book_value} />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button type="submit" className="primary">Save Entry</button>
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
              <th style={{ width: '120px' }}>Actions</th>
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

export default DepreciationEntry;

