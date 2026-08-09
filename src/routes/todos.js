import { Router } from "express";
import db from "../db/index.js";

const router = Router();

router.get("/", async (req, res) => {
    const todos = await db.getAll();
    res.json(todos);
});

router.post("/", async (req, res) => {
    const { text } = req.body;

    if (typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({ error: "text is required" });
    }

    const created = await db.insert(text.trim());
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
