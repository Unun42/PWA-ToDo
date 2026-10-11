import { Router } from "express";
import { getTodos, countTodos, createTodo, toggleTodo, deleteTodo } from "../db.js";

// mergeParams lets these routes read :listId from the path in server.js.
const router = Router({ mergeParams: true });

const MAX_TEXT_LENGTH = 500;
const MAX_TODOS_PER_LIST = 200;

// A list ID is a random UUID made by the frontend. Anyone who knows it can use
// the list, so it's effectively the list's password — we only check its format.
const LIST_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

router.use((req, res, next) => {
    if (!LIST_ID_PATTERN.test(req.params.listId)) {
        return res.status(400).json({ error: "invalid list id" });
    }
    next();
});

router.get("/", async (req, res) => {
    res.json(await getTodos(req.params.listId));
});

router.post("/", async (req, res) => {
    const { listId } = req.params;

    // req.body is undefined in Express 5 when the request has no JSON body.
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";

    if (text.length === 0) {
        return res.status(400).json({ error: "text is required" });
    }

    if (text.length > MAX_TEXT_LENGTH) {
        return res
            .status(400)
            .json({ error: `text must be at most ${MAX_TEXT_LENGTH} characters` });
    }

    if ((await countTodos(listId)) >= MAX_TODOS_PER_LIST) {
        return res
            .status(400)
            .json({ error: `a list can hold at most ${MAX_TODOS_PER_LIST} todos` });
    }

    res.status(201).json(await createTodo(listId, text));
});

router.patch("/:id", async (req, res) => {
    const updated = await toggleTodo(req.params.listId, req.params.id);

    if (!updated) {
        return res.status(404).json({ error: "todo not found" });
    }

    res.json(updated);
});

router.delete("/:id", async (req, res) => {
    const deleted = await deleteTodo(req.params.listId, req.params.id);

    if (!deleted) {
        return res.status(404).json({ error: "todo not found" });
    }

    res.status(204).send();
});

export default router;
