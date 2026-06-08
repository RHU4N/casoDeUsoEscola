const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

const dbName = process.env.DB_NAME || 'escoladb';
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = Number(process.env.DB_PORT) || 3306;
const dbSslEnabled = process.env.DB_SSL === 'true';
const dbSslRejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';

if (!dbUser || !dbPassword) {
  throw new Error('DB_USER e DB_PASSWORD devem estar definidos nas variaveis de ambiente.');
}

const sslOptions = dbSslEnabled
  ? { rejectUnauthorized: dbSslRejectUnauthorized }
  : undefined;

const sequelize = new Sequelize(
  dbName,
  dbUser,
  dbPassword,
  {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    dialectOptions: sslOptions ? { ssl: sslOptions } : undefined,
    logging: false
  }
);

const ensureDatabaseExists = async () => {
  const connection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    ssl: sslOptions
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
  } finally {
    await connection.end();
  }
};

module.exports = {
  sequelize,
  ensureDatabaseExists
};
