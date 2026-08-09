import { useState } from "react";

export function TodoForm({ onAdd }) {
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || submitting) return;

        setSubmitting(true);
        try {
            await onAdd(trimmed);
            setText("");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a todo"
                className="flex-1 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
                Add
            </button>
        </form>
    );
}
