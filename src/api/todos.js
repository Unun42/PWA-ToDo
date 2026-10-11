const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request(path, options = {}) {
    let res;
    try {
        res = await fetch(`${API_BASE}${path}`, {
            headers: { "Content-Type": "application/json" },
            ...options
        });
    } catch {
        // fetch() only rejects when the request never got a response — offline,
        // DNS failure, CORS rejection. Its own message ("Failed to fetch") is
        // browser-specific and unhelpful to show a user.
        throw new Error("Network error — check your connection and try again.");
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed: ${res.status}`);
    }

    if (res.status === 204) {
        return null;
    }

    return res.json();
}

export const todosApi = {
    getAll: () => request("/todos"),
    create: (text) =>
        request("/todos", { method: "POST", body: JSON.stringify({ text }) }),
    toggle: (id) => request(`/todos/${id}`, { method: "PATCH" }),
    remove: (id) => request(`/todos/${id}`, { method: "DELETE" })
};
