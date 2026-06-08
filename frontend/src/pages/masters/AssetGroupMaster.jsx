import React, { useState, useEffect } from 'react';
import * as api from '../../api/masters/assetGroupApi';
import FormField from '../../components/common/FormField.jsx';
import Modal from '../../components/common/Modal.jsx';
import Table from '../../components/common/Table.jsx';
import '../../styles/form.css';
import '../../styles/table.css';

const AssetGroupMaster = () => {
  const initialFormState = {
    group_code: '',
    group_name: '',
    category_code: '',
    description: '',
    is_active: 1
  };

  const [formData, setFormData] = useState(initialFormState);
  const [parentOptions, setParentOptions] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [records, setRecords] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const fetchData = async () => {
    try {
      const [resRecords, resParents] = await Promise.all([
        api.getAll(),
        api.getParentOptions()
      ]);
      if (resRecords.success) setRecords(resRecords.data);
      if (resParents.success) setParentOptions(resParents.data);
    } catch (err) {
      console.error('Failed to fetch data');
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

  const handleClear = () => {
    setFormData(initialFormState);
    setFieldErrors({});
    setError('');
  };

  const handleSave = async (isUpdate = false) => {
    setError('');
    setFieldErrors({});
    setLoading(true);
    try {
      if (isUpdate) {
        await api.update(formData.group_code, formData);
      } else {
        const res = await api.create(formData);
        if (res.success) {
           setFormData(prev => ({...prev, group_code: res.id}));
        }
      }
      fetchData();
      alert(isUpdate ? 'Updated successfully' : 'Saved successfully');
    } catch (err) {
      if (err.response?.status === 400 && err.response.data.errors) {
        const errors = {};
        err.response.data.errors.forEach(e => { errors[e.path] = e.msg; });
        setFieldErrors(errors);
      } else {
        setError(err.response?.data?.message || 'Operation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.group_code) return;
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      await api.remove(formData.group_code);
      handleClear();
      fetchData();
      alert('Deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSelectRecord = (record) => {
    setFormData({
      ...record,
      description: record.description || ''
    });
    setShowSearchModal(false);
  };

  const searchColumns = [
    { key: 'group_code', label: 'Code', width: '80px' },
    { key: 'group_name', label: 'Name', width: '200px' },
    { key: 'parent_name', label: 'Category', width: '200px' },
    { key: 'description', label: 'Description', width: '250px' }
  ];

  return (
    <div className="asset-group-master">
      <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#1c5ad6', color: 'white', padding: '5px 10px' }}>
        <span style={{ fontWeight: 'bold' }}>KSRTC - Asset Group Master</span>
      </div>

      <div className="form-container" style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', width: '120px' }}>Search</label>
          <button className="secondary" onClick={() => setShowSearchModal(true)} style={{ padding: '2px 5px' }}>
            🔍
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '12px', width: '150px' }}>Group Code</label>
            <input type="text" value={formData.group_code} readOnly style={{ width: '150px', backgroundColor: '#f0f0f0' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '12px', width: '150px' }}>Parent Category</label>
            <select 
              name="category_code" 
              value={formData.category_code} 
              onChange={handleInputChange} 
              style={{ width: '250px' }}
            >
              <option value="">-- Select Category --</option>
              {parentOptions.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {fieldErrors.category_code && <span style={{ color: 'red', fontSize: '11px' }}>{fieldErrors.category_code}</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '12px', width: '150px' }}>Group Name</label>
            <input 
              type="text" 
              name="group_name" 
              value={formData.group_name} 
              onChange={handleInputChange} 
              style={{ width: '400px' }} 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '12px', width: '150px' }}>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange} 
              style={{ width: '400px', height: '60px', fontFamily: 'Arial' }} 
            />
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="secondary" onClick={handleClear} style={{ backgroundColor: '#008cba', color: 'white', border: 'none', padding: '5px 20px', cursor: 'pointer' }}>Clear</button>
          <button className="primary" onClick={() => handleSave(false)} disabled={formData.group_code !== ''} style={{ backgroundColor: '#003399', color: 'white', border: 'none', padding: '5px 20px', cursor: 'pointer' }}>Save 💾</button>
          <button className="primary" onClick={() => handleSave(true)} disabled={formData.group_code === ''} style={{ backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '5px 20px', cursor: 'pointer' }}>Update ⤴️</button>
          <button className="danger" onClick={handleDelete} disabled={formData.group_code === ''} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '5px 20px', cursor: 'pointer' }}>Delete 🗑️</button>
        </div>

        {error && <div style={{ color: 'red', marginTop: '10px', fontSize: '12px' }}>{error}</div>}
      </div>

      <Modal 
        title="GROUP SEARCH" 
        isOpen={showSearchModal} 
        onClose={() => setShowSearchModal(false)}
        width="800px"
      >
        <Table 
          columns={searchColumns} 
          data={records} 
          onRowClick={handleSelectRecord}
        />
      </Modal>
    </div>
  );
};

export default AssetGroupMaster;
