import pool from '../../../config/db.js';

/**
 * Controller for Vehicle Odometer Reset
 */
export const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.*, a.asset_code, a.asset_name
      FROM tbl_vehicle_odometer_reset o
      JOIN tbl_asset_master a ON o.asset_id = a.id
      ORDER BY o.id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getAssetOptions = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, asset_code, asset_name 
      FROM tbl_asset_master 
      WHERE asset_status = 'active' AND is_active = 1
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { asset_id, reset_date, previous_reading, new_reading, reason } = req.body;
    
    if (new_reading < 0 || previous_reading < 0) {
      return res.status(400).json({ success: false, message: 'Readings cannot be negative' });
    }

    const [result] = await pool.query(
      'INSERT INTO tbl_vehicle_odometer_reset (asset_id, reset_date, previous_reading, new_reading, reason, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [asset_id, reset_date, previous_reading, new_reading, reason, 'ADMIN']
    );
    
    res.status(201).json({ success: true, message: 'Odometer reset recorded', id: result.insertId });
  } catch (error) {
    next(error);
  }
};
