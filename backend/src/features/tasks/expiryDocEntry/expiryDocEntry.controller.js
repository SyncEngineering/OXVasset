import pool from '../../../config/db.js';
import { generateDocNumber } from '../../../utils/sequenceGenerator.js';
import { createUploader } from '../../../config/multerConfig.js';

export const upload = createUploader('expiry-docs');

/**
 * Controller for Expiry Document Entry
 */
export const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.*,
        a.asset_code, a.asset_name,
        dt.doc_type_name, dt.alert_before_days
      FROM tbl_expiry_document_entry e
      JOIN tbl_asset_master a ON e.asset_id = a.asset_id
      JOIN tbl_expiry_document_type dt ON e.expiry_doc_type_code = dt.expiry_doc_type_code
      ORDER BY e.expiry_date ASC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.*,
        a.asset_code, a.asset_name,
        dt.doc_type_name, dt.alert_before_days
      FROM tbl_expiry_document_entry e
      JOIN tbl_asset_master a ON e.asset_id = a.asset_id
      JOIN tbl_expiry_document_type dt ON e.expiry_doc_type_code = dt.expiry_doc_type_code
      WHERE e.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getAssetOptions = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT asset_id AS id, asset_code, asset_name FROM tbl_asset_master WHERE is_active = 1');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getDocTypeOptions = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT expiry_doc_type_code AS id, doc_type_name AS name, alert_before_days FROM tbl_expiry_document_type WHERE is_active = 1');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const entry_no = await generateDocNumber(pool, 'EXPIRY_DOC');
    const data = { ...req.body };
    
    if (req.file) {
      data.file_path = req.file.path.replace(/\\/g, '/'); // Normalize path
    }

    const [result] = await pool.query(
      'INSERT INTO tbl_expiry_document_entry SET ?, entry_no = ?, created_by = "ADMIN"',
      [data, entry_no]
    );
    
    res.status(201).json({ success: true, message: "Document entry created", id: result.insertId, entry_no });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    
    if (req.file) {
      data.file_path = req.file.path.replace(/\\/g, '/');
    }

    const [result] = await pool.query(
      'UPDATE tbl_expiry_document_entry SET ?, updated_by = "ADMIN" WHERE id = ?',
      [data, id]
    );
    
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: "Document entry updated" });
  } catch (error) {
    next(error);
  }
};

export const toggleActive = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT is_active FROM tbl_expiry_document_entry WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    
    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query('UPDATE tbl_expiry_document_entry SET is_active = ?, updated_by = "ADMIN" WHERE id = ?', [newStatus, req.params.id]);
    
    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    next(error);
  }
};
