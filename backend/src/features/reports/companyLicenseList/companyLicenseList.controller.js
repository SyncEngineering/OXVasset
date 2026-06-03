import pool from '../../../config/db.js';
import { sendXlsx } from '../../../utils/xlsxExporter.js';

/**
 * Common query logic for Company License List
 */
const runQuery = async (filters) => {
  const { doc_type_id, is_active, expiry_status } = filters;
  
  let query = `
    SELECT cl.*, dt.doc_type_name,
      DATEDIFF(cl.expiry_date, CURDATE()) AS days_to_expiry
    FROM tbl_company_license_documents cl
    JOIN tbl_common_document_type dt ON cl.doc_type_id = dt.id
    WHERE 1=1
  `;

  const params = [];
  if (doc_type_id) { query += ' AND cl.doc_type_id = ?'; params.push(doc_type_id); }
  if (is_active !== undefined && is_active !== '') { query += ' AND cl.is_active = ?'; params.push(is_active); }
  
  if (expiry_status === 'expired') {
    query += ' AND DATEDIFF(cl.expiry_date, CURDATE()) < 0';
  } else if (expiry_status === 'upcoming') {
    query += ' AND DATEDIFF(cl.expiry_date, CURDATE()) BETWEEN 0 AND cl.alert_before_days';
  }

  query += ' ORDER BY cl.expiry_date ASC';

  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * Controller for Company License List Report (Screen)
 */
export const getReport = async (req, res, next) => {
  try {
    const rows = await runQuery(req.query);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for Company License List Report (XL Export)
 */
export const exportXL = async (req, res, next) => {
  try {
    const rows = await runQuery(req.query);

    const headers = [
      { key: 'entry_no', label: 'Entry No' },
      { key: 'doc_type_name', label: 'Document Type' },
      { key: 'document_name', label: 'Document Name' },
      { key: 'document_no', label: 'Document No' },
      { key: 'issue_date', label: 'Issue Date' },
      { key: 'expiry_date', label: 'Expiry Date' },
      { key: 'issuing_authority', label: 'Issuing Authority' },
      { key: 'alert_before_days', label: 'Alert Before (Days)' },
      { key: 'days_to_expiry', label: 'Days to Expiry' },
      { key: 'remarks', label: 'Remarks' }
    ];

    sendXlsx(res, rows, headers, 'Licenses', 'Company_License_List');
  } catch (error) {
    next(error);
  }
};
