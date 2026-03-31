const API_BASE_URL = 'http://localhost:5109/api/v1';
const TOKEN_KEY = 'qm_token';
const USER_KEY = 'qm_user';

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
    return Boolean(getToken());
}

export function getCurrentUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function setSession(authResponse) {
    localStorage.setItem(TOKEN_KEY, authResponse.token);
    localStorage.setItem(
        USER_KEY,
        JSON.stringify({
            id: authResponse.id,
            username: authResponse.username,
            email: authResponse.email,
            role: authResponse.role,
            expiresAt: authResponse.expiresAt
        })
    );
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

function parseError(payload) {
    if (!payload) return 'Something went wrong while calling the API.';
    if (typeof payload === 'string') return payload;
    if (payload.error) return payload.error;
    if (payload.detail) return payload.detail;
    if (payload.title) return payload.title;
    if (payload.message) return payload.message;

    if (payload.errors && typeof payload.errors === 'object') {
        return Object.values(payload.errors).flat().join(' ');
    }

    return 'Unexpected API response.';
}

async function request(endpoint, { method = 'GET', body, requiresAuth = false } = {}) {
    const headers = { Accept: 'application/json' };

    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    if (requiresAuth) {
        const token = getToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }

    let response;
    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined
        });
    } catch {
        throw new Error('Unable to reach the backend at http://localhost:5109.');
    }

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        if (response.status === 401) {
            clearSession();
            throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(parseError(payload));
    }

    return payload;
}

export const authApi = {
    login: (payload) => request('/Auth/login', { method: 'POST', body: payload }),
    register: (payload) => request('/Auth/register', { method: 'POST', body: payload })
};

export const quantityApi = {
    convert: (payload) => request('/QuantityMeasurement/convert', { method: 'POST', body: payload, requiresAuth: true }),
    compare: (payload) => request('/QuantityMeasurement/compare', { method: 'POST', body: payload, requiresAuth: true }),
    add: (payload) => request('/QuantityMeasurement/add', { method: 'POST', body: payload, requiresAuth: true }),
    subtract: (payload) => request('/QuantityMeasurement/subtract', { method: 'POST', body: payload, requiresAuth: true }),
    divide: (payload) => request('/QuantityMeasurement/divide', { method: 'POST', body: payload, requiresAuth: true }),
    getMyOperations: () => request('/QuantityMeasurement/my-operations', { requiresAuth: true })
};

export { API_BASE_URL };