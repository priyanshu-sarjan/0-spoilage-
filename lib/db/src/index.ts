import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let poolInstance: pg.Pool | null = null;
let dbInstance: any = null;

if (process.env.DATABASE_URL) {
  try {
    poolInstance = new Pool({ connectionString: process.env.DATABASE_URL });
    dbInstance = drizzle(poolInstance, { schema });
  } catch (err) {
    console.warn("Failed to initialize PostgreSQL pool:", err);
  }
} else {
  console.info("DATABASE_URL not set - database queries will use fallback or in-memory mode.");
}

export const pool = poolInstance as pg.Pool;
export const db = dbInstance;

export * from "./schema";

