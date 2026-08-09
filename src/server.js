import express from "express";
import cors from "cors";
import "dotenv/config";
import todosRouter from "./routes/todos.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/todos", todosRouter);

// Express 5 auto-forwards rejected promises from async route handlers here.
// Without this, a DB failure would fall through to Express's default HTML
// error page — wrong content type for an API consumed by fetch().
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
});

app.listen(PORT, () => {
    console.log(`todo-api listening on http://localhost:${PORT}`);
});
