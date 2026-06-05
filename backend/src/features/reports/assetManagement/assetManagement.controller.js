import pool from '../../../config/db.js';

/**
 * Controller for Asset Management Report
 */
export const getReport = async (req, res, next) => {
  try {
    const { division_code, asset_status, category_code } = req.query;
    
    let query = `
      SELECT
        a.asset_code, a.asset_name, a.asset_status,
        a.purchase_cost, a.current_book_value,
        d.division_name, c.category_name,
        (SELECT COUNT(*) FROM tbl_asset_transfer t WHERE t.asset_id = a.asset_id) AS transfer_count,
        (SELECT COUNT(*) FROM tbl_asset_branch_transfer bt WHERE bt.asset_id = a.asset_id) AS branch_transfer_count,
        (SELECT COUNT(*) FROM tbl_asset_change_wip w WHERE w.asset_id = a.asset_id) AS wip_count,
        (SELECT COUNT(*) FROM tbl_expiry_document_entry e WHERE e.asset_id = a.asset_id AND e.expiry_date >= CURDATE()) AS active_docs,
        (SELECT COUNT(*) FROM tbl_expiry_document_entry e WHERE e.asset_id = a.asset_id AND e.expiry_date < CURDATE()) AS expired_docs
      FROM tbl_asset_master a
      LEFT JOIN tbl_asset_division_master d ON a.division_code = d.division_code
      LEFT JOIN tbl_asset_category_master c ON a.category_code = c.category_code
      WHERE a.is_active = 1
    `;

    const params = [];
    if (division_code) {
      query += ' AND a.division_code = ?';
      params.push(division_code);
    }
    if (asset_status) {
      query += ' AND a.asset_status = ?';
      params.push(asset_status);
    }
    if (category_code) {
      query += ' AND a.category_code = ?';
      params.push(category_code);
    }

    query += ' ORDER BY a.asset_code';

    const [rows] = await pool.query(query, params);

    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};
