// Shared MySQL pool. Server-side only — never import this from a "use client" file.
// Points at the Docker MySQL on the LAN (see .env.local).
import mysql from "mysql2/promise";

const globalForDb = globalThis;

export const pool =
  globalForDb._mysqlPool ||
  mysql.createPool({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "family_health",
    connectionLimit: 5,
    waitForConnections: true,
    dateStrings: true, // keep DATE columns as "YYYY-MM-DD" — no timezone drift
  });

// Next.js hot-reloads modules in dev; reuse one pool instead of leaking a new one per reload.
if (process.env.NODE_ENV !== "production") globalForDb._mysqlPool = pool;

export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}
