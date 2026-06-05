import db from '../../../config/db.js';

/**
 * Controller for fetching asset data for barcode label generation.
 */
export const getAssets = async (req, res, next) => {
  try {
    const { division_code, category_code, asset_status, asset_ids } = req.query;

    let query = `
      SELECT 
        a.asset_id, a.asset_code, a.asset_name, a.serial_number, 
        a.barcode, a.manufacturer, a.purchase_date,
        d.division_name, c.category_name, l.location_name
      FROM tbl_asset_master a
      LEFT JOIN tbl_asset_division_master d ON a.division_code = d.division_code
      LEFT JOIN tbl_asset_category_master c ON a.category_code = c.category_code
      LEFT JOIN tbl_location_area_master l ON a.location_code = l.location_code
      WHERE a.is_active = 1
    `;
    const params = [];

    // If specific asset_ids are provided, we ignore other filters
    if (asset_ids) {
      const ids = asset_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (ids.length > 0) {
        query += ` AND a.asset_id IN (${ids.map(() => '?').join(',')})`;
        params.push(...ids);
      }
    } else {
      if (division_code) {
        query += ` AND a.division_code = ?`;
        params.push(division_code);
      }
      if (category_code) {
        query += ` AND a.category_code = ?`;
        params.push(category_code);
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
