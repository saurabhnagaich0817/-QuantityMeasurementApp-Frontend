import { getCurrentUser, quantityApi } from './api.js';
import { protectDashboard, syncUserBadge } from './auth.js';
import { clearInlineMessage, formatDate, formatNumber, qs, qsa, renderResultCard, setButtonLoading, showInlineMessage, showToast } from './utils.js';

const unitsByType = {
    length: ['Inches', 'Feet', 'Yards', 'Centimeters'],
    weight: ['Grams', 'Kilograms', 'Pound'],
    volume: ['Litre', 'MilliLiter', 'Gallon'],
    temperature: ['Celsius', 'Fahrenheit', 'Kelvin']
};

const measurementTypes = [
    { value: 'length', label: 'Length' },
    { value: 'weight', label: 'Weight' },
    { value: 'volume', label: 'Volume' },
    { value: 'temperature', label: 'Temperature' }
];

const state = {
    myOperations: []
};

function populateMeasurementTypes(select) {
    select.innerHTML = measurementTypes
        .map((item) => `<option value="${item.value}">${item.label}</option>`)
        .join('');
}

function populateUnitSelect(select, measurementType, keepValue = '') {
    const units = unitsByType[measurementType] || [];
    const allowBlank = select.dataset.optional === 'true';

    select.innerHTML = allowBlank ? '<option value="">Use first unit</option>' : '';
    units.forEach((unit) => {
        select.insertAdjacentHTML('beforeend', `<option value="${unit}">${unit}</option>`);
    });

    if (keepValue && [...select.options].some((option) => option.value === keepValue)) {
        select.value = keepValue;
    }
}

function readQuantity(form, prefix, measurementType) {
    return {
        value: Number(form.querySelector(`[name="${prefix}Value"]`).value),
        unit: form.querySelector(`[name="${prefix}Unit"]`).value,
        measurementType
    };
}

function setupOperationForm(form) {
    const typeSelect = form.querySelector('[data-measurement-type]');
    const unitSelects = qsa('[data-unit-select]', form);

    populateMeasurementTypes(typeSelect);

    const syncUnits = () => {
        const measurementType = typeSelect.value;
        unitSelects.forEach((select) => populateUnitSelect(select, measurementType, select.value));
    };

    syncUnits();
    typeSelect.addEventListener('change', syncUnits);
    form.addEventListener('submit', handleOperationSubmit);
}

function showOperationResult(target, operation, result) {
    if (result.isError) {
        renderResultCard(target, 'error', `${operation} failed`, result.errorMessage || 'Request failed.');
        return;
    }

    const title = operation === 'compare'
        ? (Number(result.result) === 1 ? 'Quantities are equal' : 'Quantities are not equal')
        : `${operation[0].toUpperCase()}${operation.slice(1)} successful`;

    const body = `Result: ${formatNumber(result.result)} ${result.resultUnit || ''} • From ${formatNumber(result.fromValue)} ${result.fromUnit} to ${formatNumber(result.toValue)} ${result.toUnit}`;
    renderResultCard(target, 'success', title, body);
}

async function handleOperationSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const operation = form.dataset.operation;
    const target = qs(`#${form.dataset.resultTarget}`);
    const button = form.querySelector('button[type="submit"]');
    const measurementType = form.querySelector('[data-measurement-type]').value;
    clearInlineMessage(qs('#dashboardMessage'));

    let payload;

    if (operation === 'convert') {
        payload = {
            source: {
                value: Number(form.querySelector('[name="sourceValue"]').value),
                unit: form.querySelector('[name="sourceUnit"]').value,
                measurementType
            },
            target: {
                value: 0,
                unit: form.querySelector('[name="targetUnit"]').value,
                measurementType
            }
        };
    } else if (operation === 'compare' || operation === 'divide') {
        payload = {
            first: readQuantity(form, 'first', measurementType),
            second: readQuantity(form, 'second', measurementType)
        };
    } else {
        payload = {
            first: readQuantity(form, 'first', measurementType),
            second: readQuantity(form, 'second', measurementType),
            resultUnit: form.querySelector('[name="resultUnit"]').value || null
        };
    }

    try {
        setButtonLoading(button, true, 'Processing...');
        renderResultCard(target, 'success', 'Working...', 'Sending request to the API.');
        const result = await quantityApi[operation](payload);
        showOperationResult(target, operation, result);
        showToast(`${operation[0].toUpperCase()}${operation.slice(1)} completed successfully.`, 'success');
        await loadMyOperations(false);
    } catch (error) {
        renderResultCard(target, 'error', `${operation} failed`, error.message);
        showInlineMessage(qs('#dashboardMessage'), 'error', error.message);
        showToast(error.message, 'error');
    } finally {
        setButtonLoading(button, false);
    }
}

