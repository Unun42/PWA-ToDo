import { useTodos } from "./useTodos.js";
import { TodoForm } from "./components/TodoForm.jsx";
import { TodoList } from "./components/TodoList.jsx";

function App() {
    const {
        todos,
        status,
        error,
        actionError,
        reload,
        addTodo,
        toggleTodo,
        deleteTodo,
        dismissActionError
    } = useTodos();

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 px-4 py-10">
            <div className="mx-auto w-full max-w-md space-y-4">
                <h1 className="text-xl font-semibold tracking-tight">Todo</h1>

                <TodoForm onAdd={addTodo} />

                {actionError && (
                    <div
                        role="alert"
                        className="flex items-start justify-between gap-3 rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300"
                    >
                        <span>{actionError}</span>
                        <button
                            onClick={dismissActionError}
                            className="text-red-400 hover:text-red-200"
                            aria-label="Dismiss error"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {status === "loading" && (
                    <p className="text-sm text-slate-500">Loading...</p>
                )}

                {status === "error" && (
                    <div role="alert" className="space-y-2 py-6 text-center">
                        <p className="text-sm text-red-400">
                            Could not load your todos: {error}
                        </p>
                        <button
                            onClick={reload}
                            className="rounded-md border border-slate-700 px-3 py-1 text-sm text-slate-300 hover:bg-slate-800"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {status === "ready" && (
                    <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
                )}
            </div>
        </div>
    );
}

export default App;
