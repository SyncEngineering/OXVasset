import pool from '../../../config/db.js';
import { generateDocNumber } from '../../../utils/sequenceGenerator.js';

/**
 * Controller for Asset Branch Transfer
 */
export const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT bt.*,
        a.asset_code, a.asset_name,
        fl.location_name AS from_location_name,
        tl.location_name AS to_location_name
      FROM tbl_asset_branch_transfer bt
      JOIN tbl_asset_master a ON bt.asset_id = a.asset_id
      LEFT JOIN tbl_location_area_master fl ON bt.from_location_code = fl.location_code
      LEFT JOIN tbl_location_area_master tl ON bt.to_location_code = tl.location_code
      ORDER BY bt.id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT bt.*,
        a.asset_code, a.asset_name,
        fl.location_name AS from_location_name,
        tl.location_name AS to_location_name
      FROM tbl_asset_branch_transfer bt
      JOIN tbl_asset_master a ON bt.asset_id = a.asset_id
      LEFT JOIN tbl_location_area_master fl ON bt.from_location_code = fl.location_code
      LEFT JOIN tbl_location_area_master tl ON bt.to_location_code = tl.location_code
      WHERE bt.id = ?
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
      SELECT asset_id AS id, asset_code, asset_name 
      FROM tbl_asset_master 
      WHERE is_active = 1 AND asset_status = 'active'
      ORDER BY asset_code
    `);
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

const VALID_BRANCH_TRANSFER_FIELDS = [
  'transfer_date', 'asset_id', 'from_branch', 'to_branch', 
  'from_location_code', 'to_location_code', 'reason', 'remarks'
];

const filterBranchTransferData = (data) => {
  const filtered = {};
  VALID_BRANCH_TRANSFER_FIELDS.forEach(field => {
    if (data[field] !== undefined) {
      filtered[field] = data[field] === '' ? null : data[field];
    }
  });
  return filtered;
};

export const create = async (req, res, next) => {
  try {
    const branch_transfer_no = await generateDocNumber(pool, 'BRANCH_TRANSFER');
    const sanitizedData = filterBranchTransferData(req.body);
    
    const [result] = await pool.query(
      'INSERT INTO tbl_asset_branch_transfer SET ?, branch_transfer_no = ?, status = "draft", created_by = "ADMIN"',
      [sanitizedData, branch_transfer_no]
    );
    
    res.status(201).json({ success: true, message: "Branch transfer entry created", id: result.insertId, branch_transfer_no });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sanitizedData = filterBranchTransferData(req.body);

    const [rows] = await pool.query('SELECT status FROM tbl_asset_branch_transfer WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    if (rows[0].status !== 'draft') return res.status(400).json({ success: false, message: 'Only draft entries can be edited' });

    await pool.query(
      'UPDATE tbl_asset_branch_transfer SET ?, updated_by = "ADMIN" WHERE id = ?',
      [sanitizedData, id]
    );
    
    res.json({ success: true, message: "Branch transfer entry updated" });
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

    const [rows] = await connection.query('SELECT * FROM tbl_asset_branch_transfer WHERE id = ?', [id]);
    if (rows.length === 0) throw new Error('Entry not found');
    const entry = rows[0];

    if (action === 'completed') {
      await connection.query(
        'UPDATE tbl_asset_branch_transfer SET status = "completed", approved_by = "ADMIN", approved_at = NOW(), updated_by = "ADMIN" WHERE id = ?',
        [id]
      );
      
      await connection.query(
        'UPDATE tbl_asset_master SET location_code = ?, updated_by = "ADMIN" WHERE asset_id = ?',
        [entry.to_location_code, entry.asset_id]
      );
    } else {
      await connection.query(
        'UPDATE tbl_asset_branch_transfer SET status = ?, updated_by = "ADMIN" WHERE id = ?',
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
