import db from '../../../config/db.js';

/**
 * Controller for Expiry Document List consolidated report.
 */
export const getReport = async (req, res, next) => {
  try {
    const { asset_id, expiry_doc_type_code, expiry_status, from_date, to_date } = req.query;

    let query = `
      SELECT 
        e.entry_no, e.document_no, e.issue_date, e.expiry_date,
        e.issuing_authority, e.remarks, e.is_active,
        e.alert_sent,
        a.asset_code, a.asset_name,
        d.division_name,
        dt.doc_type_name, dt.alert_before_days,
        DATEDIFF(e.expiry_date, CURDATE()) AS days_to_expiry
      FROM tbl_expiry_document_entry e
      JOIN tbl_asset_master a ON e.asset_id = a.asset_id
      LEFT JOIN tbl_asset_division_master d ON a.division_code = d.division_code
      JOIN tbl_expiry_document_type dt ON e.expiry_doc_type_code = dt.expiry_doc_type_code
      WHERE e.is_active = 1
    `;
    const params = [];

    if (asset_id) {
      query += ` AND e.asset_id = ?`;
      params.push(asset_id);
    }
    if (expiry_doc_type_code) {
      query += ` AND e.expiry_doc_type_code = ?`;
      params.push(expiry_doc_type_code);
    }
    if (from_date) {
      query += ` AND e.expiry_date >= ?`;
      params.push(from_date);
    }
    if (to_date) {
      query += ` AND e.expiry_date <= ?`;
      params.push(to_date);
    }

    if (expiry_status === 'expired') {
      query += ` AND DATEDIFF(e.expiry_date, CURDATE()) < 0`;
    } else if (expiry_status === 'upcoming') {
      query += ` AND DATEDIFF(e.expiry_date, CURDATE()) BETWEEN 0 AND dt.alert_before_days`;
    } else if (expiry_status === 'valid') {
      query += ` AND DATEDIFF(e.expiry_date, CURDATE()) > dt.alert_before_days`;
    }

    query += ` ORDER BY e.expiry_date ASC`;

    const [rows] = await db.execute(query, params);

    const summary = {
      total: rows.length,
      expired: rows.filter(r => r.days_to_expiry < 0).length,
      upcoming: rows.filter(r => r.days_to_expiry >= 0 && r.days_to_expiry <= r.alert_before_days).length,
      valid: rows.filter(r => r.days_to_expiry > r.alert_before_days).length
    };

    res.json({
      success: true,
      data: rows,
      summary
    });
  } catch (error) {
    next(error);
  }
};
