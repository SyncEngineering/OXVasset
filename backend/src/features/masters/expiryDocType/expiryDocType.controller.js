import pool from '../../../config/db.js';

/**
 * Controller for Expiry Document Type Master
 */
export const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_expiry_document_type ORDER BY expiry_doc_type_code DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_expiry_document_type WHERE expiry_doc_type_code = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { doc_type_name, description, alert_before_days } = req.body;
    const [result] = await pool.query(
      'INSERT INTO tbl_expiry_document_type (doc_type_name, description, alert_before_days, created_by) VALUES (?, ?, ?, ?)',
      [doc_type_name, description, alert_before_days || 30, 'ADMIN']
    );
    res.status(201).json({ success: true, message: 'Created successfully', id: result.insertId });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { doc_type_name, description, alert_before_days, is_active } = req.body;
    const [result] = await pool.query(
      `UPDATE tbl_expiry_document_type SET 
        doc_type_name = ?, 
        description = ?, 
        alert_before_days = ?, 
        is_active = ?, 
        updated_by = ? 
      WHERE expiry_doc_type_code = ?`,
      [doc_type_name, description, alert_before_days, is_active, 'ADMIN', req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const toggleActive = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT is_active FROM tbl_expiry_document_type WHERE expiry_doc_type_code = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    
    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query('UPDATE tbl_expiry_document_type SET is_active = ?, updated_by = ? WHERE expiry_doc_type_code = ?', [newStatus, 'ADMIN', req.params.id]);
    
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM tbl_expiry_document_type WHERE expiry_doc_type_code = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};
