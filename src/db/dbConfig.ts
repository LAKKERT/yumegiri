import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

let pool: Pool | null = null;

export default async function Connect() {
    if (pool) {
        return pool;
    }

    const requiredEnvVars = [
        "PGSQL_DATABASE",
        "PGSQL_USERNAME",
        "PGSQL_PASSWORD",
        "PGSQL_HOST",
        "PGSQL_PORT",
    ];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`Missing ${envVar}`);
        }
    }

    try {
        pool = new Pool({
            database: process.env.PGSQL_DATABASE!,
            user: process.env.PGSQL_USERNAME!,
            password: process.env.PGSQL_PASSWORD!,
            host: process.env.PGSQL_HOST!,
            port: parseInt(process.env.PGSQL_PORT!, 10),
            statement_timeout: 5000,
          });

        const client = await pool.connect();
        try {
            await client.query("SELECT NOW()");
        } finally {
            client.release();
        }

        console.log("PostgreSQL pool successfully initialized");
        return pool;
    } catch (error) {
        console.error("Failed to initialize database pool:", error);
        if (pool) {
            await pool.end();
        }
        throw new Error("Database connection failed");
    }
}