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

// Every todo belongs to a list. There's no separate lists table: a list is just
// the set of todos that share a list_id.
await client.batch([
    `CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        list_id TEXT NOT NULL,
        text TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    "CREATE INDEX IF NOT EXISTS todos_list_id ON todos (list_id)"
]);

// `RETURNING *` hands back the affected row, so each write is a single query.
// Every query filters on list_id, so a todo can only be reached through its own list.

export async function getTodos(listId) {
    const result = await client.execute({
        sql: "SELECT * FROM todos WHERE list_id = ? ORDER BY id DESC",
        args: [listId]
    });
    return result.rows;
}

export async function countTodos(listId) {
    const result = await client.execute({
        sql: "SELECT COUNT(*) AS count FROM todos WHERE list_id = ?",
        args: [listId]
    });
    return Number(result.rows[0].count);
}

export async function createTodo(listId, text) {
    const result = await client.execute({
        sql: "INSERT INTO todos (list_id, text) VALUES (?, ?) RETURNING *",
        args: [listId, text]
    });
    return result.rows[0];
}

export async function toggleTodo(listId, id) {
    const result = await client.execute({
        sql: `UPDATE todos SET completed = NOT completed
              WHERE id = ? AND list_id = ? RETURNING *`,
        args: [id, listId]
    });
    return result.rows[0] ?? null;
}

export async function deleteTodo(listId, id) {
    const result = await client.execute({
        sql: "DELETE FROM todos WHERE id = ? AND list_id = ?",
        args: [id, listId]
    });
    return result.rowsAffected > 0;
}
