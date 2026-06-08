import React, { useState, useEffect } from 'react';
import * as api from '../../api/masters/odometerResetApi';
import FormField from '../../components/common/FormField.jsx';
import Modal from '../../components/common/Modal.jsx';
import Table from '../../components/common/Table.jsx';
import '../../styles/form.css';
import '../../styles/table.css';

const OdometerResetMaster = () => {
  const initialFormState = {
    id: '',
    asset_id: '',
    reset_date: new Date().toISOString().split('T')[0],
    previous_reading: 0,
    new_reading: 0,
    reason: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [assetOptions, setAssetOptions] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [records, setRecords] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const fetchData = async () => {
    try {
      const [resRecords, resAssets] = await Promise.all([
        api.getAll(),
        api.getAssetOptions()
      ]);
      if (resRecords.success) setRecords(resRecords.data);
      if (resAssets.success) setAssetOptions(resAssets.data);
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

  const handleSave = async () => {
    setError('');
    setFieldErrors({});
    if (formData.new_reading < 0) {
      setFieldErrors({ new_reading: 'New reading cannot be negative' });
      return;
    }
    setLoading(true);
    try {
      // Odometer reset is usually an 'insert-only' history log, 
      // but we'll support 'id' for display/delete.
      const res = await api.create(formData);
      if (res.success) {
        setFormData(prev => ({ ...prev, id: res.id }));
      }
      fetchData();
      alert('Reset recorded successfully');
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
    if (!formData.id) return;
    if (!window.confirm('Are you sure you want to delete this reset record?')) return;

    try {
      await api.remove(formData.id);
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
      reset_date: record.reset_date.split('T')[0],
      reason: record.reason || ''
    });
    setShowSearchModal(false);
  };

  const searchColumns = [
    { key: 'asset_code', label: 'Asset Code', width: '100px' },
    { key: 'asset_name', label: 'Asset Name', width: '200px' },
    { key: 'reset_date', label: 'Reset Date', width: '120px', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'new_reading', label: 'New Reading', width: '100px' }
  ];

  return (
    <div className="odometer-reset-master">
      <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#1c5ad6', color: 'white', padding: '5px 10px' }}>
        <span style={{ fontWeight: 'bold' }}>KSRTC — Bus Odometer Reset</span>
      </div>

      <div className="form-container" style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', width: '120px' }}>Search</label>
          <button className="secondary" onClick={() => setShowSearchModal(true)} style={{ padding: '2px 5px' }}>
            🔍
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '12px', width: '150px' }}>Reset ID</label>
            <input type="text" value={formData.id} readOnly style={{ width: '150px', backgroundColor: '#f0f0f0' }} />
          </div>

          <FormField 
            label="Select Asset" 
            name="asset_id" 
            type="select"
            options={assetOptions.map(a => ({ id: a.id, label: `${a.asset_code} — ${a.asset_name}` }))}
            value={formData.asset_id} 
            onChange={handleInputChange} 
            error={fieldErrors.asset_id}
            required 
          />

          <FormField 
            label="Reset Date" 
            name="reset_date" 
            type="date"
            value={formData.reset_date} 
            onChange={handleInputChange} 
            error={fieldErrors.reset_date}
            required 
          />

          <div style={{ display: 'flex', gap: '20px' }}>
            <FormField 
              label="Previous Reading" 
              name="previous_reading" 
              type="number"
              value={formData.previous_reading} 
              onChange={handleInputChange} 
              error={fieldErrors.previous_reading}
              required 
            />
            <FormField 
              label="New Reading" 
              name="new_reading" 
              type="number"
              value={formData.new_reading} 
              onChange={handleInputChange} 
              error={fieldErrors.new_reading}
              required 
            />
          </div>

          <FormField 
            label="Reason" 
            name="reason" 
            type="textarea" 
            value={formData.reason} 
            onChange={handleInputChange} 
            error={fieldErrors.reason}
          />
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="secondary" onClick={handleClear} style={{ backgroundColor: '#008cba', color: 'white', border: 'none', padding: '5px 20px', cursor: 'pointer' }}>Clear</button>
          <button className="primary" onClick={handleSave} disabled={formData.id !== ''} style={{ backgroundColor: '#003399', color: 'white', border: 'none', padding: '5px 20px', cursor: 'pointer' }}>Save 💾</button>
          <button className="danger" onClick={handleDelete} disabled={formData.id === ''} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '5px 20px', cursor: 'pointer' }}>Delete 🗑️</button>
        </div>

        {error && <div style={{ color: 'red', marginTop: '10px', fontSize: '12px' }}>{error}</div>}
      </div>

      <Modal 
        title="ODOMETER RESET SEARCH" 
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

export default OdometerResetMaster;