function renderStats(items) {
    const counts = items.reduce((accumulator, item) => {
        const key = item.operation;
        accumulator[key] = (accumulator[key] || 0) + 1;
        return accumulator;
    }, {});

    ['Compare', 'Convert', 'Add', 'Subtract', 'Divide'].forEach((name) => {
        const target = document.querySelector(`[data-stat="${name}"]`);
        if (target) {
            target.textContent = counts[name] || 0;
        }
    });
}

function getFilteredOperations() {
    const operationFilter = qs('#historyOperationFilter').value;
    const typeFilter = qs('#historyTypeFilter').value;
    const statusFilter = qs('#historyStatusFilter').value;

    return state.myOperations.filter((item) => {
        const matchesOperation = operationFilter === 'all' || item.operation === operationFilter;
        const matchesType = typeFilter === 'all' || String(item.measurementType).toLowerCase() === typeFilter;
        const matchesStatus = statusFilter === 'all'
            || (statusFilter === 'success' && !item.isError)
            || (statusFilter === 'error' && item.isError);

        return matchesOperation && matchesType && matchesStatus;
    });
}

function renderHistoryTable(items) {
    const tableBody = qs('#historyTableBody');

    if (!items.length) {
        tableBody.innerHTML = '<tr><td colspan="7" class="table-empty">No history records match the current filters.</td></tr>';
        return;
    }

    tableBody.innerHTML = items
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((item) => {
            const statusClass = item.isError ? 'error' : 'success';
            const statusText = item.isError ? 'Error' : 'Success';
            const resultText = item.isError
                ? (item.errorMessage || 'Request failed')
                : `${formatNumber(item.result)} ${item.resultUnit || ''}`.trim();

            return `
                <tr>
                    <td>${formatDate(item.createdAt)}</td>
                    <td>${item.operation}</td>
                    <td>${item.measurementType}</td>
                    <td>${formatNumber(item.fromValue)} ${item.fromUnit}</td>
                    <td>${formatNumber(item.toValue)} ${item.toUnit}</td>
                    <td>${resultText}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                </tr>`;
        })
        .join('');
}

function refreshHistoryView() {
    const filtered = getFilteredOperations();
    renderHistoryTable(filtered);
}

async function loadMyOperations(showFeedback = true) {
    const button = qs('#refreshHistoryButton');
    const messageBox = qs('#historyMessage');

    try {
        setButtonLoading(button, true, 'Refreshing...');
        const operations = await quantityApi.getMyOperations();
        state.myOperations = Array.isArray(operations) ? operations : [];
        renderStats(state.myOperations);
        refreshHistoryView();

        if (showFeedback) {
            showInlineMessage(messageBox, 'success', `Loaded ${state.myOperations.length} operation(s) for ${getCurrentUser()?.username || 'your account'}.`);
        } else {
            clearInlineMessage(messageBox);
        }
    } catch (error) {
        state.myOperations = [];
        renderStats([]);
        renderHistoryTable([]);
        showInlineMessage(messageBox, 'error', error.message);
        if (showFeedback) {
            showToast(error.message, 'error');
        }
    } finally {
        setButtonLoading(button, false);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!protectDashboard()) return;

    syncUserBadge();
    qsa('.operation-form').forEach(setupOperationForm);
    ['#historyOperationFilter', '#historyTypeFilter', '#historyStatusFilter'].forEach((selector) => {
        qs(selector)?.addEventListener('change', refreshHistoryView);
    });
    qs('#refreshHistoryButton')?.addEventListener('click', () => loadMyOperations(true));

    await loadMyOperations(true);
});