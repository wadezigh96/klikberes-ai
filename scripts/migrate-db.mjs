import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required to run the database migration.");
const sql = neon(url);
const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
for (const statement of schema.split(";").map(value => value.trim()).filter(Boolean)) {
  await sql.query(statement);
}
console.log("KlikBeres database schema is ready.");
