import pool from '../../../config/db.js';

/**
 * Controller for Asset Sub Group Master
 */
export const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT sg.*, g.group_name AS parent_name
      FROM tbl_asset_sub_group_master sg
      JOIN tbl_asset_group_master g ON sg.group_id = g.id
      ORDER BY sg.id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT sg.*, g.group_name AS parent_name
      FROM tbl_asset_sub_group_master sg
      JOIN tbl_asset_group_master g ON sg.group_id = g.id
      WHERE sg.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getParentOptions = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, group_name AS name FROM tbl_asset_group_master WHERE is_active = 1');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { sub_group_code, sub_group_name, group_id, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO tbl_asset_sub_group_master (sub_group_code, sub_group_name, group_id, description, created_by) VALUES (?, ?, ?, ?, ?)',
      [sub_group_code, sub_group_name, group_id, description, 'ADMIN']
    );
    res.status(201).json({ success: true, message: 'Created successfully', id: result.insertId });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { sub_group_code, sub_group_name, group_id, description, is_active } = req.body;
    const [result] = await pool.query(
      'UPDATE tbl_asset_sub_group_master SET sub_group_code = ?, sub_group_name = ?, group_id = ?, description = ?, is_active = ?, updated_by = ? WHERE id = ?',
      [sub_group_code, sub_group_name, group_id, description, is_active, 'ADMIN', req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const toggleActive = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT is_active FROM tbl_asset_sub_group_master WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    
    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query('UPDATE tbl_asset_sub_group_master SET is_active = ?, updated_by = ? WHERE id = ?', [newStatus, 'ADMIN', req.params.id]);
    
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    next(error);
  }
};
