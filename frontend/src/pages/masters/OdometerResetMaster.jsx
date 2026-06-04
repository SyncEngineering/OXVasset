import React, { useState, useEffect } from 'react';
import * as api from '../../api/masters/odometerResetApi';
import { getDummyData } from '../../utils/dummyDataGenerator';
import FormField from '../../components/common/FormField.jsx';
import Table from '../../components/common/Table.jsx';
import '../../styles/form.css';
import '../../styles/table.css';

const OdometerResetMaster = () => {
  const [records, setRecords] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [formData, setFormData] = useState({ 
    asset_id: '', 
    reset_date: new Date().toISOString().split('T')[0], 
    previous_reading: 0, 
    new_reading: 0, 
    reason: '' 
  });
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFillDummy = () => {
    const dummy = getDummyData('OdometerReset');
    setFormData(prev => ({ ...prev, ...dummy }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.new_reading < 0) {
      setError('New reading cannot be negative');
      return;
    }
    try {
      await api.create(formData);
      setShowForm(false);
      setFormData({ 
        asset_id: '', 
        reset_date: new Date().toISOString().split('T')[0], 
        previous_reading: 0, 
        new_reading: 0, 
        reason: '' 
      });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to save record');
    }
  };

  const filteredRecords = records.filter(r => 
    r.asset_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.asset_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'asset_code', label: 'Asset Code', width: '120px' },
    { key: 'asset_name', label: 'Asset Name', width: '200px' },
    { key: 'reset_date_display', label: 'Reset Date', width: '120px' },
    { key: 'previous_reading', label: 'Prev Reading', width: '120px' },
    { key: 'new_reading', label: 'New Reading', width: '120px' },
    { key: 'reason', label: 'Reason', width: '250px' },
    { key: 'created_by', label: 'By', width: '100px' }
  ];

  const tableData = filteredRecords.map(r => ({
    ...r,
    reset_date_display: new Date(r.reset_date).toLocaleDateString()
  }));

  return (
    <div>
      <div className="header" style={{ marginBottom: '10px' }}>
        <div className="header-title">Vehicle Odometer Reset</div>
      </div>

      <div className="form-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Search asset..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="secondary" onClick={() => setSearchTerm('')}>Clear</button>
        </div>
        <button className="primary" onClick={() => setShowForm(true)}>
          Add New Reset
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <div className="form-section-title">Record Odometer Reset</div>
          <form onSubmit={handleSave}>
            <div className="form-row">
              <FormField 
                label="Select Asset" 
                name="asset_id" 
                type="select"
                options={assetOptions.map(a => ({ id: a.id, label: `${a.asset_code} — ${a.asset_name}` }))}
                value={formData.asset_id} 
                onChange={handleInputChange} 
                required 
              />
              <FormField 
                label="Reset Date" 
                name="reset_date" 
                type="date"
                value={formData.reset_date} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="form-row">
              <FormField 
                label="Previous Reading" 
                name="previous_reading" 
                type="number"
                value={formData.previous_reading} 
                onChange={handleInputChange} 
                required 
              />
              <FormField 
                label="New Reading" 
                name="new_reading" 
                type="number"
                value={formData.new_reading} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="form-row">
              <FormField 
                label="Reason" 
                name="reason" 
                type="textarea" 
                value={formData.reason} 
                onChange={handleInputChange} 
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="primary">Save</button>
              <button type="button" className="secondary" onClick={handleFillDummy}>Fill Dummy</button>
              <button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <div className="form-container">
        <Table columns={columns} data={tableData} />
      </div>
    </div>
  );
};

export default OdometerResetMaster;
