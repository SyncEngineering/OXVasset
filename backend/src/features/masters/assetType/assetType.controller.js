import pool from '../../../config/db.js';

/**
 * Controller for Asset Type Master
 */
export const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_asset_type_master ORDER BY type_code DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_asset_type_master WHERE type_code = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { 
      type_prefix, 
      type_name, 
      fuel_distance, 
      jobcard_control_type, 
      doc_expiry_visible_yn, 
      trailer_trip_calc_base_weight, 
      trip_applicable_yn, 
      asset_single_unit_yn,
      description 
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO tbl_asset_type_master 
      (type_prefix, type_name, fuel_distance, jobcard_control_type, doc_expiry_visible_yn, 
       trailer_trip_calc_base_weight, trip_applicable_yn, asset_single_unit_yn, description, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        type_prefix, 
        type_name, 
        fuel_distance || 0, 
        jobcard_control_type || 'Workshop(Movable)', 
        doc_expiry_visible_yn ?? 1, 
        trailer_trip_calc_base_weight || 0, 
        trip_applicable_yn ?? 0, 
        asset_single_unit_yn ?? 1, 
        description, 
        'ADMIN'
      ]
    );
    res.status(201).json({ success: true, message: 'Created successfully', id: result.insertId });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { 
      type_prefix, 
      type_name, 
      fuel_distance, 
      jobcard_control_type, 
      doc_expiry_visible_yn, 
      trailer_trip_calc_base_weight, 
      trip_applicable_yn, 
      asset_single_unit_yn,
      description, 
      is_active 
    } = req.body;

    const [result] = await pool.query(
      `UPDATE tbl_asset_type_master SET 
        type_prefix = ?, 
        type_name = ?, 
        fuel_distance = ?, 
        jobcard_control_type = ?, 
        doc_expiry_visible_yn = ?, 
        trailer_trip_calc_base_weight = ?, 
        trip_applicable_yn = ?, 
        asset_single_unit_yn = ?, 
        description = ?, 
        is_active = ?, 
        updated_by = ? 
      WHERE type_code = ?`,
      [
        type_prefix, 
        type_name, 
        fuel_distance, 
        jobcard_control_type, 
        doc_expiry_visible_yn, 
        trailer_trip_calc_base_weight, 
        trip_applicable_yn, 
        asset_single_unit_yn, 
        description, 
        is_active, 
        'ADMIN', 
        req.params.id
      ]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const toggleActive = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT is_active FROM tbl_asset_type_master WHERE type_code = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    
    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query('UPDATE tbl_asset_type_master SET is_active = ?, updated_by = ? WHERE type_code = ?', [newStatus, 'ADMIN', req.params.id]);
    
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM tbl_asset_type_master WHERE type_code = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};
