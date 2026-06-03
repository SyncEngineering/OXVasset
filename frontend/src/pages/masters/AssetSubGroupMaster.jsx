import React, { useState, useEffect } from 'react';
import * as api from '../../api/masters/assetSubGroupApi';
import FormField from '../../components/common/FormField.jsx';
import Table from '../../components/common/Table.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import '../../styles/form.css';
import '../../styles/table.css';

const AssetSubGroupMaster = () => {
  const [records, setRecords] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);
  const [formData, setFormData] = useState({ sub_group_code: '', sub_group_name: '', group_id: '', description: '', is_active: 1 });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRecords, resParents] = await Promise.all([
        api.getAll(),
        api.getParentOptions()
      ]);
      if (resRecords.success) setRecords(resRecords.data);
      if (resParents.success) setParentOptions(resParents.data);
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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.update(editId, formData);
      } else {
        await api.create(formData);
      }
      setShowForm(false);
      setFormData({ sub_group_code: '', sub_group_name: '', group_id: '', description: '', is_active: 1 });
      setEditId(null);
      fetchData();
    } catch (err) {
      setError('Failed to save record');
    }
  };

  const handleEdit = (record) => {
    setFormData({
      sub_group_code: record.sub_group_code,
      sub_group_name: record.sub_group_name,
      group_id: record.group_id,
      description: record.description || '',
      is_active: record.is_active
    });
    setEditId(record.id);
    setShowForm(true);
  };

  const handleToggleActive = async (id) => {
    try {
      await api.toggleActive(id);
      fetchData();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const filteredRecords = records.filter(r => 
    r.sub_group_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.sub_group_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'sub_group_code', label: 'Code', width: '120px' },
    { key: 'sub_group_name', label: 'Name', width: '200px' },
    { key: 'parent_name', label: 'Group', width: '200px' },
    { key: 'status_display', label: 'Status', width: '100px' }
  ];

  const tableData = filteredRecords.map(r => ({
    ...r,
    status_display: <StatusBadge status={r.is_active ? 'active' : 'inactive'} />
  }));

  const actions = [
    { label: 'Edit', onClick: handleEdit },
    { label: 'Toggle Active', onClick: (r) => handleToggleActive(r.id) }
  ];

  return (
    <div>
      <div className="header" style={{ marginBottom: '10px' }}>
        <div className="header-title">Asset Sub Group Master</div>
      </div>

      <div className="form-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Search code or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="secondary" onClick={() => setSearchTerm('')}>Clear</button>
        </div>
        <button className="primary" onClick={() => { setShowForm(true); setEditId(null); setFormData({ sub_group_code: '', sub_group_name: '', group_id: '', description: '', is_active: 1 }); }}>
          Add New
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <div className="form-section-title">{editId ? `Edit — ${formData.sub_group_code}` : 'Add New Sub Group'}</div>
          <form onSubmit={handleSave}>
            <div className="form-row">
              <FormField 
                label="Parent Group" 
                name="group_id" 
                type="select"
                options={parentOptions.map(p => ({ id: p.id, label: p.name }))}
                value={formData.group_id} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="form-row">
              <FormField 
                label="Sub Group Code" 
                name="sub_group_code" 
                value={formData.sub_group_code} 
                onChange={handleInputChange} 
                required 
                disabled={!formData.group_id}
              />
              <FormField 
                label="Sub Group Name" 
                name="sub_group_name" 
                value={formData.sub_group_name} 
                onChange={handleInputChange} 
                required 
                disabled={!formData.group_id}
              />
            </div>
            <div className="form-row">
              <FormField 
                label="Description" 
                name="description" 
                type="textarea" 
                value={formData.description} 
                onChange={handleInputChange} 
                disabled={!formData.group_id}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="primary">Save</button>
              <button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <div className="form-container">
        <Table columns={columns} data={tableData} actions={actions} />
      </div>
    </div>
  );
};

export default AssetSubGroupMaster;
