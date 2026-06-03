import pool from '../../../config/db.js';
import { generateDocNumber } from '../../../utils/sequenceGenerator.js';

/**
 * Controller for Depreciation Entry
 */
export const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.*, a.asset_code, a.asset_name, a.depreciation_method AS asset_dep_method
      FROM tbl_depreciation_entry d
      JOIN tbl_asset_master a ON d.asset_id = a.id
      ORDER BY d.id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.*, a.asset_code, a.asset_name, a.depreciation_method AS asset_dep_method
      FROM tbl_depreciation_entry d
      JOIN tbl_asset_master a ON d.asset_id = a.id
      WHERE d.id = ?
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
      SELECT id, asset_code, asset_name, current_book_value, depreciation_method, depreciation_rate, useful_life_years, purchase_cost, salvage_value
      FROM tbl_asset_master
      WHERE is_active = 1 AND asset_status = 'active'
      ORDER BY asset_code
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const entry_no = await generateDocNumber(pool, 'DEPRECIATION');
    const { entry_date, period_from, period_to, asset_id, opening_book_value, depreciation_amount, closing_book_value, depreciation_method, remarks } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO tbl_depreciation_entry (entry_no, entry_date, period_from, period_to, asset_id, opening_book_value, depreciation_amount, closing_book_value, depreciation_method, remarks, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [entry_no, entry_date, period_from, period_to, asset_id, opening_book_value, depreciation_amount, closing_book_value, depreciation_method, remarks, 'ADMIN']
    );
    
    res.status(201).json({ success: true, message: "Entry created", id: result.insertId, entry_no });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { entry_date, period_from, period_to, asset_id, opening_book_value, depreciation_amount, closing_book_value, depreciation_method, remarks } = req.body;

    const [rows] = await pool.query('SELECT status FROM tbl_depreciation_entry WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    if (rows[0].status !== 'draft') return res.status(400).json({ success: false, message: 'Only draft entries can be edited' });

    await pool.query(
      'UPDATE tbl_depreciation_entry SET entry_date = ?, period_from = ?, period_to = ?, asset_id = ?, opening_book_value = ?, depreciation_amount = ?, closing_book_value = ?, depreciation_method = ?, remarks = ?, updated_by = ? WHERE id = ?',
      [entry_date, period_from, period_to, asset_id, opening_book_value, depreciation_amount, closing_book_value, depreciation_method, remarks, 'ADMIN', id]
    );
    
    res.json({ success: true, message: "Entry updated" });
  } catch (error) {
    next(error);
  }
};

export const post = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const [rows] = await connection.query('SELECT * FROM tbl_depreciation_entry WHERE id = ?', [req.params.id]);
    if (rows.length === 0) throw new Error('Entry not found');
    const entry = rows[0];
    
    if (entry.status !== 'draft') throw new Error('Only draft entries can be posted');
    
    // Update entry status
    await connection.query(
      'UPDATE tbl_depreciation_entry SET status = "posted", posted_by = "ADMIN", posted_at = NOW(), updated_by = "ADMIN" WHERE id = ?',
      [req.params.id]
    );
    
    // Update asset master
    await connection.query(
      'UPDATE tbl_asset_master SET accumulated_depreciation = accumulated_depreciation + ?, current_book_value = current_book_value - ?, updated_by = "ADMIN" WHERE id = ?',
      [entry.depreciation_amount, entry.depreciation_amount, entry.asset_id]
    );
    
    await connection.commit();
    res.json({ success: true, message: "Entry posted" });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

export const reverse = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const [rows] = await connection.query('SELECT * FROM tbl_depreciation_entry WHERE id = ?', [req.params.id]);
    if (rows.length === 0) throw new Error('Entry not found');
    const entry = rows[0];
    
    if (entry.status !== 'posted') throw new Error('Only posted entries can be reversed');
    
    // Update entry status
    await connection.query(
      'UPDATE tbl_depreciation_entry SET status = "reversed", updated_by = "ADMIN" WHERE id = ?',
      [req.params.id]
    );
    
    // Reverse asset master update
    await connection.query(
      'UPDATE tbl_asset_master SET accumulated_depreciation = accumulated_depreciation - ?, current_book_value = current_book_value + ?, updated_by = "ADMIN" WHERE id = ?',
      [entry.depreciation_amount, entry.depreciation_amount, entry.asset_id]
    );
    
    await connection.commit();
    res.json({ success: true, message: "Entry reversed" });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};
