const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'postgres',
  password: '.lu:OXnIn3`)i5Gr%clMU1$Z',
  host: 'localhost',
  port: 5432,
  database: 'postgres'
});

pool.connect()
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err) => console.error('❌ Database connection error:', err.stack));

module.exports = pool;