import { TodoItem } from "./TodoItem.jsx";

export function TodoList({ todos, onToggle, onDelete }) {
    if (todos.length === 0) {
        return <p className="text-sm text-slate-500 text-center py-6">Nothing here yet.</p>;
    }

    return (
        <ul className="flex flex-col gap-2">
            {todos.map((todo) => (
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={onToggle}
                    onDelete={onDelete}
                />
            ))}
        </ul>
    );
}
