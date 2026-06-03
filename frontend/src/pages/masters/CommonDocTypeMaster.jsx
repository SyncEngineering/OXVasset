import React, { useState, useEffect } from 'react';
import * as api from '../../api/masters/commonDocTypeApi';
import FormField from '../../components/common/FormField.jsx';
import Table from '../../components/common/Table.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import '../../styles/form.css';
import '../../styles/table.css';

const CommonDocTypeMaster = () => {
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({ 
    doc_type_code: '', 
    doc_type_name: '', 
    description: '', 
    is_mandatory: 0,
    is_active: 1 
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.getAll();
      if (res.success) setRecords(res.data);
    } catch (err) {
      setError('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value 
    }));
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
      setFormData({ doc_type_code: '', doc_type_name: '', description: '', is_mandatory: 0, is_active: 1 });
      setEditId(null);
      fetchRecords();
    } catch (err) {
      setError('Failed to save record');
    }
  };

  const handleEdit = (record) => {
    setFormData({
      doc_type_code: record.doc_type_code,
      doc_type_name: record.doc_type_name,
      description: record.description || '',
      is_mandatory: record.is_mandatory,
      is_active: record.is_active
    });
    setEditId(record.id);
    setShowForm(true);
  };

  const handleToggleActive = async (id) => {
    try {
      await api.toggleActive(id);
      fetchRecords();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const filteredRecords = records.filter(r => 
    r.doc_type_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.doc_type_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'doc_type_code', label: 'Code', width: '150px' },
    { key: 'doc_type_name', label: 'Name', width: '250px' },
    { key: 'mandatory_display', label: 'Mandatory', width: '100px' },
    { key: 'status_display', label: 'Status', width: '100px' }
  ];

  const tableData = filteredRecords.map(r => ({
    ...r,
    mandatory_display: r.is_mandatory ? 'Yes' : 'No',
    status_display: <StatusBadge status={r.is_active ? 'active' : 'inactive'} />
  }));

  const actions = [
    { label: 'Edit', onClick: handleEdit },
    { label: 'Toggle Active', onClick: (r) => handleToggleActive(r.id) }
  ];

  return (
    <div>
      <div className="header" style={{ marginBottom: '10px' }}>
        <div className="header-title">Common Document Type Master</div>
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
        <button className="primary" onClick={() => { setShowForm(true); setEditId(null); setFormData({ doc_type_code: '', doc_type_name: '', description: '', is_mandatory: 0, is_active: 1 }); }}>
          Add New
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <div className="form-section-title">{editId ? `Edit — ${formData.doc_type_code}` : 'Add New Document Type'}</div>
          <form onSubmit={handleSave}>
            <div className="form-row">
              <FormField 
                label="Document Type Code" 
                name="doc_type_code" 
                value={formData.doc_type_code} 
                onChange={handleInputChange} 
                required 
              />
              <FormField 
                label="Document Type Name" 
                name="doc_type_name" 
                value={formData.doc_type_name} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="form-row">
              <FormField 
                label="Description" 
                name="description" 
                type="textarea" 
                value={formData.description} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-row">
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  id="is_mandatory" 
                  name="is_mandatory" 
                  checked={formData.is_mandatory === 1} 
                  onChange={handleInputChange} 
                />
                <label htmlFor="is_mandatory">Is Mandatory?</label>
              </div>
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

export default CommonDocTypeMaster;
