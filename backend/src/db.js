import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
    user: process.env.DB_USER,          // seu usuário
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,       // nome do banco
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
});

export default pool;