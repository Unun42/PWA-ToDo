import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dbPath = process.env.DB_PATH || "./data/todos.db";

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
`);

const statements = {
    getAll: db.prepare("SELECT * FROM todos ORDER BY created_at DESC"),
    getById: db.prepare("SELECT * FROM todos WHERE id = ?"),
    insert: db.prepare("INSERT INTO todos (text) VALUES (?)"),
    toggleCompleted: db.prepare(
        "UPDATE todos SET completed = NOT completed WHERE id = ?"
    ),
    remove: db.prepare("DELETE FROM todos WHERE id = ?")
};

// Every method returns a plain value, not a Promise — that's fine. `await` on a
// non-Promise value just resolves immediately, so routes.js can treat this driver
// and the async Turso driver identically.
export const sqliteDriver = {
    name: "better-sqlite3 (local file)",
    getAll: () => statements.getAll.all(),
    getById: (id) => statements.getById.get(id),
    insert: (text) => {
        const { lastInsertRowid } = statements.insert.run(text);
        return statements.getById.get(lastInsertRowid);
    },
    toggleCompleted: (id) => {
        statements.toggleCompleted.run(id);
        return statements.getById.get(id);
    },
    remove: (id) => {
        statements.remove.run(id);
    }
};
