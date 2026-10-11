import { Router } from "express";
import { getAllTodos, createTodo, toggleTodo, deleteTodo } from "../db.js";

const router = Router();

const MAX_TEXT_LENGTH = 500;

router.get("/", async (req, res) => {
    res.json(await getAllTodos());
});

router.post("/", async (req, res) => {
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

    res.status(201).json(await createTodo(text));
});

router.patch("/:id", async (req, res) => {
    const updated = await toggleTodo(req.params.id);

    if (!updated) {
        return res.status(404).json({ error: "todo not found" });
    }

    res.json(updated);
});

router.delete("/:id", async (req, res) => {
    const deleted = await deleteTodo(req.params.id);

    if (!deleted) {
        return res.status(404).json({ error: "todo not found" });
    }

    res.status(204).send();
});

export default router;
