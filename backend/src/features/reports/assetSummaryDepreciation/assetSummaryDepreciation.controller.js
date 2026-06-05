import pool from '../../../config/db.js';

/**
 * Controller for Asset Summary Included Depreciation Report
 */
export const getReport = async (req, res, next) => {
  try {
    const { asset_id, from_date, to_date, status } = req.query;
    
    let query = `
      SELECT
        a.asset_code, a.asset_name, a.purchase_cost, a.current_book_value,
        COUNT(d.id) AS total_entries,
        SUM(CASE WHEN d.status = 'posted' THEN d.depreciation_amount ELSE 0 END) AS total_posted_depreciation,
        SUM(CASE WHEN d.status = 'reversed' THEN d.depreciation_amount ELSE 0 END) AS total_reversed,
        MIN(d.period_from) AS earliest_period,
        MAX(d.period_to) AS latest_period
      FROM tbl_asset_master a
      LEFT JOIN tbl_depreciation_entry d ON a.asset_id = d.asset_id
    `;

    const conditions = ['a.is_active = 1'];
    const params = [];

    if (from_date) {
      conditions.push('d.entry_date >= ?');
      params.push(from_date);
    }
    if (to_date) {
      conditions.push('d.entry_date <= ?');
      params.push(to_date);
    }
    if (status && status !== 'all') {
      conditions.push('d.status = ?');
      params.push(status);
    }

    if (asset_id) {
      conditions.push('a.asset_id = ?');
      params.push(asset_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY a.asset_id, a.asset_code, a.asset_name, a.purchase_cost, a.current_book_value';
    query += ' ORDER BY a.asset_code';

    const [rows] = await pool.query(query, params);

    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};
