import React, { useState, useEffect } from 'react';
import * as api from '../../api/reports/assetBarcodeApi';
import * as divisionApi from '../../api/masters/assetDivisionApi';
import * as categoryApi from '../../api/masters/assetCategoryApi';
import FormField from '../../components/common/FormField.jsx';
import Table from '../../components/common/Table.jsx';
import '../../styles/form.css';
import '../../styles/table.css';

const AssetBarcode = () => {
  const [assets, setAssets] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedAssets, setSelectedAssets] = useState([]);
  
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  
  const [filters, setFilters] = useState({
    division_code: '',
    category_code: '',
    asset_status: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOptions = async () => {
    try {
      const [resDivs, resCats] = await Promise.all([
        divisionApi.getAll(),
        categoryApi.getAll()
      ]);
      if (resDivs.success) setDivisionOptions(resDivs.data);
      if (resCats.success) setCategoryOptions(resCats.data);
    } catch (err) {
      console.error('Failed to fetch options', err);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAssets(filters);
      if (res.success) {
        setAssets(res.data);
        setSelectedIds(new Set());
        setSelectedAssets([]);
      }
    } catch (err) {
      setError('Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFilters({ division_code: '', category_code: '', asset_status: '' });
    setAssets([]);
    setSelectedIds(new Set());
    setSelectedAssets([]);
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(assets.map(a => a.asset_id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleGenerateLabels = () => {
    const filtered = assets.filter(a => selectedIds.has(a.asset_id));
    setSelectedAssets(filtered);
  };

  useEffect(() => {
    if (selectedAssets.length > 0 && window.JsBarcode) {
      selectedAssets.forEach(asset => {
        const value = asset.barcode || asset.asset_code;
        window.JsBarcode(`#barcode-${asset.asset_id}`, value, {
          format: "CODE128",
          width: 1.5,
          height: 40,
          displayValue: true,
          fontSize: 10
        });
      });
    }
  }, [selectedAssets]);

  const columns = [
    { 
      key: 'checkbox', 
      label: <input type="checkbox" onChange={handleSelectAll} checked={assets.length > 0 && selectedIds.size === assets.length} />, 
      width: '40px',
      render: (row) => <input type="checkbox" checked={selectedIds.has(row.asset_id)} onChange={() => handleSelectRow(row.asset_id)} />
    },
    { key: 'asset_code', label: 'Asset Code', width: '120px' },
    { key: 'asset_name', label: 'Asset Name', width: '200px' },
    { key: 'division_name', label: 'Division', width: '150px' },
    { key: 'category_name', label: 'Category', width: '150px' },
    { key: 'serial_number', label: 'Serial No', width: '150px' },
    { key: 'barcode', label: 'Barcode Value', width: '150px' }
  ];

  const tableData = assets.map(a => ({
    ...a,
    checkbox: selectedIds.has(a.asset_id) // used for render but handled by column.render
  }));

  return (
    <div className="report-container">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .label-grid { display: flex !important; flex-wrap: wrap !important; gap: 8px !important; }
          .barcode-label { 
            width: 200px !important; 
            height: 100px !important; 
            border: 1px solid #000 !important; 
            padding: 6px !important; 
            page-break-inside: avoid !important;
            margin-bottom: 5px !important;
          }
        }
        .label-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
        .barcode-label { 
          width: 200px; 
          height: 110px; 
          border: 1px solid #ccc; 
          padding: 8px; 
          background: #fff;
          font-family: Arial, sans-serif;
        }
        .label-name { font-weight: bold; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .label-code { font-size: 11px; color: #333; }
        .label-division { font-size: 10px; color: #666; margin-bottom: 4px; }
        .barcode-svg { width: 100%; height: auto; }
      `}</style>

      <div className="header no-print" style={{ marginBottom: '10px' }}>
        <div className="header-title">KSRTC — Asset Barcode Labels</div>
      </div>

      <div className="form-container no-print" style={{ marginBottom: '20px' }}>
        <div className="form-row">
          <FormField 
            label="Division" 
            type="select" 
            options={divisionOptions.map(d => ({ id: d.division_code, label: d.division_name }))}
            value={filters.division_code}
            onChange={(e) => setFilters({...filters, division_code: e.target.value})}
          />
          <FormField 
            label="Category" 
            type="select" 
            options={categoryOptions.map(c => ({ id: c.category_code, label: c.category_name }))}
            value={filters.category_code}
            onChange={(e) => setFilters({...filters, category_code: e.target.value})}
          />
          <FormField 
            label="Status" 
            type="select" 
            options={[
              { id: 'active', label: 'Active' },
              { id: 'disposed', label: 'Disposed' },
              { id: 'wip', label: 'WIP' }
            ]}
            value={filters.asset_status}
            onChange={(e) => setFilters({...filters, asset_status: e.target.value})}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button className="primary" onClick={handleSearch} disabled={loading}>Search Assets</button>
          <button className="secondary" onClick={handleClear}>Clear</button>
          <button className="secondary" onClick={() => window.print()} disabled={selectedAssets.length === 0}>Print Labels</button>
        </div>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '10px' }} className="no-print">{error}</div>}

      <div className="form-container no-print">
        <Table 
          columns={columns} 
          data={tableData} 
          renderCustomRow={(row, cols) => (
            <tr key={row.asset_id}>
              {cols.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          )}
        />
        <div style={{ marginTop: '10px' }}>
          <button className="primary" onClick={handleGenerateLabels} disabled={selectedIds.size === 0}>
            Generate Labels for Selected ({selectedIds.size})
          </button>
        </div>
      </div>

      <div className="label-grid">
        {selectedAssets.map(asset => (
          <div key={asset.asset_id} className="barcode-label">
            <div className="label-name" title={asset.asset_name}>{asset.asset_name}</div>
            <div className="label-code">{asset.asset_code}</div>
            <div className="label-division">{asset.division_name}</div>
            <svg id={`barcode-${asset.asset_id}`} className="barcode-svg"></svg>
          </div>
        ))}
      </div>
      
      {selectedAssets.length === 0 && assets.length > 0 && (
        <div style={{ marginTop: '20px', color: '#888', fontStyle: 'italic' }} className="no-print">
          Select assets above and click "Generate Labels" to see barcodes.
        </div>
      )}
    </div>
  );
};

export default AssetBarcode;
