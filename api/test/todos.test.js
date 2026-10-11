import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

// Use a throwaway in-memory database. This must be set before the app is
// imported, because db.js reads it as soon as it loads — which is why the app is
// imported with `await import()` here instead of a normal import at the top.
process.env.TURSO_DATABASE_URL = ":memory:";
const { default: app } = await import("../src/app.js");
const { createTodo } = await import("../src/db.js");

let server;
let baseUrl;

before(() => {
    // Port 0 lets the operating system pick any free port.
    server = app.listen(0);
    baseUrl = `http://localhost:${server.address().port}`;
});

after(() => {
    server.close();
});

// Each test gets its own new list, so tests can't affect each other.
function newListUrl() {
    return `${baseUrl}/lists/${randomUUID()}/todos`;
}

function post(url, body) {
    return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: typeof body === "string" ? body : JSON.stringify(body)
    });
}

test("GET /health responds ok", async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { status: "ok" });
});

test("a new list is empty", async () => {
    const res = await fetch(newListUrl());
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), []);
});

test("creates todos with trimmed text and lists them newest first", async () => {
    const url = newListUrl();

    const res = await post(url, { text: "  first  " });
    assert.equal(res.status, 201);
    const created = await res.json();
    assert.equal(created.text, "first");
    assert.equal(created.completed, 0);

    await post(url, { text: "second" });

    const todos = await (await fetch(url)).json();
    assert.deepEqual(
        todos.map((todo) => todo.text),
        ["second", "first"]
    );
});

test("rejects invalid todo text", async () => {
    const url = newListUrl();
    const cases = [
        { body: { text: "   " }, error: "text is required" },
        { body: { text: 42 }, error: "text is required" },
        { body: {}, error: "text is required" },
        { body: { text: "x".repeat(501) }, error: "text must be at most 500 characters" },
        { body: "{not json", error: "invalid JSON body" }
    ];

    for (const { body, error } of cases) {
        const res = await post(url, body);
        assert.equal(res.status, 400);
        assert.deepEqual(await res.json(), { error });
    }
});

test("toggles a todo back and forth", async () => {
    const url = newListUrl();
    const todo = await (await post(url, { text: "toggle me" })).json();

    const once = await (await fetch(`${url}/${todo.id}`, { method: "PATCH" })).json();
    assert.equal(once.completed, 1);

    const twice = await (await fetch(`${url}/${todo.id}`, { method: "PATCH" })).json();
    assert.equal(twice.completed, 0);
});

test("deletes a todo, then reports it missing", async () => {
    const url = newListUrl();
    const todo = await (await post(url, { text: "delete me" })).json();

    const first = await fetch(`${url}/${todo.id}`, { method: "DELETE" });
    assert.equal(first.status, 204);

    const second = await fetch(`${url}/${todo.id}`, { method: "DELETE" });
    assert.equal(second.status, 404);
});

test("a todo can't be seen or changed through another list", async () => {
    const mine = newListUrl();
    const other = newListUrl();
    const todo = await (await post(mine, { text: "private" })).json();

    assert.deepEqual(await (await fetch(other)).json(), []);

    const toggle = await fetch(`${other}/${todo.id}`, { method: "PATCH" });
    assert.equal(toggle.status, 404);

    const remove = await fetch(`${other}/${todo.id}`, { method: "DELETE" });
    assert.equal(remove.status, 404);
});

test("rejects list IDs that aren't UUIDs", async () => {
    const res = await fetch(`${baseUrl}/lists/not-a-uuid/todos`);
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: "invalid list id" });
});

test("a list holds at most 200 todos", async () => {
    const listId = randomUUID();
    // Fill the list directly through the database to avoid 200 HTTP requests
    // (which would also trip the rate limiter).
    for (let i = 0; i < 200; i++) {
        await createTodo(listId, `todo ${i}`);
    }

    const res = await post(`${baseUrl}/lists/${listId}/todos`, { text: "one too many" });
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: "a list can hold at most 200 todos" });
});

test("unknown routes get a JSON 404", async () => {
    const res = await fetch(`${baseUrl}/nope`);
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { error: "not found" });
});
