import { useTodos } from "./hooks/useTodos.js";
import { TodoForm } from "./components/TodoForm.jsx";
import { TodoList } from "./components/TodoList.jsx";

function App() {
    const { todos, status, error, addTodo, toggleTodo, deleteTodo } = useTodos();

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 px-4 py-10">
            <div className="mx-auto w-full max-w-md space-y-4">
                <h1 className="text-xl font-semibold tracking-tight">Todo</h1>

                <TodoForm onAdd={addTodo} />

                {status === "loading" && (
                    <p className="text-sm text-slate-500">Loading...</p>
                )}

                {status === "error" && (
                    <p className="text-sm text-red-400">
                        Could not reach the server: {error}
                    </p>
                )}

                {status !== "loading" && (
                    <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
                )}
            </div>
        </div>
    );
}

export default App;
