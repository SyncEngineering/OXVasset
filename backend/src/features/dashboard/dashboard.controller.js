import db from '../../config/db.js';

/**
 * Controller to fetch statistics for the Dashboard.
 * Uses .query() instead of .execute() for maximum compatibility with aggregate queries.
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    // Helper to run query with fallback
    const runQuery = async (sql, params = []) => {
      try {
        const [rows] = await db.query(sql, params);
        return rows;
      } catch (err) {
        console.error(`Query failed: ${sql}`, err.message);
        // Throw error to be caught by outer try-catch if it's a structural issue
        throw err;
      }
    };

    // 1. Basic Stats
    const totalAssets = await runQuery('SELECT COUNT(*) as count FROM tbl_asset_master WHERE is_active = 1');
    const activeAssets = await runQuery("SELECT COUNT(*) as count FROM tbl_asset_master WHERE is_active = 1 AND asset_status = 'active'");
    
    // 2. Assets by Category (for Bar Chart)
    const assetsByCategory = await runQuery(`
      SELECT COALESCE(c.category_name, 'Unknown') as label, COUNT(a.asset_id) as value
      FROM tbl_asset_category_master c
      LEFT JOIN tbl_asset_master a ON c.category_code = a.category_code AND a.is_active = 1
      WHERE c.is_active = 1
      GROUP BY c.category_code, c.category_name
    `);

    // 3. Asset Status Distribution (for Doughnut Chart)
    const assetsByStatus = await runQuery(`
      SELECT COALESCE(asset_status, 'unknown') as label, COUNT(*) as value
      FROM tbl_asset_master
      WHERE is_active = 1
      GROUP BY asset_status
    `);

    // 4. Asset Value by Division (for Bar Chart)
    const valueByDivision = await runQuery(`
      SELECT COALESCE(d.division_name, 'Unknown') as label, COALESCE(SUM(a.purchase_cost), 0) as value
      FROM tbl_asset_division_master d
      LEFT JOIN tbl_asset_master a ON d.division_code = a.division_code AND a.is_active = 1
      WHERE d.is_active = 1
      GROUP BY d.division_code, d.division_name
    `);

    // 5. Expiring Documents Count
    const expiringDocs = await runQuery(`
      SELECT COUNT(*) as count 
      FROM tbl_expiry_document_entry e
      JOIN tbl_expiry_document_type dt ON e.expiry_doc_type_code = dt.expiry_doc_type_code
      WHERE e.is_active = 1 
      AND DATEDIFF(e.expiry_date, CURDATE()) BETWEEN 0 AND dt.alert_before_days
    `);

    res.json({
      success: true,
      data: {
        summary: [
          { label: 'Total Assets', value: totalAssets[0]?.count || 0 },
          { label: 'Active Assets', value: activeAssets[0]?.count || 0 },
          { label: 'Expiring Documents', value: expiringDocs[0]?.count || 0 }
        ],
        charts: {
          assetsByCategory: assetsByCategory.length > 0 ? assetsByCategory : [{ label: 'None', value: 0 }],
          assetsByStatus: assetsByStatus.length > 0 ? assetsByStatus : [{ label: 'None', value: 0 }],
          valueByDivision: valueByDivision.length > 0 ? valueByDivision : [{ label: 'None', value: 0 }]
        }
      }
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Dashboard data error: ' + error.message,
      error_code: error.code
    });
  }
};
