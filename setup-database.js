// Script para ejecutar el esquema de la base de datos en Railway
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './backend/.env' });

async function setupDatabase() {
  console.log('🔗 Conectando a Railway PostgreSQL...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Test connection
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa:', testResult.rows[0]);

    // Read and execute SQL schema
    const sqlPath = path.join(__dirname, 'backend', 'src', 'config', 'database-init.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📊 Ejecutando esquema de base de datos...');
    await pool.query(sqlContent);
    
    console.log('✅ Esquema de base de datos creado exitosamente!');
    console.log('🎉 Base de datos lista para usar');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

setupDatabase();