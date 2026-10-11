import express from "express";
import cors from "cors";
import todosRouter from "./routes/todos.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.disable("x-powered-by");
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "10kb" }));

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/todos", todosRouter);

// Unmatched routes would otherwise get Express's default HTML 404 page.
app.use((req, res) => {
    res.status(404).json({ error: "not found" });
});

// Express 5 auto-forwards rejected promises from async route handlers here.
// Without this, a DB failure would fall through to Express's default HTML
// error page — wrong content type for an API consumed by fetch().
//
// Client errors raised by middleware (malformed JSON, oversized body) carry a
// 4xx `status` and are safe to report back as-is. Anything else is our fault.
app.use((err, req, res, next) => {
    if (err.status >= 400 && err.status < 500) {
        const message =
            err.type === "entity.parse.failed" ? "invalid JSON body" : err.message;
        return res.status(err.status).json({ error: message });
    }

    console.error(err);
    res.status(500).json({ error: "internal server error" });
});

app.listen(PORT, () => {
    console.log(`todo-api listening on http://localhost:${PORT}`);
});
