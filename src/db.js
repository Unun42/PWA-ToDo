import { createClient } from "@libsql/client";

if (!process.env.TURSO_DATABASE_URL) {
    throw new Error(
        "TURSO_DATABASE_URL is not set. Copy .env.example to .env and fill it in."
    );
}

// Works with a Turso URL (libsql://...) or a local SQLite file (file:todos.db).
const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

await client.execute(`
    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
`);

// `RETURNING *` hands back the affected row, so each write is a single query.
// Functions that target an id return null (or false) when no such todo exists.

export async function getAllTodos() {
    const result = await client.execute(
        "SELECT * FROM todos ORDER BY id DESC"
    );
    return result.rows;
}

export async function createTodo(text) {
    const result = await client.execute({
        sql: "INSERT INTO todos (text) VALUES (?) RETURNING *",
        args: [text]
    });
    return result.rows[0];
}

export async function toggleTodo(id) {
    const result = await client.execute({
        sql: "UPDATE todos SET completed = NOT completed WHERE id = ? RETURNING *",
        args: [id]
    });
    return result.rows[0] ?? null;
}

export async function deleteTodo(id) {
    const result = await client.execute({
        sql: "DELETE FROM todos WHERE id = ?",
        args: [id]
    });
    return result.rowsAffected > 0;
}
