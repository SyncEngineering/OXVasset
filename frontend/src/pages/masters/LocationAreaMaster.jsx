import React, { useState, useEffect } from 'react';
import * as api from '../../api/masters/locationAreaApi';
import FormField from '../../components/common/FormField.jsx';
import Table from '../../components/common/Table.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import '../../styles/form.css';
import '../../styles/table.css';

const LocationAreaMaster = () => {
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({ 
    location_code: '', 
    location_name: '', 
    address: '', 
    city: '', 
    state: '', 
    country: '', 
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
      setFormData({ location_code: '', location_name: '', address: '', city: '', state: '', country: '', is_active: 1 });
      setEditId(null);
      fetchRecords();
    } catch (err) {
      setError('Failed to save record');
    }
  };

  const handleEdit = (record) => {
    setFormData({
      location_code: record.location_code,
      location_name: record.location_name,
      address: record.address || '',
      city: record.city || '',
      state: record.state || '',
      country: record.country || '',
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
    r.location_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.location_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'location_code', label: 'Code', width: '120px' },
    { key: 'location_name', label: 'Name', width: '200px' },
    { key: 'city', label: 'City', width: '120px' },
    { key: 'state', label: 'State', width: '120px' },
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
        <div className="header-title">Location / Area Master</div>
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
        <button className="primary" onClick={() => { setShowForm(true); setEditId(null); setFormData({ location_code: '', location_name: '', address: '', city: '', state: '', country: '', is_active: 1 }); }}>
          Add New
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <div className="form-section-title">{editId ? `Edit — ${formData.location_code}` : 'Add New Location'}</div>
          <form onSubmit={handleSave}>
            <div className="form-row">
              <FormField 
                label="Location Code" 
                name="location_code" 
                value={formData.location_code} 
                onChange={handleInputChange} 
                required 
              />
              <FormField 
                label="Location Name" 
                name="location_name" 
                value={formData.location_name} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="form-row">
              <FormField 
                label="Address" 
                name="address" 
                type="textarea"
                value={formData.address} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-row">
              <FormField label="City" name="city" value={formData.city} onChange={handleInputChange} />
              <FormField label="State" name="state" value={formData.state} onChange={handleInputChange} />
              <FormField label="Country" name="country" value={formData.country} onChange={handleInputChange} />
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

export default LocationAreaMaster;
