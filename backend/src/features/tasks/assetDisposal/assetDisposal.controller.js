import pool from '../../../config/db.js';
import { generateDocNumber } from '../../../utils/sequenceGenerator.js';

/**
 * Controller for Asset Sale/Disposal
 */
export const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.*, a.asset_code, a.asset_name
      FROM tbl_asset_sale_disposal d
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
      SELECT d.*, a.asset_code, a.asset_name
      FROM tbl_asset_sale_disposal d
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
      SELECT id, asset_code, asset_name, current_book_value
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
    const disposal_no = await generateDocNumber(pool, 'DISPOSAL');
    const { asset_id, disposal_date, disposal_type, book_value_at_disposal, sale_amount, buyer_name, buyer_contact, reason } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO tbl_asset_sale_disposal (disposal_no, asset_id, disposal_date, disposal_type, book_value_at_disposal, sale_amount, buyer_name, buyer_contact, reason, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "draft", "ADMIN")',
      [disposal_no, asset_id, disposal_date, disposal_type, book_value_at_disposal, sale_amount || 0, buyer_name, buyer_contact, reason]
    );
    
    res.status(201).json({ success: true, message: "Disposal entry created", id: result.insertId, disposal_no });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { asset_id, disposal_date, disposal_type, book_value_at_disposal, sale_amount, buyer_name, buyer_contact, reason } = req.body;

    const [rows] = await pool.query('SELECT status FROM tbl_asset_sale_disposal WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    if (rows[0].status !== 'draft') return res.status(400).json({ success: false, message: 'Only draft entries can be edited' });

    await pool.query(
      'UPDATE tbl_asset_sale_disposal SET asset_id = ?, disposal_date = ?, disposal_type = ?, book_value_at_disposal = ?, sale_amount = ?, buyer_name = ?, buyer_contact = ?, reason = ?, updated_by = "ADMIN" WHERE id = ?',
      [asset_id, disposal_date, disposal_type, book_value_at_disposal, sale_amount || 0, buyer_name, buyer_contact, reason, id]
    );
    
    res.json({ success: true, message: "Disposal entry updated" });
  } catch (error) {
    next(error);
  }
};

export const approve = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { action } = req.body; // 'approved', 'completed', 'rejected'

    const [rows] = await connection.query('SELECT * FROM tbl_asset_sale_disposal WHERE id = ?', [id]);
    if (rows.length === 0) throw new Error('Entry not found');
    const entry = rows[0];

    if (action === 'completed') {
      if (entry.status !== 'approved' && entry.status !== 'draft') throw new Error('Entry must be approved or draft to complete');

      await connection.query(
        'UPDATE tbl_asset_sale_disposal SET status = "completed", approved_by = "ADMIN", approved_at = NOW(), updated_by = "ADMIN" WHERE id = ?',
        [id]
      );
      
      const assetStatusMap = {
        'sale': 'disposed',
        'scrap': 'scrapped',
        'donation': 'disposed',
        'write_off': 'disposed'
      };
      
      const newStatus = assetStatusMap[entry.disposal_type] || 'disposed';

      await connection.query(
        'UPDATE tbl_asset_master SET asset_status = ?, is_active = 0, updated_by = "ADMIN" WHERE id = ?',
        [newStatus, entry.asset_id]
      );
    } else if (action === 'approved') {
      if (entry.status !== 'draft') throw new Error('Only draft entries can be approved');
      await connection.query(
        'UPDATE tbl_asset_sale_disposal SET status = "approved", updated_by = "ADMIN" WHERE id = ?',
        [id]
      );
    } else {
      await connection.query(
        'UPDATE tbl_asset_sale_disposal SET status = "rejected", updated_by = "ADMIN" WHERE id = ?',
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
