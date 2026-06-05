import pool from '../../../config/db.js';
import { sendXlsx } from '../../../utils/xlsxExporter.js';

/**
 * Controller for Fixed Asset Summary XL Export
 */
export const exportXL = async (req, res, next) => {
  try {
    const { division_code, category_code, asset_status } = req.query;
    
    let query = `
      SELECT
        a.asset_code, a.asset_name, a.serial_number, a.manufacturer,
        a.purchase_date, a.purchase_cost, a.salvage_value,
        a.accumulated_depreciation, a.current_book_value,
        a.depreciation_method, a.asset_status,
        d.division_name, t.type_name, c.category_name,
        g.group_name, l.location_name
      FROM tbl_asset_master a
      LEFT JOIN tbl_asset_division_master d ON a.division_code = d.division_code
      LEFT JOIN tbl_asset_type_master t ON a.type_code = t.type_code
      LEFT JOIN tbl_asset_category_master c ON a.category_code = c.category_code
      LEFT JOIN tbl_asset_group_master g ON a.group_code = g.group_code
      LEFT JOIN tbl_location_area_master l ON a.location_code = l.location_code
      WHERE a.is_active = 1
    `;

    const params = [];
    if (division_code) { query += ' AND a.division_code = ?'; params.push(division_code); }
    if (category_code) { query += ' AND a.category_code = ?'; params.push(category_code); }
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
