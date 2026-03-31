export function qs(selector, scope = document) {
    return scope.querySelector(selector);
}

export function qsa(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
}

export function formatNumber(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return value ?? '—';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(numeric);
}

export function formatDate(value) {
    if (!value) return '—';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

export function setButtonLoading(button, isLoading, loadingText = 'Working...') {
    if (!button) return;

    const label = button.querySelector('.btn-label') || button;

    if (isLoading) {
        if (!button.dataset.originalText) {
            button.dataset.originalText = label.textContent;
        }
        label.innerHTML = `<span class="button-spinner" aria-hidden="true"></span>${loadingText}`;
        button.disabled = true;
        return;
    }

    label.textContent = button.dataset.originalText || label.textContent;
    button.disabled = false;
}

export function showInlineMessage(element, type, message) {
    if (!element) return;
    element.textContent = message;
    element.className = `inline-message ${type}`;
}

export function clearInlineMessage(element) {
    if (!element) return;
    element.textContent = '';
    element.className = 'inline-message hidden';
}

export function showToast(message, type = 'info', timeout = 3200) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    window.setTimeout(() => {
        toast.remove();
    }, timeout);
}

export function renderResultCard(target, type, title, body) {
    if (!target) return;
    target.className = `result-card ${type}`;
    target.innerHTML = `<strong>${title}</strong><div class="result-meta">${body}</div>`;
}
