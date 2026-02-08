import pg from 'pg';
import { readFileSync } from 'fs';

const sql = readFileSync('./supabase-schema.sql', 'utf-8');

// Try pooler connection (session mode) - works across all Supabase projects
const regions = ['eu-west-1', 'eu-central-1', 'us-east-1', 'us-west-1', 'ap-southeast-1'];
let client;

async function tryConnect() {
  const hosts = [
    // Pooler session mode (port 5432) and transaction mode (port 6543)
    { host: 'aws-0-eu-central-1.pooler.supabase.com', port: 6543, user: 'postgres.esrvrtxshwlnkjqcsovb' },
    { host: 'aws-0-eu-central-1.pooler.supabase.com', port: 5432, user: 'postgres.esrvrtxshwlnkjqcsovb' },
    // Direct connection (requires IPv4 addon)
    { host: 'db.esrvrtxshwlnkjqcsovb.supabase.co', port: 5432, user: 'postgres' },
    // Try other regions just in case
    ...regions.filter(r => r !== 'eu-central-1').flatMap(r => [
      { host: `aws-0-${r}.pooler.supabase.com`, port: 6543, user: 'postgres.esrvrtxshwlnkjqcsovb' },
      { host: `aws-0-${r}.pooler.supabase.com`, port: 5432, user: 'postgres.esrvrtxshwlnkjqcsovb' },
    ]),
  ];

  for (const h of hosts) {
    try {
      console.log(`Trying ${h.host}:${h.port}...`);
      const c = new pg.Client({
        host: h.host,
        port: h.port,
        database: 'postgres',
        user: h.user,
        password: 'Yuzuisthebestcat2017!',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      });
      await c.connect();
      console.log(`Connected via ${h.host}`);
      return c;
    } catch (e) {
      console.log(`  Failed: ${e.message}`);
    }
  }
  throw new Error('Could not connect to any Supabase database endpoint');
}


async function run() {
  client = await tryConnect();

  try {
    await client.query(sql);
    console.log('Schema executed successfully!');
  } catch (err) {
    console.error('Schema execution error:', err.message);
    // Try executing statement by statement
    console.log('\nRetrying statement by statement...');
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let success = 0;
    let failed = 0;
    for (const stmt of statements) {
      try {
        await client.query(stmt);
        success++;
      } catch (e) {
        failed++;
        console.error(`FAILED: ${stmt.substring(0, 80)}...`);
        console.error(`  Error: ${e.message}`);
      }
    }
    console.log(`\nDone: ${success} succeeded, ${failed} failed.`);
  }

  await client.end();
}

run().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
