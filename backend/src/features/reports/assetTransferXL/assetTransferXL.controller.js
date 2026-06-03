import pool from '../../../config/db.js';
import { sendXlsx } from '../../../utils/xlsxExporter.js';

/**
 * Controller for Asset Transfer XL Export
 */
export const exportXL = async (req, res, next) => {
  try {
    const { from_date, to_date, status } = req.query;
    
    let query = `
      SELECT
        t.transfer_no, t.transfer_date, t.status,
        a.asset_code, a.asset_name,
        fd.division_name AS from_division,
        td.division_name AS to_division,
        fl.location_name AS from_location,
        tl.location_name AS to_location,
        t.reason, t.approved_by, t.approved_at
      FROM tbl_asset_transfer t
      JOIN tbl_asset_master a ON t.asset_id = a.id
      LEFT JOIN tbl_asset_division_master fd ON t.from_division_id = fd.id
      LEFT JOIN tbl_asset_division_master td ON t.to_division_id = td.id
      LEFT JOIN tbl_location_area_master fl ON t.from_location_id = fl.id
      LEFT JOIN tbl_location_area_master tl ON t.to_location_id = tl.id
      WHERE 1=1
    `;

    const params = [];
    if (from_date) { query += ' AND t.transfer_date >= ?'; params.push(from_date); }
    if (to_date) { query += ' AND t.transfer_date <= ?'; params.push(to_date); }
    if (status) { query += ' AND t.status = ?'; params.push(status); }

    query += ' ORDER BY t.transfer_date DESC';

    const [rows] = await pool.query(query, params);

    const headers = [
      { key: 'transfer_no', label: 'Transfer No' },
      { key: 'transfer_date', label: 'Transfer Date' },
      { key: 'asset_code', label: 'Asset Code' },
      { key: 'asset_name', label: 'Asset Name' },
      { key: 'from_division', label: 'From Division' },
      { key: 'to_division', label: 'To Division' },
      { key: 'from_location', label: 'From Location' },
      { key: 'to_location', label: 'To Location' },
      { key: 'status', label: 'Status' },
      { key: 'reason', label: 'Reason' },
      { key: 'approved_by', label: 'Approved By' },
      { key: 'approved_at', label: 'Approved At' }
    ];

    sendXlsx(res, rows, headers, 'Asset Transfers', 'Asset_Transfers');
  } catch (error) {
    next(error);
  }
};
