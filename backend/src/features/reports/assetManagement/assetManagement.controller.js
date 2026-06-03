import pool from '../../../config/db.js';

/**
 * Controller for Asset Management Report
 */
export const getReport = async (req, res, next) => {
  try {
    const { division_id, asset_status, category_id } = req.query;
    
    let query = `
      SELECT
        a.asset_code, a.asset_name, a.asset_status,
        a.purchase_cost, a.current_book_value,
        d.division_name, c.category_name,
        (SELECT COUNT(*) FROM tbl_asset_transfer t WHERE t.asset_id = a.id) AS transfer_count,
        (SELECT COUNT(*) FROM tbl_asset_branch_transfer bt WHERE bt.asset_id = a.id) AS branch_transfer_count,
        (SELECT COUNT(*) FROM tbl_asset_change_wip w WHERE w.asset_id = a.id) AS wip_count,
        (SELECT COUNT(*) FROM tbl_expiry_document_entry e WHERE e.asset_id = a.id AND e.expiry_date >= CURDATE()) AS active_docs,
        (SELECT COUNT(*) FROM tbl_expiry_document_entry e WHERE e.asset_id = a.id AND e.expiry_date < CURDATE()) AS expired_docs
      FROM tbl_asset_master a
      LEFT JOIN tbl_asset_division_master d ON a.division_id = d.id
      LEFT JOIN tbl_asset_category_master c ON a.category_id = c.id
      WHERE a.is_active = 1
    `;

    const params = [];
    if (division_id) {
      query += ' AND a.division_id = ?';
      params.push(division_id);
    }
    if (asset_status) {
      query += ' AND a.asset_status = ?';
      params.push(asset_status);
    }
    if (category_id) {
      query += ' AND a.category_id = ?';
      params.push(category_id);
    }

    query += ' ORDER BY a.asset_code';

    const [rows] = await pool.query(query, params);

    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};
