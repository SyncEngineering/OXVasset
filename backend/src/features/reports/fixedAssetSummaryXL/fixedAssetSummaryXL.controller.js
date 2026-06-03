import pool from '../../../config/db.js';
import { sendXlsx } from '../../../utils/xlsxExporter.js';

/**
 * Controller for Fixed Asset Summary XL Export
 */
export const exportXL = async (req, res, next) => {
  try {
    const { division_id, category_id, asset_status } = req.query;
    
    let query = `
      SELECT
        a.asset_code, a.asset_name, a.serial_number, a.manufacturer,
        a.purchase_date, a.purchase_cost, a.salvage_value,
        a.accumulated_depreciation, a.current_book_value,
        a.depreciation_method, a.asset_status,
        d.division_name, t.type_name, c.category_name,
        g.group_name, l.location_name
      FROM tbl_asset_master a
      LEFT JOIN tbl_asset_division_master d ON a.division_id = d.id
      LEFT JOIN tbl_asset_type_master t ON a.asset_type_id = t.id
      LEFT JOIN tbl_asset_category_master c ON a.category_id = c.id
      LEFT JOIN tbl_asset_group_master g ON a.group_id = g.id
      LEFT JOIN tbl_location_area_master l ON a.location_id = l.id
      WHERE a.is_active = 1
    `;

    const params = [];
    if (division_id) { query += ' AND a.division_id = ?'; params.push(division_id); }
    if (category_id) { query += ' AND a.category_id = ?'; params.push(category_id); }
    if (asset_status) { query += ' AND a.asset_status = ?'; params.push(asset_status); }

    query += ' ORDER BY a.asset_code';

    const [rows] = await pool.query(query, params);

    const headers = [
      { key: 'asset_code', label: 'Asset Code' },
      { key: 'asset_name', label: 'Asset Name' },
      { key: 'serial_number', label: 'Serial No' },
      { key: 'manufacturer', label: 'Manufacturer' },
      { key: 'division_name', label: 'Division' },
      { key: 'category_name', label: 'Category' },
      { key: 'type_name', label: 'Type' },
      { key: 'location_name', label: 'Location' },
      { key: 'purchase_date', label: 'Purchase Date' },
      { key: 'purchase_cost', label: 'Purchase Cost' },
      { key: 'salvage_value', label: 'Salvage Value' },
      { key: 'accumulated_depreciation', label: 'Accumulated Depreciation' },
      { key: 'current_book_value', label: 'Current Book Value' },
      { key: 'depreciation_method', label: 'Depreciation Method' },
      { key: 'asset_status', label: 'Status' }
    ];

    sendXlsx(res, rows, headers, 'Fixed Assets', 'Fixed_Asset_Summary');
  } catch (error) {
    next(error);
  }
};
