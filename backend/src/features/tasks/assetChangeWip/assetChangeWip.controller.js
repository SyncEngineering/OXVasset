import pool from '../../../config/db.js';

/**
 * Controller for Asset Change WIP
 */
export const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT w.*, a.asset_code, a.asset_name
      FROM tbl_asset_change_wip w
      JOIN tbl_asset_master a ON w.asset_id = a.id
      ORDER BY w.id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT w.*, a.asset_code, a.asset_name
      FROM tbl_asset_change_wip w
      JOIN tbl_asset_master a ON w.asset_id = a.id
      WHERE w.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getAssetOptions = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, asset_code, asset_name FROM tbl_asset_master WHERE is_active = 1 ORDER BY asset_code');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { asset_id, change_date, change_type, old_value, new_value, cost_incurred, remarks } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO tbl_asset_change_wip (asset_id, change_date, change_type, old_value, new_value, cost_incurred, remarks, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [asset_id, change_date, change_type, old_value, new_value, cost_incurred || 0, remarks, 'ADMIN']
    );
    
    res.status(201).json({ success: true, message: "WIP entry created", id: result.insertId });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { change_date, change_type, old_value, new_value, cost_incurred, remarks } = req.body;

    // Check status before update
    const [rows] = await pool.query('SELECT status FROM tbl_asset_change_wip WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Entry not found' });
    
    if (rows[0].status !== 'pending') {
      return res.status(400).json({ success: false, message: "Only pending entries can be edited" });
    }

    const [result] = await pool.query(
      'UPDATE tbl_asset_change_wip SET change_date = ?, change_type = ?, old_value = ?, new_value = ?, cost_incurred = ?, remarks = ?, updated_by = ? WHERE id = ?',
      [change_date, change_type, old_value, new_value, cost_incurred || 0, remarks, 'ADMIN', id]
    );
    
    res.json({ success: true, message: "WIP entry updated" });
  } catch (error) {
    next(error);
  }
};

export const approve = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    const [result] = await pool.query(
      'UPDATE tbl_asset_change_wip SET status = ?, approved_by = "ADMIN", approved_at = NOW(), updated_by = "ADMIN" WHERE id = ? AND status = "pending"',
      [action, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ success: false, message: "Entry not found or already processed" });
    }

    res.json({ success: true, message: `Entry ${action}` });
  } catch (error) {
    next(error);
  }
};
