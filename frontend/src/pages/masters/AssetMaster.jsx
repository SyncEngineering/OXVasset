import React, { useState, useEffect } from 'react';
import * as api from '../../api/masters/assetMasterApi';
import { getDummyData } from '../../utils/dummyDataGenerator';
import FormField from '../../components/common/FormField.jsx';
import Table from '../../components/common/Table.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import '../../styles/form.css';
import '../../styles/table.css';

const AssetMaster = () => {
  const [records, setRecords] = useState([]);
  const [dropdownOptions, setDropdownOptions] = useState({
    divisions: [], assetTypes: [], assetSubTypes: [], categories: [], groups: [], subGroups: [], locations: []
  });
  const [formData, setFormData] = useState({
    asset_code: '', asset_name: '', description: '', division_code: '', asset_status: 'active', remarks: '',
    type_code: '', sub_type_code: '', category_code: '', group_code: '', sub_group_code: '', location_code: '',
    serial_number: '', model_number: '', manufacturer: '', purchase_date: '', purchase_cost: 0,
    salvage_value: 0, useful_life_years: 0, depreciation_method: 'straight_line', depreciation_rate: 0,
    accumulated_depreciation: 0, barcode: '', qr_code: '', is_active: 1
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Derived state for dependent dropdowns
  const [filteredSubTypes, setFilteredSubTypes] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [filteredSubGroups, setFilteredSubGroups] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRecords, resOptions] = await Promise.all([
        api.getAll(),
        api.getDropdownOptions()
      ]);
      if (resRecords.success) setRecords(resRecords.data);
      if (resOptions.success) setDropdownOptions(resOptions.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.type_code) {
      setFilteredSubTypes(dropdownOptions.assetSubTypes.filter(s => s.type_code === parseInt(formData.type_code)));
    } else {
      setFilteredSubTypes([]);
    }
  }, [formData.type_code, dropdownOptions.assetSubTypes]);

  useEffect(() => {
    if (formData.category_code) {
      setFilteredGroups(dropdownOptions.groups.filter(g => g.category_code === parseInt(formData.category_code)));
    } else {
      setFilteredGroups([]);
    }
  }, [formData.category_code, dropdownOptions.groups]);

  useEffect(() => {
    if (formData.group_code) {
      setFilteredSubGroups(dropdownOptions.subGroups.filter(s => s.group_code === parseInt(formData.group_code)));
    } else {
      setFilteredSubGroups([]);
    }
  }, [formData.group_code, dropdownOptions.subGroups]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Reset dependents
    if (name === 'type_code') setFormData(prev => ({ ...prev, sub_type_code: '' }));
    if (name === 'category_code') setFormData(prev => ({ ...prev, group_code: '', sub_group_code: '' }));
    if (name === 'group_code') setFormData(prev => ({ ...prev, sub_group_code: '' }));
  };

  const handleFillDummy = () => {
    const dummy = getDummyData('AssetMaster');
    setFormData(prev => ({ ...prev, ...dummy }));
    setFieldErrors({});
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
        setError(err.response?.data?.message || 'Failed to save asset');
      }
    }
  };

  const handleEdit = (record) => {
    const cleanRecord = { ...record };
    // Convert dates for input type="date"
    if (cleanRecord.purchase_date) cleanRecord.purchase_date = cleanRecord.purchase_date.split('T')[0];
    
    setFormData(cleanRecord);
    setEditId(record.asset_id);
    setFieldErrors({});
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      asset_code: '', asset_name: '', description: '', division_code: '', asset_status: 'active', remarks: '',
      type_code: '', sub_type_code: '', category_code: '', group_code: '', sub_group_code: '', location_code: '',
      serial_number: '', model_number: '', manufacturer: '', purchase_date: '', purchase_cost: 0,
      salvage_value: 0, useful_life_years: 0, depreciation_method: 'straight_line', depreciation_rate: 0,
      accumulated_depreciation: 0, barcode: '', qr_code: '', is_active: 1
    });
    setEditId(null);
    setFieldErrors({});
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.asset_code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         r.asset_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? r.asset_status === statusFilter : true;
    const matchesDivision = divisionFilter ? r.division_code === parseInt(divisionFilter) : true;
    return matchesSearch && matchesStatus && matchesDivision;
  });

  const columns = [
    { key: 'asset_code', label: 'Code', width: '100px' },
    { key: 'asset_name', label: 'Asset Name', width: '200px' },
    { key: 'division_name', label: 'Division', width: '120px' },
    { key: 'type_name', label: 'Type', width: '120px' },
    { key: 'category_name', label: 'Category', width: '120px' },
    { key: 'location_name', label: 'Location', width: '120px' },
    { key: 'purchase_cost', label: 'Cost', width: '100px' },
    { key: 'status_display', label: 'Status', width: '100px' },
    { key: 'active_display', label: 'Active', width: '80px' }
  ];

  const tableData = filteredRecords.map(r => ({
    ...r,
    status_display: <StatusBadge status={r.asset_status} />,
    active_display: <StatusBadge status={r.is_active ? 'active' : 'inactive'} />
  }));

  const actions = [
    { label: 'Edit', onClick: handleEdit },
    { label: 'Toggle', onClick: (r) => api.toggleActive(r.asset_id).then(fetchData) }
  ];

  return (
    <div>
      <div className="header" style={{ marginBottom: '10px' }}>
        <div className="header-title">Asset Master</div>
      </div>

      <div className="form-container" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search code/name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <select value={divisionFilter} onChange={e => setDivisionFilter(e.target.value)}>
          <option value="">-- All Divisions --</option>
          {dropdownOptions.divisions.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">-- All Status --</option>
          <option value="active">Active</option>
          <option value="disposed">Disposed</option>
          <option value="transferred">Transferred</option>
          <option value="wip">WIP</option>
          <option value="scrapped">Scrapped</option>
        </select>
        <button className="secondary" onClick={() => { setSearchTerm(''); setStatusFilter(''); setDivisionFilter(''); }}>Clear</button>
        <button className="primary" style={{ marginLeft: 'auto' }} onClick={() => { setShowForm(true); resetForm(); }}>Add New Asset</button>
      </div>

      {showForm && (
        <div className="form-container">
          <div className="form-section-title">{editId ? `Edit Asset — ${formData.asset_code}` : 'Add New Asset'}</div>
          <form onSubmit={handleSave}>
            <div className="form-section-title" style={{ background: '#eee', color: '#333' }}>Section 1 — Basic Information</div>
            <div className="form-row">
              <FormField label="Asset Code" name="asset_code" value={formData.asset_code} onChange={handleInputChange} required error={fieldErrors.asset_code} />
              <FormField label="Asset Name" name="asset_name" value={formData.asset_name} onChange={handleInputChange} required error={fieldErrors.asset_name} />
              <FormField label="Division" name="division_code" type="select" options={dropdownOptions.divisions} value={formData.division_code} onChange={handleInputChange} required error={fieldErrors.division_code} />
              <FormField label="Status" name="asset_status" type="select" options={[
                { id: 'active', label: 'Active' }, { id: 'disposed', label: 'Disposed' }, { id: 'transferred', label: 'Transferred' }, { id: 'wip', label: 'WIP' }, { id: 'scrapped', label: 'Scrapped' }
              ]} value={formData.asset_status} onChange={handleInputChange} required error={fieldErrors.asset_status} />
            </div>
            <div className="form-row">
              <FormField label="Description" name="description" type="textarea" value={formData.description} onChange={handleInputChange} error={fieldErrors.description} />
              <FormField label="Remarks" name="remarks" type="textarea" value={formData.remarks} onChange={handleInputChange} error={fieldErrors.remarks} />
            </div>

            <div className="form-section-title" style={{ background: '#eee', color: '#333' }}>Section 2 — Classification</div>
            <div className="form-row">
              <FormField label="Asset Type" name="type_code" type="select" options={dropdownOptions.assetTypes} value={formData.type_code} onChange={handleInputChange} required error={fieldErrors.type_code} />
              <FormField label="Asset Sub Type" name="sub_type_code" type="select" options={filteredSubTypes} value={formData.sub_type_code} onChange={handleInputChange} error={fieldErrors.sub_type_code} />
              <FormField label="Category" name="category_code" type="select" options={dropdownOptions.categories} value={formData.category_code} onChange={handleInputChange} required error={fieldErrors.category_code} />
            </div>
            <div className="form-row">
              <FormField label="Group" name="group_code" type="select" options={filteredGroups} value={formData.group_code} onChange={handleInputChange} required error={fieldErrors.group_code} />
              <FormField label="Sub Group" name="sub_group_code" type="select" options={filteredSubGroups} value={formData.sub_group_code} onChange={handleInputChange} error={fieldErrors.sub_group_code} />
              <FormField label="Location" name="location_code" type="select" options={dropdownOptions.locations} value={formData.location_code} onChange={handleInputChange} error={fieldErrors.location_code} />
            </div>

            <div className="form-section-title" style={{ background: '#eee', color: '#333' }}>Section 3 — Purchase & Depreciation</div>
            <div className="form-row">
              <FormField label="Serial Number" name="serial_number" value={formData.serial_number} onChange={handleInputChange} error={fieldErrors.serial_number} />
              <FormField label="Model Number" name="model_number" value={formData.model_number} onChange={handleInputChange} error={fieldErrors.model_number} />
              <FormField label="Manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} error={fieldErrors.manufacturer} />
              <FormField label="Purchase Date" name="purchase_date" type="date" value={formData.purchase_date} onChange={handleInputChange} error={fieldErrors.purchase_date} />
            </div>
            <div className="form-row">
              <FormField label="Purchase Cost" name="purchase_cost" type="number" value={formData.purchase_cost} onChange={handleInputChange} error={fieldErrors.purchase_cost} />
              <FormField label="Salvage Value" name="salvage_value" type="number" value={formData.salvage_value} onChange={handleInputChange} error={fieldErrors.salvage_value} />
              <FormField label="Useful Life (Years)" name="useful_life_years" type="number" value={formData.useful_life_years} onChange={handleInputChange} error={fieldErrors.useful_life_years} />
              <FormField label="Depr. Method" name="depreciation_method" type="select" options={[
                { id: 'straight_line', label: 'Straight Line' }, { id: 'wdv', label: 'WDV' }, { id: 'none', label: 'None' }
              ]} value={formData.depreciation_method} onChange={handleInputChange} required error={fieldErrors.depreciation_method} />
            </div>
            <div className="form-row">
              <FormField label="Depr. Rate (%)" name="depreciation_rate" type="number" value={formData.depreciation_rate} onChange={handleInputChange} error={fieldErrors.depreciation_rate} />
              <FormField label="Accum. Depr." name="accumulated_depreciation" type="number" value={formData.accumulated_depreciation} onChange={handleInputChange} error={fieldErrors.accumulated_depreciation} />
              <FormField label="Barcode" name="barcode" value={formData.barcode} onChange={handleInputChange} error={fieldErrors.barcode} />
              <FormField label="QR Code" name="qr_code" value={formData.qr_code} onChange={handleInputChange} error={fieldErrors.qr_code} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button type="submit" className="primary">Save Asset</button>
              <button type="button" className="secondary" onClick={handleFillDummy}>Fill Dummy</button>
              <button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}

      <div className="form-container">
        <Table columns={columns} data={tableData} actions={actions} />
      </div>
    </div>
  );
};

export default AssetMaster;
