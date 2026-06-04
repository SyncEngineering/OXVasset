import React, { useState, useEffect } from 'react';
import * as api from '../../api/tasks/assetReclassifyApi';
import { getDummyData } from '../../utils/dummyDataGenerator';
import FormField from '../../components/common/FormField.jsx';
import Table from '../../components/common/Table.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import '../../styles/form.css';
import '../../styles/table.css';

const AssetReclassify = () => {
  const [records, setRecords] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [subGroupOptions, setSubGroupOptions] = useState([]);
  
  const [formData, setFormData] = useState({
    asset_id: '', reclassify_date: new Date().toISOString().split('T')[0], reason: '',
    old_category_id: '', old_group_id: '', old_sub_group_id: '',
    new_category_id: '', new_group_id: '', new_sub_group_id: ''
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // UI labels for old classification
  const [oldLabels, setOldLabels] = useState({ category: '', group: '', subGroup: '' });

  // Filtered lists for new classification
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [filteredSubGroups, setFilteredSubGroups] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRec, resAssets, resCats, resGroups, resSubGroups] = await Promise.all([
        api.getAll(), api.getAssetOptions(), api.getCategoryOptions(), api.getGroupOptions(), api.getSubGroupOptions()
      ]);
      if (resRec.success) setRecords(resRec.data);
      if (resAssets.success) setAssetOptions(resAssets.data);
      if (resCats.success) setCategoryOptions(resCats.data);
      if (resGroups.success) setGroupOptions(resGroups.data);
      if (resSubGroups.success) setSubGroupOptions(resSubGroups.data);
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
    const asset = assetOptions.find(a => a.id === parseInt(assetId));
    if (asset) {
      setFormData(prev => ({
        ...prev,
        asset_id: assetId,
        old_category_id: asset.category_id,
        old_group_id: asset.group_id,
        old_sub_group_id: asset.sub_group_id
      }));
      setOldLabels({
        category: asset.category_name || 'N/A',
        group: asset.group_name || 'N/A',
        subGroup: asset.sub_group_name || 'N/A'
      });
    } else {
      setFormData(prev => ({ ...prev, asset_id: '' }));
      setOldLabels({ category: '', group: '', subGroup: '' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'new_category_id') {
      setFilteredGroups(groupOptions.filter(g => g.category_id === parseInt(value)));
      setFormData(prev => ({ ...prev, new_group_id: '', new_sub_group_id: '' }));
    }
    if (name === 'new_group_id') {
      setFilteredSubGroups(subGroupOptions.filter(s => s.group_id === parseInt(value)));
      setFormData(prev => ({ ...prev, new_sub_group_id: '' }));
    }
  };

  const handleFillDummy = () => {
    const dummy = getDummyData('AssetReclassify');
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

  const handleApprove = async (id, action) => {
    if (!window.confirm(`${action} this entry?`)) return;
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
    if (clean.reclassify_date) clean.reclassify_date = clean.reclassify_date.split('T')[0];
    
    // Set labels
    setOldLabels({
      category: row.old_category_name || 'N/A',
      group: row.old_group_name || 'N/A',
      subGroup: row.old_sub_group_name || 'N/A'
    });

    // Set filters
    setFilteredGroups(groupOptions.filter(g => g.category_id === row.new_category_id));
    setFilteredSubGroups(subGroupOptions.filter(s => s.group_id === row.new_group_id));

    setFormData(clean);
    setEditId(row.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      asset_id: '', reclassify_date: new Date().toISOString().split('T')[0], reason: '',
      old_category_id: '', old_group_id: '', old_sub_group_id: '',
      new_category_id: '', new_group_id: '', new_sub_group_id: ''
    });
    setOldLabels({ category: '', group: '', subGroup: '' });
    setEditId(null);
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.asset_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? r.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: 'reclassify_no', label: 'No', width: '100px' },
    { key: 'asset_code', label: 'Asset', width: '100px' },
    { key: 'date_display', label: 'Date', width: '100px' },
    { key: 'old_category_name', label: 'Old Cat', width: '120px' },
    { key: 'new_category_name', label: 'New Cat', width: '120px' },
    { key: 'status_display', label: 'Status', width: '100px' }
  ];

  const tableData = filteredRecords.map(r => ({
    ...r,
    date_display: new Date(r.reclassify_date).toLocaleDateString(),
    status_display: <StatusBadge status={r.status} />
  }));

  const renderActions = (row) => (
    <div className="action-links">
      {row.status === 'draft' && <span className="action-link" onClick={() => handleEdit(row)}>Edit</span>}
      {row.status === 'draft' && <span className="action-link" onClick={() => handleApprove(row.id, 'approved')} style={{ color: 'green' }}>Approve</span>}
      {row.status === 'draft' && <span className="action-link" onClick={() => handleApprove(row.id, 'rejected')} style={{ color: 'red' }}>Reject</span>}
    </div>
  );

  return (
    <div>
      <div className="header" style={{ marginBottom: '10px' }}>
        <div className="header-title">Asset Reclassify</div>
      </div>

      <div className="form-container" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">-- All Status --</option>
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <input type="text" placeholder="Search asset code..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <button className="secondary" onClick={() => { setStatusFilter(''); setSearchTerm(''); }}>Clear</button>
        <button className="primary" style={{ marginLeft: 'auto' }} onClick={() => { setShowForm(true); resetForm(); }}>Add New</button>
      </div>

      {showForm && (
        <div className="form-container">
          <div className="form-section-title">Reclassify Details</div>
          <form onSubmit={handleSave}>
            <div className="form-section-title" style={{ background: '#eee', color: '#333' }}>Section 1 — Asset & Date</div>
            <div className="form-row">
              <FormField label="Asset" name="asset_id" type="select" options={assetOptions.map(a => ({ id: a.id, label: a.asset_code }))} value={formData.asset_id} onChange={handleAssetSelect} required disabled={!!editId} />
              <FormField label="Date" name="reclassify_date" type="date" value={formData.reclassify_date} onChange={handleInputChange} required />
              <FormField label="Reason" name="reason" type="textarea" value={formData.reason} onChange={handleInputChange} />
            </div>

            <div className="form-section-title" style={{ background: '#eee', color: '#333' }}>Section 2 — Reclassification</div>
            <div className="form-row">
              <div style={{ flex: 1, padding: '10px', borderRight: '1px solid #ddd' }}>
                <p><strong>Old Classification (Read-only)</strong></p>
                <p>Category: {oldLabels.category}</p>
                <p>Group: {oldLabels.group}</p>
                <p>Sub Group: {oldLabels.subGroup}</p>
              </div>
              <div style={{ flex: 1, padding: '10px' }}>
                <p><strong>New Classification</strong></p>
                <FormField label="New Category" name="new_category_id" type="select" options={categoryOptions.map(c => ({ id: c.id, label: c.name }))} value={formData.new_category_id} onChange={handleInputChange} required />
                <FormField label="New Group" name="new_group_id" type="select" options={filteredGroups.map(g => ({ id: g.id, label: g.name }))} value={formData.new_group_id} onChange={handleInputChange} required />
                <FormField label="New Sub Group" name="new_sub_group_id" type="select" options={filteredSubGroups.map(s => ({ id: s.id, label: s.name }))} value={formData.new_sub_group_id} onChange={handleInputChange} />
              </div>
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
        <Table columns={columns} data={tableData} actions={null} />
        <table className="data-table" style={{ borderTop: '0' }}>
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

export default AssetReclassify;
