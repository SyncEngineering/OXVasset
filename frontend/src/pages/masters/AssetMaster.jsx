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
    asset_code: '', asset_name: '', description: '', division_id: '', asset_status: 'active', remarks: '',
    asset_type_id: '', asset_sub_type_id: '', category_id: '', group_id: '', sub_group_id: '', location_id: '',
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
    if (formData.asset_type_id) {
      setFilteredSubTypes(dropdownOptions.assetSubTypes.filter(s => s.asset_type_id === parseInt(formData.asset_type_id)));
    } else {
      setFilteredSubTypes([]);
    }
  }, [formData.asset_type_id, dropdownOptions.assetSubTypes]);

  useEffect(() => {
    if (formData.category_id) {
      setFilteredGroups(dropdownOptions.groups.filter(g => g.category_id === parseInt(formData.category_id)));
    } else {
      setFilteredGroups([]);
    }
  }, [formData.category_id, dropdownOptions.groups]);

  useEffect(() => {
    if (formData.group_id) {
      setFilteredSubGroups(dropdownOptions.subGroups.filter(s => s.group_id === parseInt(formData.group_id)));
    } else {
      setFilteredSubGroups([]);
    }
  }, [formData.group_id, dropdownOptions.subGroups]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Reset dependents
    if (name === 'asset_type_id') setFormData(prev => ({ ...prev, asset_sub_type_id: '' }));
    if (name === 'category_id') setFormData(prev => ({ ...prev, group_id: '', sub_group_id: '' }));
    if (name === 'group_id') setFormData(prev => ({ ...prev, sub_group_id: '' }));
  };

  const handleFillDummy = () => {
    const dummy = getDummyData('AssetMaster');
    setFormData(prev => ({ ...prev, ...dummy }));
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
      resetForm();
      fetchData();
    } catch (err) {
      setError('Failed to save asset');
    }
  };

  const handleEdit = (record) => {
    const cleanRecord = { ...record };
    // Convert dates for input type="date"
    if (cleanRecord.purchase_date) cleanRecord.purchase_date = cleanRecord.purchase_date.split('T')[0];
    
    setFormData(cleanRecord);
    setEditId(record.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      asset_code: '', asset_name: '', description: '', division_id: '', asset_status: 'active', remarks: '',
      asset_type_id: '', asset_sub_type_id: '', category_id: '', group_id: '', sub_group_id: '', location_id: '',
      serial_number: '', model_number: '', manufacturer: '', purchase_date: '', purchase_cost: 0,
      salvage_value: 0, useful_life_years: 0, depreciation_method: 'straight_line', depreciation_rate: 0,
      accumulated_depreciation: 0, barcode: '', qr_code: '', is_active: 1
    });
    setEditId(null);
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.asset_code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         r.asset_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? r.asset_status === statusFilter : true;
    const matchesDivision = divisionFilter ? r.division_id === parseInt(divisionFilter) : true;
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
    { label: 'Toggle', onClick: (r) => api.toggleActive(r.id).then(fetchData) }
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
              <FormField label="Asset Code" name="asset_code" value={formData.asset_code} onChange={handleInputChange} required />
              <FormField label="Asset Name" name="asset_name" value={formData.asset_name} onChange={handleInputChange} required />
              <FormField label="Division" name="division_id" type="select" options={dropdownOptions.divisions} value={formData.division_id} onChange={handleInputChange} required />
              <FormField label="Status" name="asset_status" type="select" options={[
                { id: 'active', label: 'Active' }, { id: 'disposed', label: 'Disposed' }, { id: 'transferred', label: 'Transferred' }, { id: 'wip', label: 'WIP' }, { id: 'scrapped', label: 'Scrapped' }
              ]} value={formData.asset_status} onChange={handleInputChange} required />
            </div>
            <div className="form-row">
              <FormField label="Description" name="description" type="textarea" value={formData.description} onChange={handleInputChange} />
              <FormField label="Remarks" name="remarks" type="textarea" value={formData.remarks} onChange={handleInputChange} />
            </div>

            <div className="form-section-title" style={{ background: '#eee', color: '#333' }}>Section 2 — Classification</div>
            <div className="form-row">
              <FormField label="Asset Type" name="asset_type_id" type="select" options={dropdownOptions.assetTypes} value={formData.asset_type_id} onChange={handleInputChange} required />
              <FormField label="Asset Sub Type" name="asset_sub_type_id" type="select" options={filteredSubTypes} value={formData.asset_sub_type_id} onChange={handleInputChange} />
              <FormField label="Category" name="category_id" type="select" options={dropdownOptions.categories} value={formData.category_id} onChange={handleInputChange} required />
            </div>
            <div className="form-row">
              <FormField label="Group" name="group_id" type="select" options={filteredGroups} value={formData.group_id} onChange={handleInputChange} required />
              <FormField label="Sub Group" name="sub_group_id" type="select" options={filteredSubGroups} value={formData.sub_group_id} onChange={handleInputChange} />
              <FormField label="Location" name="location_id" type="select" options={dropdownOptions.locations} value={formData.location_id} onChange={handleInputChange} />
            </div>

            <div className="form-section-title" style={{ background: '#eee', color: '#333' }}>Section 3 — Purchase & Depreciation</div>
            <div className="form-row">
              <FormField label="Serial Number" name="serial_number" value={formData.serial_number} onChange={handleInputChange} />
              <FormField label="Model Number" name="model_number" value={formData.model_number} onChange={handleInputChange} />
              <FormField label="Manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} />
              <FormField label="Purchase Date" name="purchase_date" type="date" value={formData.purchase_date} onChange={handleInputChange} />
            </div>
            <div className="form-row">
              <FormField label="Purchase Cost" name="purchase_cost" type="number" value={formData.purchase_cost} onChange={handleInputChange} />
              <FormField label="Salvage Value" name="salvage_value" type="number" value={formData.salvage_value} onChange={handleInputChange} />
              <FormField label="Useful Life (Years)" name="useful_life_years" type="number" value={formData.useful_life_years} onChange={handleInputChange} />
              <FormField label="Depr. Method" name="depreciation_method" type="select" options={[
                { id: 'straight_line', label: 'Straight Line' }, { id: 'wdv', label: 'WDV' }, { id: 'none', label: 'None' }
              ]} value={formData.depreciation_method} onChange={handleInputChange} required />
            </div>
            <div className="form-row">
              <FormField label="Depr. Rate (%)" name="depreciation_rate" type="number" value={formData.depreciation_rate} onChange={handleInputChange} />
              <FormField label="Accum. Depr." name="accumulated_depreciation" type="number" value={formData.accumulated_depreciation} onChange={handleInputChange} />
              <FormField label="Barcode" name="barcode" value={formData.barcode} onChange={handleInputChange} />
              <FormField label="QR Code" name="qr_code" value={formData.qr_code} onChange={handleInputChange} />
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
