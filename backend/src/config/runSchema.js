import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reads and executes the schema.sql file to set up the database.
 */
export async function runSchema() {
  const connection = await pool.getConnection();
  try {
    const sqlPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon to get individual statements and filter out empty strings
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Starting schema execution: ${statements.length} statements found.`);

    for (const statement of statements) {
      // Extract table name for logging if possible
      const match = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
      const tableName = match ? match[1] : 'Statement';
      
      await connection.query(statement);
      console.log(`Executed: ${tableName}`);
    }

    console.log('Schema execution completed successfully.');
  } catch (error) {
    console.error('Error executing schema:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

// Run schema if called directly
runSchema();
