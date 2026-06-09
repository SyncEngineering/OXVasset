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
      LEFT JOIN tbl_asset_division_master d ON a.division_code = d.division_code
      LEFT JOIN tbl_asset_type_master t ON a.type_code = t.type_code
      LEFT JOIN tbl_asset_sub_type_master st ON a.sub_type_code = st.sub_type_code
      LEFT JOIN tbl_asset_category_master c ON a.category_code = c.category_code
      LEFT JOIN tbl_asset_group_master g ON a.group_code = g.group_code
      LEFT JOIN tbl_asset_sub_group_master sg ON a.sub_group_code = sg.sub_group_code
      LEFT JOIN tbl_location_area_master l ON a.location_code = l.location_code
      ORDER BY a.asset_id DESC
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
      LEFT JOIN tbl_asset_division_master d ON a.division_code = d.division_code
      LEFT JOIN tbl_asset_type_master t ON a.type_code = t.type_code
      LEFT JOIN tbl_asset_sub_type_master st ON a.sub_type_code = st.sub_type_code
      LEFT JOIN tbl_asset_category_master c ON a.category_code = c.category_code
      LEFT JOIN tbl_asset_group_master g ON a.group_code = g.group_code
      LEFT JOIN tbl_asset_sub_group_master sg ON a.sub_group_code = sg.sub_group_code
      LEFT JOIN tbl_location_area_master l ON a.location_code = l.location_code
      WHERE a.asset_id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getDropdownOptions = async (req, res, next) => {
  try {
    const [divisions] = await pool.query('SELECT division_code AS id, division_name AS label FROM tbl_asset_division_master WHERE is_active = 1');
    const [assetTypes] = await pool.query('SELECT type_code AS id, type_name AS label FROM tbl_asset_type_master WHERE is_active = 1');
    const [assetSubTypes] = await pool.query('SELECT sub_type_code AS id, sub_type_name AS label, type_code FROM tbl_asset_sub_type_master WHERE is_active = 1');
    const [categories] = await pool.query('SELECT category_code AS id, category_name AS label FROM tbl_asset_category_master WHERE is_active = 1');
    const [groups] = await pool.query('SELECT group_code AS id, group_name AS label, category_code FROM tbl_asset_group_master WHERE is_active = 1');
    const [subGroups] = await pool.query('SELECT sub_group_code AS id, sub_group_name AS label, group_code FROM tbl_asset_sub_group_master WHERE is_active = 1');
    const [locations] = await pool.query('SELECT location_code AS id, location_name AS label FROM tbl_location_area_master WHERE is_active = 1');

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

const VALID_ASSET_FIELDS = [
  'asset_code', 'asset_name', 'description', 'division_code', 'type_code', 'sub_type_code',
  'category_code', 'group_code', 'sub_group_code', 'location_code', 'serial_number',
  'model_number', 'manufacturer', 'purchase_date', 'purchase_cost', 'salvage_value',
  'useful_life_years', 'depreciation_method', 'depreciation_rate',
  'accumulated_depreciation', 'barcode', 'qr_code', 'asset_status', 'is_active', 'remarks'
];

const filterAssetData = (data) => {
  const filtered = {};
  VALID_ASSET_FIELDS.forEach(field => {
    if (data[field] !== undefined) {
      // Convert empty strings to null for numeric/date/foreign key fields
      if (data[field] === '' && [
        'division_code', 'type_code', 'sub_type_code', 'category_code', 'group_code', 
        'sub_group_code', 'location_code', 'purchase_cost', 'salvage_value', 
        'useful_life_years', 'depreciation_rate', 'accumulated_depreciation', 'purchase_date'
      ].includes(field)) {
        filtered[field] = null;
      } else {
        filtered[field] = data[field];
      }
    }
  });
  return filtered;
};

export const create = async (req, res, next) => {
  try {
    const sanitizedData = filterAssetData(req.body);
    const current_book_value = (parseFloat(sanitizedData.purchase_cost) || 0) - (parseFloat(sanitizedData.accumulated_depreciation) || 0);
    
    const [result] = await pool.query(
      'INSERT INTO tbl_asset_master SET ?, current_book_value = ?, created_by = ?',
      [sanitizedData, current_book_value, 'ADMIN']
    );
    
    res.status(201).json({ success: true, message: "Asset created", id: result.insertId });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const sanitizedData = filterAssetData(req.body);
    const current_book_value = (parseFloat(sanitizedData.purchase_cost) || 0) - (parseFloat(sanitizedData.accumulated_depreciation) || 0);
    
    const [result] = await pool.query(
      'UPDATE tbl_asset_master SET ?, current_book_value = ?, updated_by = ? WHERE asset_id = ?',
      [sanitizedData, current_book_value, 'ADMIN', req.params.id]
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
    await pool.query('UPDATE tbl_asset_master SET asset_status = ?, updated_by = ? WHERE asset_id = ?', [asset_status, 'ADMIN', req.params.id]);
    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    next(error);
  }
};

export const toggleActive = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT is_active FROM tbl_asset_master WHERE asset_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    
    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query('UPDATE tbl_asset_master SET is_active = ?, updated_by = ? WHERE asset_id = ?', [newStatus, 'ADMIN', req.params.id]);
    
    res.json({ success: true, message: "Active status toggled" });
  } catch (error) {
    next(error);
  }
};
