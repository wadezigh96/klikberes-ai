import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL_UNPOOLED;

if (!url) {
  console.error("Available env keys related to database (values hidden):");
  for (const key of Object.keys(process.env).sort()) {
    if (/database|postgres|neon|pg/i.test(key)) {
      console.error(" -", key);
    }
  }
  throw new Error("No database URL found. Expected DATABASE_URL, POSTGRES_URL, or NEON_DATABASE_URL.");
}

const sql = neon(url);
const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
for (const statement of schema.split(";").map(value => value.trim()).filter(Boolean)) {
  await sql.query(statement);
}
console.log("KlikBeres database schema is ready.");
