/**
 * Generates a formatted document number using a centralized sequence table.
 * @param {Object} pool - MySQL connection pool
 * @param {string} docType - The document type key (e.g., 'DEPRECIATION')
 * @returns {Promise<string>} - Formatted document number (e.g., 'DEP/00001')
 */
export async function generateDocNumber(pool, docType) {
  const connection = await pool.getConnection();
  
  try {
    // Start transaction to ensure atomicity and prevent race conditions
    await connection.beginTransaction();

    // Select and lock the row for update
    const [rows] = await connection.query(
      'SELECT last_sequence, prefix FROM tbl_asset_doc_sequence WHERE doc_type = ? FOR UPDATE',
      [docType]
    );

    if (rows.length === 0) {
      throw new Error(`Unknown doc type: ${docType}`);
    }

    const { last_sequence, prefix } = rows[0];
    const newSeq = last_sequence + 1;

    // Update the sequence
    await connection.query(
      'UPDATE tbl_asset_doc_sequence SET last_sequence = ? WHERE doc_type = ?',
      [newSeq, docType]
    );

    // Commit the changes
    await connection.commit();

    // Format output: prefix/00000
    return `${prefix}/${String(newSeq).padStart(5, '0')}`;
  } catch (error) {
    // Rollback on any error
    await connection.rollback();
    throw error;
  } finally {
    // Release the connection back to the pool
    connection.release();
  }
}
