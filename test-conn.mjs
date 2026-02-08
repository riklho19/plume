import pg from 'pg';

const passwords = ['Yuzuisthebestcat2017!', 'Yuzuisthebestcat2027!'];
const host = 'aws-0-eu-central-1.pooler.supabase.com';

for (const pw of passwords) {
  for (const port of [6543, 5432]) {
    try {
      console.log(`Trying port ${port} with password ...${pw.slice(-6)}`);
      const c = new pg.Client({
        host,
        port,
        database: 'postgres',
        user: 'postgres.esrvrtxshwlnkjqcsovb',
        password: pw,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      });
      await c.connect();
      const res = await c.query('SELECT 1 as test');
      console.log('SUCCESS!', res.rows);
      await c.end();
      process.exit(0);
    } catch (e) {
      console.log(`  Failed: ${e.message}`);
    }
  }
}
console.log('All attempts failed.');
