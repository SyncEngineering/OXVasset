import pool from '../../../config/db.js';

/**
 * Controller for Common Document Type Master
 */
export const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_common_document_type ORDER BY doc_type_code DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_common_document_type WHERE doc_type_code = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { doc_type_name, description, is_mandatory } = req.body;
    const [result] = await pool.query(
      'INSERT INTO tbl_common_document_type (doc_type_name, description, is_mandatory, created_by) VALUES (?, ?, ?, ?)',
      [doc_type_name, description, is_mandatory ? 1 : 0, 'ADMIN']
    );
    res.status(201).json({ success: true, message: 'Created successfully', id: result.insertId });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { doc_type_name, description, is_mandatory, is_active } = req.body;
    const [result] = await pool.query(
      'UPDATE tbl_common_document_type SET doc_type_name = ?, description = ?, is_mandatory = ?, is_active = ?, updated_by = ? WHERE doc_type_code = ?',
      [doc_type_name, description, is_mandatory ? 1 : 0, is_active, 'ADMIN', req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const toggleActive = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT is_active FROM tbl_common_document_type WHERE doc_type_code = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    
    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query('UPDATE tbl_common_document_type SET is_active = ?, updated_by = ? WHERE doc_type_code = ?', [newStatus, 'ADMIN', req.params.id]);
    
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM tbl_common_document_type WHERE doc_type_code = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};
