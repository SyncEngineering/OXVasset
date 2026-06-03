import pool from '../../../config/db.js';

/**
 * Controller for Fixed Asset List Report
 */
export const getReport = async (req, res, next) => {
  try {
    const { division_id, category_id, asset_status, from_date, to_date } = req.query;
    
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
    if (division_id) {
      query += ' AND a.division_id = ?';
      params.push(division_id);
    }
    if (category_id) {
      query += ' AND a.category_id = ?';
      params.push(category_id);
    }
    if (asset_status) {
      query += ' AND a.asset_status = ?';
      params.push(asset_status);
    }
    if (from_date) {
      query += ' AND a.purchase_date >= ?';
      params.push(from_date);
    }
    if (to_date) {
      query += ' AND a.purchase_date <= ?';
      params.push(to_date);
    }

    query += ' ORDER BY a.asset_code';

    const [rows] = await pool.query(query, params);

    const summary = {
      total_assets: rows.length,
      total_purchase_cost: rows.reduce((sum, r) => sum + parseFloat(r.purchase_cost || 0), 0),
      total_accumulated_depreciation: rows.reduce((sum, r) => sum + parseFloat(r.accumulated_depreciation || 0), 0),
      total_current_book_value: rows.reduce((sum, r) => sum + parseFloat(r.current_book_value || 0), 0)
    };

    res.json({ success: true, data: rows, summary });
  } catch (error) {
    next(error);
  }
};
