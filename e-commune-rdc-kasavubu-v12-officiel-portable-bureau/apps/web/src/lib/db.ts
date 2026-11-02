import { Pool, type PoolClient, type QueryResultRow } from "pg";

type GlobalWithPool = typeof globalThis & { __ecommunePool?: Pool };
const globalWithPool = globalThis as GlobalWithPool;

export function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL n'est pas configurée.");
  if (!globalWithPool.__ecommunePool) {
    globalWithPool.__ecommunePool = new Pool({
      connectionString,
      max: Number(process.env.DATABASE_POOL_MAX || 10),
      // Keep certificate verification enabled. Supply the issuing CA when the
      // database provider uses a private certificate authority.
      ssl: process.env.DATABASE_SSL === "true"
        ? {
            rejectUnauthorized: true,
            ...(process.env.DATABASE_SSL_CA ? { ca: process.env.DATABASE_SSL_CA.replace(/\\n/g, "\n") } : {}),
          }
        : undefined,
      connectionTimeoutMillis: Number(process.env.DATABASE_CONNECT_TIMEOUT_MS || 2500),
    });
  }
  return globalWithPool.__ecommunePool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  return getPool().query<T>(text, values);
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const value = await fn(client);
    await client.query("COMMIT");
    return value;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
