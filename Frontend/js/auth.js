import { authApi, clearSession, getCurrentUser, isAuthenticated, setSession } from './api.js';
import { clearInlineMessage, qs, setButtonLoading, showInlineMessage, showToast } from './utils.js';

export function redirectToLogin() {
    window.location.href = './login.html';
}

export function redirectToDashboard() {
    window.location.href = './dashboard.html';
}

export function logout() {
    clearSession();
    showToast('Logged out successfully.', 'info');
    window.setTimeout(redirectToLogin, 150);
}

export function protectDashboard() {
    if (!isAuthenticated()) {
        redirectToLogin();
        return false;
    }
    return true;
}

export function syncUserBadge() {
    const user = getCurrentUser();
    if (!user) return;

    document.querySelectorAll('[data-user-name]').forEach((node) => {
        node.textContent = user.username || 'User';
    });
    document.querySelectorAll('[data-user-email]').forEach((node) => {
        node.textContent = user.email || '';
    });
    document.querySelectorAll('[data-user-role]').forEach((node) => {
        node.textContent = user.role ? `Role: ${user.role}` : 'Authenticated session';
    });
}

function bindLogoutButtons() {
    document.querySelectorAll('[data-logout]').forEach((button) => {
        button.addEventListener('click', logout);
    });
}

async function handleLogin(event) {
    event.preventDefault();

    const messageBox = qs('#authMessage');
    const button = qs('#loginButton');
    clearInlineMessage(messageBox);
    setButtonLoading(button, true, 'Signing in...');

    try {
        const payload = {
            email: qs('#loginEmail').value.trim(),
            password: qs('#loginPassword').value
        };

        const response = await authApi.login(payload);
        setSession(response);
        showInlineMessage(messageBox, 'success', 'Login successful. Redirecting...');
        showToast('Welcome back!', 'success');
        window.setTimeout(redirectToDashboard, 500);
    } catch (error) {
        showInlineMessage(messageBox, 'error', error.message);
        showToast(error.message, 'error');
    } finally {
        setButtonLoading(button, false);
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const messageBox = qs('#authMessage');
    const button = qs('#registerButton');
    clearInlineMessage(messageBox);

    const password = qs('#registerPassword').value;
    const confirmPassword = qs('#registerConfirmPassword').value;

    if (password !== confirmPassword) {
        showInlineMessage(messageBox, 'error', 'Passwords do not match.');
        showToast('Passwords do not match.', 'error');
        return;
    }

    setButtonLoading(button, true, 'Creating account...');

    try {
        const payload = {
            username: qs('#registerUsername').value.trim(),
            email: qs('#registerEmail').value.trim(),
            password,
            confirmPassword
        };

        const response = await authApi.register(payload);
        setSession(response);
        showInlineMessage(messageBox, 'success', 'Registration successful. Redirecting...');
        showToast('Account created successfully.', 'success');
        window.setTimeout(redirectToDashboard, 500);
    } catch (error) {
        showInlineMessage(messageBox, 'error', error.message);
        showToast(error.message, 'error');
    } finally {
        setButtonLoading(button, false);
    }
}

function initHomePage() {
    if (!isAuthenticated()) return;

    const nav = document.querySelector('.nav-links');
    if (!nav) return;

    const dashboardLink = nav.querySelector('a[href="./dashboard.html"]');
    if (dashboardLink) {
        dashboardLink.textContent = 'Open Dashboard';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;

    if (page === 'home') {
        initHomePage();
        return;
    }

    if (page === 'login') {
        if (isAuthenticated()) {
            redirectToDashboard();
            return;
        }
        qs('#loginForm')?.addEventListener('submit', handleLogin);
        return;
    }

    if (page === 'register') {
        if (isAuthenticated()) {
            redirectToDashboard();
            return;
        }
        qs('#registerForm')?.addEventListener('submit', handleRegister);
        return;
    }

    if (page === 'dashboard') {
        if (!protectDashboard()) return;
        syncUserBadge();
        bindLogoutButtons();
    }
});