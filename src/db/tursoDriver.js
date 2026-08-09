import { createClient } from "@libsql/client";

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

async function getById(id) {
    const result = await client.execute({
        sql: "SELECT * FROM todos WHERE id = ?",
        args: [id]
    });
    return result.rows[0] ?? null;
}

export const tursoDriver = {
    name: "Turso (libSQL)",
    getAll: async () => {
        const result = await client.execute(
            "SELECT * FROM todos ORDER BY created_at DESC"
        );
        return result.rows;
    },
    getById,
    insert: async (text) => {
        // lastInsertRowid comes back as a bigint (confirmed empirically) — never
        // return it directly, JSON.stringify() throws on raw BigInt. We only ever
        // use it internally to re-fetch the row as plain JSON-safe values.
        const { lastInsertRowid } = await client.execute({
            sql: "INSERT INTO todos (text) VALUES (?)",
            args: [text]
        });
        return getById(Number(lastInsertRowid));
    },
    toggleCompleted: async (id) => {
        await client.execute({
            sql: "UPDATE todos SET completed = NOT completed WHERE id = ?",
            args: [id]
        });
        return getById(id);
    },
    remove: async (id) => {
        await client.execute({
            sql: "DELETE FROM todos WHERE id = ?",
            args: [id]
        });
    }
};
