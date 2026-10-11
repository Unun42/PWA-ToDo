import { Router } from "express";
import db from "../db/index.js";

const router = Router();

const MAX_TEXT_LENGTH = 500;

router.get("/", async (req, res) => {
    const todos = await db.getAll();
    res.json(todos);
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

    const created = await db.insert(text);
    res.status(201).json(created);
});

router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const existing = await db.getById(id);

    if (!existing) {
        return res.status(404).json({ error: "todo not found" });
    }

    const updated = await db.toggleCompleted(id);
    res.json(updated);
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const existing = await db.getById(id);

    if (!existing) {
        return res.status(404).json({ error: "todo not found" });
    }

    await db.remove(id);
    res.status(204).send();
});

export default router;
