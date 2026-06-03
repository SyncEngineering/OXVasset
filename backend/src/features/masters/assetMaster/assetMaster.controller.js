import pool from '../../../config/db.js';

/**
 * Controller for Asset Master
 */
export const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        a.*,
        d.division_name,
        t.type_name,
        st.sub_type_name,
        c.category_name,
        g.group_name,
        sg.sub_group_name,
        l.location_name
      FROM tbl_asset_master a
      LEFT JOIN tbl_asset_division_master d ON a.division_id = d.id
      LEFT JOIN tbl_asset_type_master t ON a.asset_type_id = t.id
      LEFT JOIN tbl_asset_sub_type_master st ON a.asset_sub_type_id = st.id
      LEFT JOIN tbl_asset_category_master c ON a.category_id = c.id
      LEFT JOIN tbl_asset_group_master g ON a.group_id = g.id
      LEFT JOIN tbl_asset_sub_group_master sg ON a.sub_group_id = sg.id
      LEFT JOIN tbl_location_area_master l ON a.location_id = l.id
      ORDER BY a.id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        a.*,
        d.division_name,
        t.type_name,
        st.sub_type_name,
        c.category_name,
        g.group_name,
        sg.sub_group_name,
        l.location_name
      FROM tbl_asset_master a
      LEFT JOIN tbl_asset_division_master d ON a.division_id = d.id
      LEFT JOIN tbl_asset_type_master t ON a.asset_type_id = t.id
      LEFT JOIN tbl_asset_sub_type_master st ON a.asset_sub_type_id = st.id
      LEFT JOIN tbl_asset_category_master c ON a.category_id = c.id
      LEFT JOIN tbl_asset_group_master g ON a.group_id = g.id
      LEFT JOIN tbl_asset_sub_group_master sg ON a.sub_group_id = sg.id
      LEFT JOIN tbl_location_area_master l ON a.location_id = l.id
      WHERE a.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getDropdownOptions = async (req, res, next) => {
  try {
    const [divisions] = await pool.query('SELECT id, division_name AS label FROM tbl_asset_division_master WHERE is_active = 1');
    const [assetTypes] = await pool.query('SELECT id, type_name AS label FROM tbl_asset_type_master WHERE is_active = 1');
    const [assetSubTypes] = await pool.query('SELECT id, sub_type_name AS label, asset_type_id FROM tbl_asset_sub_type_master WHERE is_active = 1');
    const [categories] = await pool.query('SELECT id, category_name AS label FROM tbl_asset_category_master WHERE is_active = 1');
    const [groups] = await pool.query('SELECT id, group_name AS label, category_id FROM tbl_asset_group_master WHERE is_active = 1');
    const [subGroups] = await pool.query('SELECT id, sub_group_name AS label, group_id FROM tbl_asset_sub_group_master WHERE is_active = 1');
    const [locations] = await pool.query('SELECT id, location_name AS label FROM tbl_location_area_master WHERE is_active = 1');

    res.json({
      success: true,
      data: {
        divisions,
        assetTypes,
        assetSubTypes,
        categories,
        groups,
        subGroups,
        locations
      }
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const data = req.body;
    const current_book_value = (data.purchase_cost || 0) - (data.accumulated_depreciation || 0);
    
    const [result] = await pool.query(
      'INSERT INTO tbl_asset_master SET ?, current_book_value = ?, created_by = ?',
      [data, current_book_value, 'ADMIN']
    );
    
    res.status(201).json({ success: true, message: "Asset created", id: result.insertId });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = req.body;
    const current_book_value = (data.purchase_cost || 0) - (data.accumulated_depreciation || 0);
    
    const [result] = await pool.query(
      'UPDATE tbl_asset_master SET ?, current_book_value = ?, updated_by = ? WHERE id = ?',
      [data, current_book_value, 'ADMIN', req.params.id]
    );
    
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: "Asset updated" });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { asset_status } = req.body;
    await pool.query('UPDATE tbl_asset_master SET asset_status = ?, updated_by = ? WHERE id = ?', [asset_status, 'ADMIN', req.params.id]);
    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    next(error);
  }
};

export const toggleActive = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT is_active FROM tbl_asset_master WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    
    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query('UPDATE tbl_asset_master SET is_active = ?, updated_by = ? WHERE id = ?', [newStatus, 'ADMIN', req.params.id]);
    
    res.json({ success: true, message: "Active status toggled" });
  } catch (error) {
    next(error);
  }
};
