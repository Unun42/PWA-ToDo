export const initialState = {
    todos: [],
    status: "idle", // "idle" | "loading" | "error"
    error: null, // why the initial fetch failed
    actionError: null // why the last add/toggle/delete failed
};

export function todosReducer(state, action) {
    switch (action.type) {
        case "FETCH_START":
            return { ...state, status: "loading", error: null };

        case "FETCH_SUCCESS":
            return { ...state, status: "idle", todos: action.payload };

        case "FETCH_ERROR":
            return { ...state, status: "error", error: action.payload };

        case "ADD_TODO":
            return {
                ...state,
                actionError: null,
                todos: [action.payload, ...state.todos]
            };

        case "TOGGLE_TODO":
            return {
                ...state,
                actionError: null,
                todos: state.todos.map((todo) =>
                    todo.id === action.payload.id ? action.payload : todo
                )
            };

        case "DELETE_TODO":
            return {
                ...state,
                actionError: null,
                todos: state.todos.filter((todo) => todo.id !== action.payload)
            };

        case "ACTION_ERROR":
            return { ...state, actionError: action.payload };

        case "CLEAR_ACTION_ERROR":
            return { ...state, actionError: null };

        default:
            return state;
    }
}
