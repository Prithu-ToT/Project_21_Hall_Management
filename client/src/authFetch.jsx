// Wrapper around fetch that automatically attaches the stored JWT.
// Usage identical to fetch(), so existing call sites change minimally.
export async function authFetch(url, options = {}) {
    const token = localStorage.getItem("token");

    return fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
}