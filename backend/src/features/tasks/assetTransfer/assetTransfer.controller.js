import pool from '../../../config/db.js';
import { generateDocNumber } from '../../../utils/sequenceGenerator.js';

/**
 * Controller for Asset Transfer (Division to Division)
 */
export const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*,
        a.asset_code, a.asset_name,
        fd.division_name AS from_division_name,
        td.division_name AS to_division_name,
        fl.location_name AS from_location_name,
        tl.location_name AS to_location_name
      FROM tbl_asset_transfer t
      JOIN tbl_asset_master a ON t.asset_id = a.asset_id
      LEFT JOIN tbl_asset_division_master fd ON t.from_division_code = fd.division_code
      LEFT JOIN tbl_asset_division_master td ON t.to_division_code = td.division_code
      LEFT JOIN tbl_location_area_master fl ON t.from_location_code = fl.location_code
      LEFT JOIN tbl_location_area_master tl ON t.to_location_code = tl.location_code
      ORDER BY t.id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*,
        a.asset_code, a.asset_name,
        fd.division_name AS from_division_name,
        td.division_name AS to_division_name,
        fl.location_name AS from_location_name,
        tl.location_name AS to_location_name
      FROM tbl_asset_transfer t
      JOIN tbl_asset_master a ON t.asset_id = a.asset_id
      LEFT JOIN tbl_asset_division_master fd ON t.from_division_code = fd.division_code
      LEFT JOIN tbl_asset_division_master td ON t.to_division_code = td.division_code
      LEFT JOIN tbl_location_area_master fl ON t.from_location_code = fl.location_code
      LEFT JOIN tbl_location_area_master tl ON t.to_location_code = tl.location_code
      WHERE t.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getAssetOptions = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT asset_id AS id, asset_code, asset_name, division_code, location_code,
        (SELECT division_name FROM tbl_asset_division_master WHERE division_code = a.division_code) as division_name,
        (SELECT location_name FROM tbl_location_area_master WHERE location_code = a.location_code) as location_name
      FROM tbl_asset_master a
      WHERE is_active = 1 AND asset_status = 'active'
      ORDER BY asset_code
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getDivisionOptions = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT division_code AS id, division_name AS name FROM tbl_asset_division_master WHERE is_active = 1');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getLocationOptions = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT location_code AS id, location_name AS name FROM tbl_location_area_master WHERE is_active = 1');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

const VALID_TRANSFER_FIELDS = [
  'transfer_date', 'asset_id', 'from_division_code', 'to_division_code', 
  'from_location_code', 'to_location_code', 'reason', 'remarks'
];

const filterTransferData = (data) => {
  const filtered = {};
  VALID_TRANSFER_FIELDS.forEach(field => {
    if (data[field] !== undefined) {
      filtered[field] = data[field] === '' ? null : data[field];
    }
  });
  return filtered;
};

export const create = async (req, res, next) => {
  try {
    const transfer_no = await generateDocNumber(pool, 'TRANSFER');
    const sanitizedData = filterTransferData(req.body);
    
    const [result] = await pool.query(
      'INSERT INTO tbl_asset_transfer SET ?, transfer_no = ?, status = "draft", created_by = "ADMIN"',
      [sanitizedData, transfer_no]
    );
    
    res.status(201).json({ success: true, message: "Transfer entry created", id: result.insertId, transfer_no });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sanitizedData = filterTransferData(req.body);

    const [rows] = await pool.query('SELECT status FROM tbl_asset_transfer WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    if (rows[0].status !== 'draft') return res.status(400).json({ success: false, message: 'Only draft entries can be edited' });

    await pool.query(
      'UPDATE tbl_asset_transfer SET ?, updated_by = "ADMIN" WHERE id = ?',
      [sanitizedData, id]
    );
    
    res.json({ success: true, message: "Transfer entry updated" });
  } catch (error) {
    next(error);
  }
};

export const approve = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { action } = req.body; // 'approved', 'completed', 'rejected'

    const [rows] = await connection.query('SELECT * FROM tbl_asset_transfer WHERE id = ?', [id]);
    if (rows.length === 0) throw new Error('Entry not found');
    const entry = rows[0];

    if (action === 'completed') {
      if (entry.status !== 'approved' && entry.status !== 'draft') throw new Error('Entry must be approved or draft to complete');

      await connection.query(
        'UPDATE tbl_asset_transfer SET status = "completed", approved_by = "ADMIN", approved_at = NOW(), updated_by = "ADMIN" WHERE id = ?',
        [id]
      );
      
      await connection.query(
        'UPDATE tbl_asset_master SET division_code = ?, location_code = ?, asset_status = "transferred", updated_by = "ADMIN" WHERE asset_id = ?',
        [entry.to_division_code, entry.to_location_code, entry.asset_id]
      );
    } else {
      await connection.query(
        'UPDATE tbl_asset_transfer SET status = ?, updated_by = "ADMIN" WHERE id = ?',
        [action, id]
      );
    }

    await connection.commit();
    res.json({ success: true, message: `Entry ${action}` });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};
