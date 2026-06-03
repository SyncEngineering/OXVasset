import pool from '../../../config/db.js';

/**
 * Controller for Asset Group Master
 */
export const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT g.*, c.category_name AS parent_name
      FROM tbl_asset_group_master g
      JOIN tbl_asset_category_master c ON g.category_id = c.id
      ORDER BY g.id DESC
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
      JOIN tbl_asset_category_master c ON g.category_id = c.id
      WHERE g.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getParentOptions = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, category_name AS name FROM tbl_asset_category_master WHERE is_active = 1');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { group_code, group_name, category_id, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO tbl_asset_group_master (group_code, group_name, category_id, description, created_by) VALUES (?, ?, ?, ?, ?)',
      [group_code, group_name, category_id, description, 'ADMIN']
    );
    res.status(201).json({ success: true, message: 'Created successfully', id: result.insertId });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { group_code, group_name, category_id, description, is_active } = req.body;
    const [result] = await pool.query(
      'UPDATE tbl_asset_group_master SET group_code = ?, group_name = ?, category_id = ?, description = ?, is_active = ?, updated_by = ? WHERE id = ?',
      [group_code, group_name, category_id, description, is_active, 'ADMIN', req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const toggleActive = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT is_active FROM tbl_asset_group_master WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    
    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query('UPDATE tbl_asset_group_master SET is_active = ?, updated_by = ? WHERE id = ?', [newStatus, 'ADMIN', req.params.id]);
    
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    next(error);
  }
};
