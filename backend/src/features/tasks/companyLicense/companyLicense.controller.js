import pool from '../../../config/db.js';
import { generateDocNumber } from '../../../utils/sequenceGenerator.js';
import { createUploader } from '../../../config/multerConfig.js';

export const upload = createUploader('company-licenses');

/**
 * Controller for Company License Documents
 */
export const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT cl.*, dt.doc_type_name
      FROM tbl_company_license_documents cl
      JOIN tbl_common_document_type dt ON cl.doc_type_id = dt.id
      ORDER BY cl.expiry_date ASC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT cl.*, dt.doc_type_name
      FROM tbl_company_license_documents cl
      JOIN tbl_common_document_type dt ON cl.doc_type_id = dt.id
      WHERE cl.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getDocTypeOptions = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, doc_type_name AS name FROM tbl_common_document_type WHERE is_active = 1');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const entry_no = await generateDocNumber(pool, 'COMPANY_LICENSE');
    const data = { ...req.body };
    
    if (req.file) {
      data.file_path = req.file.path.replace(/\\/g, '/');
    }

    const [result] = await pool.query(
      'INSERT INTO tbl_company_license_documents SET ?, entry_no = ?, created_by = "ADMIN"',
      [data, entry_no]
    );
    
    res.status(201).json({ success: true, message: "License entry created", id: result.insertId, entry_no });
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
      'UPDATE tbl_company_license_documents SET ?, updated_by = "ADMIN" WHERE id = ?',
      [data, id]
    );
    
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: "License entry updated" });
  } catch (error) {
    next(error);
  }
};

export const toggleActive = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT is_active FROM tbl_company_license_documents WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    
    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query('UPDATE tbl_company_license_documents SET is_active = ?, updated_by = "ADMIN" WHERE id = ?', [newStatus, req.params.id]);
    
    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    next(error);
  }
};
