import React, { useState, useEffect } from 'react';
import * as api from '../../api/masters/assetTypeApi';
import FormField from '../../components/common/FormField.jsx';
import Modal from '../../components/common/Modal.jsx';
import Table from '../../components/common/Table.jsx';
import '../../styles/form.css';
import '../../styles/table.css';

const AssetTypeMaster = () => {
  const initialFormState = {
    type_code: '',
    type_prefix: '',
    type_name: '',
    fuel_distance: 0,
    jobcard_control_type: 'Workshop(Movable)',
    doc_expiry_visible_yn: 1,
    trailer_trip_calc_base_weight: 0,
    trip_applicable_yn: 0,
    asset_single_unit_yn: 1,
    description: '',
    is_active: 1
  };

  const [formData, setFormData] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [records, setRecords] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const fetchRecords = async () => {
    try {
      const res = await api.getAll();
      if (res.success) setRecords(res.data);
    } catch (err) {
      console.error('Failed to fetch records');
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;
    
    if (type === 'radio') {
      finalValue = parseInt(value, 10);
    } else if (name === 'fuel_distance' || name === 'trailer_trip_calc_base_weight') {
      finalValue = value === '' ? '' : parseFloat(value);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
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
        await api.update(formData.type_code, formData);
      } else {
        const res = await api.create(formData);
        if (res.success) {
           setFormData(prev => ({...prev, type_code: res.id}));
        }
      }
      fetchRecords();
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
    if (!formData.type_code) return;
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      await api.remove(formData.type_code);
      handleClear();
      fetchRecords();
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
    { key: 'type_code', label: 'Code', width: '80px' },
    { key: 'type_name', label: 'Name', width: '200px' },
    { key: 'trailer_trip_calc_base_weight', label: 'Base Weight', width: '120px' },
    { key: 'trip_applicable_yn', label: 'Trip Applicable', width: '120px', render: (val) => val ? 'YES' : 'NO' }
  ];

  return (
    <div className="asset-type-master">
      <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#1c5ad6', color: 'white', padding: '5px 10px' }}>
        <span style={{ fontWeight: 'bold' }}>KSRTC — Asset Type Master</span>
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
            <label style={{ fontSize: '12px', width: '150px' }}>Asset Type code</label>
            <input type="text" value={formData.type_code} readOnly style={{ width: '150px', backgroundColor: '#f0f0f0' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '12px', width: '150px' }}>Asset Type Prefix</label>
            <input 
              type="text" 
              name="type_prefix" 
              value={formData.type_prefix} 
              onChange={handleInputChange} 
              maxLength={3} 
              style={{ width: '150px' }} 
            />
            <span style={{ fontSize: '11px', color: '#666' }}>(Should be Three Letters)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '12px', width: '150px' }}>Asset Type Name</label>
            <input 
              type="text" 
              name="type_name" 
              value={formData.type_name} 
              onChange={handleInputChange} 
              style={{ width: '400px' }} 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '12px', width: '150px' }}>Fuel Distance</label>
            <input 
              type="number" 
              name="fuel_distance" 
              value={formData.fuel_distance} 
              onChange={handleInputChange} 
              style={{ width: '150px' }} 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '12px', width: '150px' }}>Jobcard Control Type</label>
            <select 
              name="jobcard_control_type" 
              value={formData.jobcard_control_type} 
              onChange={handleInputChange} 
              style={{ width: '200px' }}
            >
              <option value="Workshop(Movable)">Workshop(Movable)</option>
              <option value="Fixed">Fixed</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '12px', width: '150px' }}>Document Expiry Visible[Yes/No]</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label style={{ fontWeight: 'normal', fontSize: '12px' }}>
                <input type="radio" name="doc_expiry_visible_yn" value={1} checked={formData.doc_expiry_visible_yn === 1} onChange={handleInputChange} /> Yes
              </label>
              <label style={{ fontWeight: 'normal', fontSize: '12px' }}>
                <input type="radio" name="doc_expiry_visible_yn" value={0} checked={formData.doc_expiry_visible_yn === 0} onChange={handleInputChange} /> No
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '12px', width: '150px' }}>Trailer Trip Calc. Base Weight</label>
            <input 
              type="number" 
              name="trailer_trip_calc_base_weight" 
              value={formData.trailer_trip_calc_base_weight} 
              onChange={handleInputChange} 
              style={{ width: '150px' }} 
            />
            <label style={{ fontSize: '12px', marginLeft: '20px' }}>Trip Applicable YN</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label style={{ fontWeight: 'normal', fontSize: '12px' }}>
                <input type="radio" name="trip_applicable_yn" value={1} checked={formData.trip_applicable_yn === 1} onChange={handleInputChange} /> Yes
              </label>
              <label style={{ fontWeight: 'normal', fontSize: '12px' }}>
                <input type="radio" name="trip_applicable_yn" value={0} checked={formData.trip_applicable_yn === 0} onChange={handleInputChange} /> No
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '12px', width: '150px' }}>Asset Single Unit YN</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label style={{ fontWeight: 'normal', fontSize: '12px' }}>
                <input type="radio" name="asset_single_unit_yn" value={1} checked={formData.asset_single_unit_yn === 1} onChange={handleInputChange} /> Yes
              </label>
              <label style={{ fontWeight: 'normal', fontSize: '12px' }}>
                <input type="radio" name="asset_single_unit_yn" value={0} checked={formData.asset_single_unit_yn === 0} onChange={handleInputChange} /> No
              </label>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="secondary" onClick={handleClear} style={{ backgroundColor: '#008cba', color: 'white', border: 'none', padding: '5px 20px', cursor: 'pointer' }}>Clear</button>
          <button className="primary" onClick={() => handleSave(false)} disabled={formData.type_code !== ''} style={{ backgroundColor: '#003399', color: 'white', border: 'none', padding: '5px 20px', cursor: 'pointer' }}>Save 💾</button>
          <button className="primary" onClick={() => handleSave(true)} disabled={formData.type_code === ''} style={{ backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '5px 20px', cursor: 'pointer' }}>Update ⤴️</button>
          <button className="danger" onClick={handleDelete} disabled={formData.type_code === ''} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '5px 20px', cursor: 'pointer' }}>Delete 🗑️</button>
        </div>

        {error && <div style={{ color: 'red', marginTop: '10px', fontSize: '12px' }}>{error}</div>}
      </div>

      <Modal 
        title="VEHICLE TYPE SEARCH - Google Chrome" 
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

export default AssetTypeMaster;
