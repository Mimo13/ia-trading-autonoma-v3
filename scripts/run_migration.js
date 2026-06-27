const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: 'aws-0-eu-west-3.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.hqndgumqlfkzmaukptsg',
  password: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to Supabase');

    const sqlPath = path.join(__dirname, '..', 'database', 'migrations', '001_init_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    const result = await client.query(sql);
    console.log('Migration executed successfully');
    if (result.rows) {
      result.rows.forEach(row => console.log(row));
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
