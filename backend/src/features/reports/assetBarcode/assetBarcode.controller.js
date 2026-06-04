import db from '../../../config/db.js';

/**
 * Controller for fetching asset data for barcode label generation.
 */
export const getAssets = async (req, res, next) => {
  try {
    const { division_id, category_id, asset_status, asset_ids } = req.query;

    let query = `
      SELECT 
        a.id, a.asset_code, a.asset_name, a.serial_number, 
        a.barcode, a.manufacturer, a.purchase_date,
        d.division_name, c.category_name, l.location_name
      FROM tbl_asset_master a
      LEFT JOIN tbl_asset_division_master d ON a.division_id = d.id
      LEFT JOIN tbl_asset_category_master c ON a.category_id = c.id
      LEFT JOIN tbl_location_area_master l ON a.location_id = l.id
      WHERE a.is_active = 1
    `;
    const params = [];

    // If specific asset_ids are provided, we ignore other filters
    if (asset_ids) {
      const ids = asset_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (ids.length > 0) {
        query += ` AND a.id IN (${ids.map(() => '?').join(',')})`;
        params.push(...ids);
      }
    } else {
      if (division_id) {
        query += ` AND a.division_id = ?`;
        params.push(division_id);
      }
      if (category_id) {
        query += ` AND a.category_id = ?`;
        params.push(category_id);
      }
      if (asset_status) {
        query += ` AND a.asset_status = ?`;
        params.push(asset_status);
      }
    }

    query += ` ORDER BY a.asset_code`;

    const [rows] = await db.execute(query, params);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};
