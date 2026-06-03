import pool from '../../../config/db.js';

/**
 * Controller for Asset Type Master
 */
export const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_asset_type_master ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_asset_type_master WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { type_code, type_name, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO tbl_asset_type_master (type_code, type_name, description, created_by) VALUES (?, ?, ?, ?)',
      [type_code, type_name, description, 'ADMIN']
    );
    res.status(201).json({ success: true, message: 'Created successfully', id: result.insertId });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { type_code, type_name, description, is_active } = req.body;
    const [result] = await pool.query(
      'UPDATE tbl_asset_type_master SET type_code = ?, type_name = ?, description = ?, is_active = ?, updated_by = ? WHERE id = ?',
      [type_code, type_name, description, is_active, 'ADMIN', req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const toggleActive = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT is_active FROM tbl_asset_type_master WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    
    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query('UPDATE tbl_asset_type_master SET is_active = ?, updated_by = ? WHERE id = ?', [newStatus, 'ADMIN', req.params.id]);
    
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    next(error);
  }
};
