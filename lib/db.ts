import { Database, type SQLQueryBindings } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const DB_PATH = process.env.DB_PATH ?? "data/app.db";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expiresAt TEXT NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  accessToken TEXT,
  refreshToken TEXT,
  accessTokenExpiresAt TEXT,
  refreshTokenExpiresAt TEXT,
  scope TEXT,
  idToken TEXT,
  password TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content_json TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 0,
  public_slug TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_public_slug ON notes(public_slug);
CREATE INDEX IF NOT EXISTS idx_notes_is_public ON notes(is_public);

CREATE TABLE IF NOT EXISTS rate_limit (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  reset_at INTEGER NOT NULL
);
`;

function openDb(): Database {
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const database = new Database(DB_PATH, { create: true, strict: true });
  database.run("PRAGMA journal_mode = WAL;");
  database.run("PRAGMA foreign_keys = ON;");
  database.run("PRAGMA busy_timeout = 5000;");
  database.run(SCHEMA);
  return database;
}

// Cache on globalThis so Next.js dev HMR doesn't open a new connection per reload.
const globalForDb = globalThis as unknown as { __db?: Database };

export const db: Database = globalForDb.__db ?? openDb();
if (process.env.NODE_ENV !== "production") globalForDb.__db = db;

export function getDb(): Database {
  return db;
}

type Params = SQLQueryBindings[] | Record<string, SQLQueryBindings>;

function bind(params?: Params): SQLQueryBindings[] {
  if (params === undefined) return [];
  return Array.isArray(params) ? params : [params as SQLQueryBindings];
}

export function query<T>(sql: string, params?: Params): T[] {
  return db.query<T, SQLQueryBindings[]>(sql).all(...bind(params));
}

export function get<T>(sql: string, params?: Params): T | undefined {
  return db.query<T, SQLQueryBindings[]>(sql).get(...bind(params)) ?? undefined;
}

export function run(sql: string, params?: Params) {
  return db.query(sql).run(...bind(params));
}
