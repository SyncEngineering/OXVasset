import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reads and executes the seedData.sql file.
 */
export async function runSeed() {
  const connection = await pool.getConnection();
  try {
    const sqlPath = path.join(__dirname, 'seedData.sql');
    const seedSql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon and filter out empty strings
    const statements = seedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Starting seed execution: ${statements.length} statements found.`);

    for (const statement of statements) {
      await connection.query(statement);
    }

    console.log('Seed execution completed successfully.');
  } catch (error) {
    console.error('Error executing seed:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

runSeed();
