export function TodoItem({ todo, onToggle, onDelete }) {
    return (
        <li className="flex items-center gap-3 rounded-md border border-slate-800 px-3 py-2">
            <input
                type="checkbox"
                checked={Boolean(todo.completed)}
                onChange={() => onToggle(todo.id)}
                aria-label={`Mark "${todo.text}" as ${todo.completed ? "not done" : "done"}`}
                className="h-4 w-4 accent-emerald-500"
            />
            <span
                className={
                    todo.completed
                        ? "flex-1 text-sm text-slate-500 line-through"
                        : "flex-1 text-sm text-slate-100"
                }
            >
                {todo.text}
            </span>
            <button
                onClick={() => onDelete(todo.id)}
                className="text-xs text-slate-500 hover:text-red-400"
                aria-label={`Delete "${todo.text}"`}
            >
                Delete
            </button>
        </li>
    );
}
