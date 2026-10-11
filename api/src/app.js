import express from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import todosRouter from "./routes/todos.js";

// The Express app is built here and started in server.js, so tests can import it
// and run it on any free port.
const app = express();

app.disable("x-powered-by");

// Render sits in front of the app as a proxy. Trusting it makes req.ip the real
// visitor's address instead of the proxy's, which the rate limiter relies on.
app.set("trust proxy", 1);

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "10kb" }));

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// The API is public, so cap how fast any one visitor can call it.
app.use(
    rateLimit({
        windowMs: 60 * 1000,
        limit: 60,
        message: { error: "too many requests, please slow down" }
    })
);

app.use("/lists/:listId/todos", todosRouter);

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

export default app;
