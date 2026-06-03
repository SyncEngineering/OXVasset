import pool from '../../../config/db.js';
import { generateDocNumber } from '../../../utils/sequenceGenerator.js';

/**
 * Controller for Asset Reclassify
 */
export const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        r.*, 
        a.asset_code, a.asset_name,
        oc.category_name AS old_category_name,
        nc.category_name AS new_category_name,
        og.group_name AS old_group_name,
        ng.group_name AS new_group_name,
        osg.sub_group_name AS old_sub_group_name,
        nsg.sub_group_name AS new_sub_group_name
      FROM tbl_asset_reclassify r
      JOIN tbl_asset_master a ON r.asset_id = a.id
      LEFT JOIN tbl_asset_category_master oc ON r.old_category_id = oc.id
      LEFT JOIN tbl_asset_category_master nc ON r.new_category_id = nc.id
      LEFT JOIN tbl_asset_group_master og ON r.old_group_id = og.id
      LEFT JOIN tbl_asset_group_master ng ON r.new_group_id = ng.id
      LEFT JOIN tbl_asset_sub_group_master osg ON r.old_sub_group_id = osg.id
      LEFT JOIN tbl_asset_sub_group_master nsg ON r.new_sub_group_id = nsg.id
      ORDER BY r.id DESC
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
        r.*, 
        a.asset_code, a.asset_name,
        oc.category_name AS old_category_name,
        nc.category_name AS new_category_name,
        og.group_name AS old_group_name,
        ng.group_name AS new_group_name,
        osg.sub_group_name AS old_sub_group_name,
        nsg.sub_group_name AS new_sub_group_name
      FROM tbl_asset_reclassify r
      JOIN tbl_asset_master a ON r.asset_id = a.id
      LEFT JOIN tbl_asset_category_master oc ON r.old_category_id = oc.id
      LEFT JOIN tbl_asset_category_master nc ON r.new_category_id = nc.id
      LEFT JOIN tbl_asset_group_master og ON r.old_group_id = og.id
      LEFT JOIN tbl_asset_group_master ng ON r.new_group_id = ng.id
      LEFT JOIN tbl_asset_sub_group_master osg ON r.old_sub_group_id = osg.id
      LEFT JOIN tbl_asset_sub_group_master nsg ON r.new_sub_group_id = nsg.id
      WHERE r.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getAssetOptions = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, asset_code, asset_name, category_id, group_id, sub_group_id,
        (SELECT category_name FROM tbl_asset_category_master WHERE id = category_id) as category_name,
        (SELECT group_name FROM tbl_asset_group_master WHERE id = group_id) as group_name,
        (SELECT sub_group_name FROM tbl_asset_sub_group_master WHERE id = sub_group_id) as sub_group_name
      FROM tbl_asset_master 
      WHERE is_active = 1 AND asset_status = 'active'
      ORDER BY asset_code
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getCategoryOptions = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, category_name AS name FROM tbl_asset_category_master WHERE is_active = 1');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getGroupOptions = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, group_name AS name, category_id FROM tbl_asset_group_master WHERE is_active = 1');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getSubGroupOptions = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, sub_group_name AS name, group_id FROM tbl_asset_sub_group_master WHERE is_active = 1');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const reclassify_no = await generateDocNumber(pool, 'RECLASSIFY');
    const data = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO tbl_asset_reclassify SET ?, reclassify_no = ?, status = "draft", created_by = "ADMIN"',
      [data, reclassify_no]
    );
    
    res.status(201).json({ success: true, message: "Reclassify entry created", id: result.insertId, reclassify_no });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const [rows] = await pool.query('SELECT status FROM tbl_asset_reclassify WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    if (rows[0].status !== 'draft') return res.status(400).json({ success: false, message: 'Only draft entries can be edited' });

    await pool.query(
      'UPDATE tbl_asset_reclassify SET ?, updated_by = "ADMIN" WHERE id = ?',
      [data, id]
    );
    
    res.json({ success: true, message: "Reclassify entry updated" });
  } catch (error) {
    next(error);
  }
};

export const approve = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { action } = req.body; // 'approved' or 'rejected'

    const [rows] = await connection.query('SELECT * FROM tbl_asset_reclassify WHERE id = ?', [id]);
    if (rows.length === 0) throw new Error('Entry not found');
    const entry = rows[0];

    if (entry.status !== 'draft') throw new Error('Entry is not in draft status');

    if (action === 'approved') {
      await connection.query(
        'UPDATE tbl_asset_reclassify SET status = "approved", approved_by = "ADMIN", approved_at = NOW(), updated_by = "ADMIN" WHERE id = ?',
        [id]
      );
      
      await connection.query(
        'UPDATE tbl_asset_master SET category_id = ?, group_id = ?, sub_group_id = ?, updated_by = "ADMIN" WHERE id = ?',
        [entry.new_category_id, entry.new_group_id, entry.new_sub_group_id, entry.asset_id]
      );
    } else {
      await connection.query(
        'UPDATE tbl_asset_reclassify SET status = "rejected", updated_by = "ADMIN" WHERE id = ?',
        [id]
      );
    }

    await connection.commit();
    res.json({ success: true, message: `Entry ${action}` });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};
