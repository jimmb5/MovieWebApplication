import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

let connectionString;

// Valitaan oikea database-osoite
if (process.env.NODE_ENV === "test") {
  connectionString = process.env.TEST_DATABASE_URL;
  console.log("Using TEST database:", connectionString);
} else {
  connectionString = process.env.DATABASE_URL;
  console.log("Using DEV database:", connectionString);
}

// Luodaan Pool ilman SSL:ää testejä varten
const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === "test"
      ? false
      : process.env.DB_SSL === "true"
      ? { rejectUnauthorized: false }
      : false,
});

export default pool;
