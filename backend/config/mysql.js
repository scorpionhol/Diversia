import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'diversia',
  ADMIN_EMAIL,
  ADMIN_PASSWORD
} = process.env;

let pool = null;

async function seedAdmin(pool) {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;

  const [rows] = await pool.execute('SELECT id FROM admins WHERE email = ?', [ADMIN_EMAIL]);
  if (rows.length === 0) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await pool.execute(
      'INSERT INTO admins (email, password_hash, role) VALUES (?, ?, ?)',
      [ADMIN_EMAIL, passwordHash, 'admin']
    );
    console.log(`Initial admin created: ${ADMIN_EMAIL}`);
  }
}

export const initDb = async () => {
  if (pool) return pool;

  try {
    const adminConnection = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD
    });

    await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await adminConnection.end();

    pool = mysql.createPool({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    await pool.query('SELECT 1');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`admins\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(100) DEFAULT 'admin',
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`contacts\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL,
        \`phone\` VARCHAR(50) DEFAULT NULL,
        \`company\` VARCHAR(255) DEFAULT NULL,
        \`sector\` VARCHAR(100) DEFAULT NULL,
        \`urgency\` VARCHAR(50) DEFAULT NULL,
        \`services\` TEXT DEFAULT NULL,
        \`message\` TEXT NOT NULL,
        \`status\` VARCHAR(50) DEFAULT 'new',
        \`admin_notes\` TEXT DEFAULT NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`operations\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`action\` VARCHAR(255) NOT NULL,
        \`user\` VARCHAR(255) DEFAULT 'system',
        \`module\` VARCHAR(100) DEFAULT NULL,
        \`details\` TEXT DEFAULT NULL,
        \`timestamp\` DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`articles\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`category\` VARCHAR(100) NOT NULL,
        \`excerpt\` TEXT DEFAULT NULL,
        \`content\` TEXT NOT NULL,
        \`image_url\` VARCHAR(255) DEFAULT NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`jobs\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`title_en\` VARCHAR(255) DEFAULT NULL,
        \`description\` TEXT NOT NULL,
        \`description_en\` TEXT DEFAULT NULL,
        \`location\` VARCHAR(100) DEFAULT 'Lubumbashi',
        \`type\` VARCHAR(100) DEFAULT 'CDI',
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`applications\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`job_id\` INT DEFAULT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL,
        \`phone\` VARCHAR(100) DEFAULT NULL,
        \`message\` TEXT DEFAULT NULL,
        \`file_path\` VARCHAR(255) DEFAULT NULL,
        \`file_name\` VARCHAR(255) DEFAULT NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`texts\` (
        \`key_name\` VARCHAR(100) PRIMARY KEY,
        \`content_fr\` TEXT NOT NULL,
        \`content_en\` TEXT DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await seedAdmin(pool);

    console.log('MySQL pool created and database tables verified');
    return pool;
  } catch (err) {
    console.warn('MySQL not available:', err.message);
    pool = null;
    return null;
  }
};

export const getPool = () => pool;
