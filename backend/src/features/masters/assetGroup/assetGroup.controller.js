import pool from '../../../config/db.js';

/**
 * Controller for Asset Group Master
 */
export const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT g.*, c.category_name AS parent_name
      FROM tbl_asset_group_master g
      JOIN tbl_asset_category_master c ON g.category_code = c.category_code
      ORDER BY g.group_code DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT g.*, c.category_name AS parent_name
      FROM tbl_asset_group_master g
      JOIN tbl_asset_category_master c ON g.category_code = c.category_code
      WHERE g.group_code = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getParentOptions = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT category_code AS id, category_name AS name FROM tbl_asset_category_master WHERE is_active = 1');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { group_name, category_code, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO tbl_asset_group_master (group_name, category_code, description, created_by) VALUES (?, ?, ?, ?)',
      [group_name, category_code, description, 'ADMIN']
    );
    res.status(201).json({ success: true, message: 'Created successfully', id: result.insertId });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { group_name, category_code, description, is_active } = req.body;
    const [result] = await pool.query(
      'UPDATE tbl_asset_group_master SET group_name = ?, category_code = ?, description = ?, is_active = ?, updated_by = ? WHERE group_code = ?',
      [group_name, category_code, description, is_active, 'ADMIN', req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const toggleActive = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT is_active FROM tbl_asset_group_master WHERE group_code = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    
    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query('UPDATE tbl_asset_group_master SET is_active = ?, updated_by = ? WHERE group_code = ?', [newStatus, 'ADMIN', req.params.id]);
    
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM tbl_asset_group_master WHERE group_code = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};
