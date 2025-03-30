let appData = null;
let editingId = null;
let selectedCurrency = 'NTD';

// API Functions
async function fetchData() {
    try {
        const response = await fetch('http://localhost:3000/api/data');
        appData = await response.json();
        console.log('Fetched data:', appData);
        renderAll();

        selectedCurrency = appData.selectedCurrency || 'NTD'; 
        const currencySelect = document.getElementById('currency-select');
        currencySelect.innerHTML = ''; 
        const defaultCurrencies = ['USD', 'NTD', 'IDR', 'EUR'];
        const currencies = appData.currencies || defaultCurrencies;

        // Ensure default currencies are included
        defaultCurrencies.forEach(currency => {
            if (!currencies.includes(currency)) {
                currencies.push(currency);
            }
        });

        currencies.forEach(currency => {
            const option = new Option(currency, currency);
            currencySelect.add(option);
        });
        currencySelect.value = selectedCurrency;

        // Ensure default categories are included
        const defaultExpenseCategories = ["Food", "Transportation", "Utilities", "Rent", "Entertainment"];
        const defaultIncomeCategories = ["Salary", "Freelance", "Investment", "Bonus", "Other"];

        if (!appData.categories) {
            appData.categories = {
                expense: defaultExpenseCategories,
                income: defaultIncomeCategories
            };
        } else {
            // Merge default categories with existing ones
            appData.categories.expense = [...new Set([...appData.categories.expense, ...defaultExpenseCategories])];
            appData.categories.income = [...new Set([...appData.categories.income, ...defaultIncomeCategories])];
        }

        renderAll();
    } catch (error) {
        console.error('Error fetching data:', error);
        showError('Failed to load data');
    }
}

// Expense Functions
async function addExpense(description, amount, category, date) {
    try {
        const response = await fetch('http://localhost:3000/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description, amount: parseFloat(amount), category, date })
        });
        await response.json();
        await fetchData();
    } catch (error) {
        showError('Failed to add expense');
        {
            appData.expenses.push(expense);
            console.log('Added Expense:', expense);
            console.log('All Expenses:', appData.expenses);
            renderTransactions();
        }
    }
}

async function editExpense(id, description, amount, category, date) {
    try {
        const response = await fetch(`http://localhost:3000/api/expenses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description, amount: parseFloat(amount), category, date })
        });
        await response.json();
        await fetchData();
    } catch (error) {
        showError('Failed to update expense');
    }
}

async function deleteExpense(id) {
    try {
        await fetch(`http://localhost:3000/api/expenses/${id}`, {
            method: 'DELETE'
        });
        await fetchData();
    } catch (error) {
        showError('Failed to delete expense');
    }
}

// Income Functions
async function addIncome(description, amount, category, date) {
    try {
        const response = await fetch('http://localhost:3000/api/incomes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description, amount: parseFloat(amount), category, date })
        });
        await response.json();
        await fetchData();
    } catch (error) {
        showError('Failed to add income');
    }
    {
        appData.incomes.push(income);
        console.log('Added Income:', income);
        console.log('All Incomes:', appData.incomes);
        renderTransactions();
    }
}

async function editIncome(id, description, amount, category, date) {
    try {
        const response = await fetch(`http://localhost:3000/api/incomes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description, amount: parseFloat(amount), category, date })
        });
        await response.json();
        await fetchData();
    } catch (error) {
        showError('Failed to update income');
    }
}

async function deleteIncome(id) {
    try {
        await fetch(`http://localhost:3000/api/incomes/${id}`, {
            method: 'DELETE'
        });
        await fetchData();
    } catch (error) {
        showError('Failed to delete income');
    }
}

// Currency Functions
async function saveCurrency() {
    const currencySelect = document.getElementById('currency-select');
    if (!currencySelect) {
        console.error('Currency select element not found');
        return;
    }
    selectedCurrency = currencySelect.value;
    try {
        await fetch('http://localhost:3000/api/currency', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selectedCurrency })
        });
        await fetchData();
    } catch (error) {
        console.error('Error saving currency:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('custom-currency-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const code = document.getElementById('custom-currency-code').value;
        const currencySelect = document.getElementById('currency-select');
        if (!Array.from(currencySelect.options).some(option => option.value === code)) {
            const option = new Option(code, code);
            currencySelect.add(option);
            currencySelect.value = code;
            await saveCurrency();
        } else {
            showError('Currency already exists');
        }
    });
    setupEventListeners();
    fetchData();
});

//Delete Currency
async function deleteCurrency(currency) {
    try {
        const response = await fetch(`http://localhost:3000/api/currency/${currency}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
            await fetchData();
        } else {
            showError(result.error || 'Failed to delete currency');
        }
    } catch (error) {
        console.error('Error deleting currency:', error);
        showError('Failed to delete currency');
    }
}

// Delete Selected Currency
function deleteSelectedCurrency() {
    const currencySelect = document.getElementById('currency-select');
    const selectedCurrency = currencySelect.value;
    const mainCurrencies = ['USD', 'NTD', 'IDR', 'EUR'];
    if (!mainCurrencies.includes(selectedCurrency)) {
        deleteCurrency(selectedCurrency);
    } else {
        showError('Cannot delete main currency');
    }
}

// Budget Functions
async function addBudget(amount, month) {
    try {
        const response = await fetch('http://localhost:3000/api/budgets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: parseFloat(amount), month })
        });
        await response.json();
        await fetchData();
    } catch (error) {
        console.error('Error adding budget:', error);
        showError('Failed to add budget');
    }
}

// Category Functions
async function addCategory(type, name) {
    try {
        const response = await fetch('http://localhost:3000/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, name })
        });
        await response.json();
        await fetchData();
        renderCategories();
    } catch (error) {
        showError('Failed to add category');
    }
}

// Delete Category
async function deleteCategory(type, name) {
    try {
        const response = await fetch(`http://localhost:3000/api/categories/${type}/${name}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
            await fetchData();
            renderCategories();
        } else {
            showError(result.error || 'Failed to delete category');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        showError('Failed to delete category');
    }
}

// Delete Selected Category
function deleteSelectedCategory() {
    const type = document.getElementById('category-type').value;
    const name = document.getElementById('category-name').value;
    deleteCategory(type, name);
}

// Render Functions
function renderAll() {
    renderTransactions();
    renderCategories();
    checkBudget();
}

function renderTransactions() {
    const tableBody = document.getElementById('transactions-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    console.log('App Data:', appData);
    console.log('Expenses:', appData.expenses);
    console.log('Incomes:', appData.incomes);
    
    const allTransactions = [
        ...appData.expenses.map(e => ({ ...e, type: 'expense' })),
        ...appData.incomes.map(i => ({ ...i, type: 'income' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    allTransactions.forEach(transaction => {
        console.log('Processing Transaction:', transaction);
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${capitalizeFirst(transaction.type)}</td>
            <td>${transaction.category}</td>
            <td>${transaction.description}</td>
            <td class="${transaction.type === 'income' ? 'income' : 'expense'}">
                ${transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)} ${selectedCurrency}
            </td>
            <td>
                <button onclick="window.startEdit('${transaction.type}', ${transaction.id})">Edit</button>
                <button onclick="window.deleteTransaction('${transaction.type}', ${transaction.id})">Delete</button>
            </td>
        `;
    });
}

function renderCategories() {
    const expenseSelect = document.getElementById('expense-category');
    const incomeSelect = document.getElementById('income-category');
    
    expenseSelect.innerHTML = '';
    incomeSelect.innerHTML = '';

    if (appData && appData.categories) {
        console.log('Expense Categories:', appData.categories.expense);
        console.log('Income Categories:', appData.categories.income);

        appData.categories.expense.forEach(category => {
            const option = new Option(category, category);
            expenseSelect.add(option);
        });

        appData.categories.income.forEach(category => {
            const option = new Option(category, category);
            incomeSelect.add(option);
        });
    }
}

function checkBudget() {
    const currentBudgetDiv = document.getElementById('current-budget');
    const budgetWarningDiv = document.getElementById('budget-warning');
    const expenseSummaryDiv = document.getElementById('expense-summary');

    if (appData && appData.budgets.length > 0) {
        const currentBudget = appData.budgets[0];
        currentBudgetDiv.textContent = `Current Budget: ${currentBudget.amount} ${selectedCurrency} for ${currentBudget.month}`;
        const totalExpenses = appData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        expenseSummaryDiv.textContent = `Total Expenses: ${totalExpenses} ${selectedCurrency}`;

        if (totalExpenses > currentBudget.amount) {
            budgetWarningDiv.textContent = 'Warning: You have exceeded your budget!';
            budgetWarningDiv.classList.add('active');
        } else {
            budgetWarningDiv.classList.remove('active');
            budgetWarningDiv.textContent = '';
        }
    } else {
        currentBudgetDiv.textContent = 'No budget set.';
        budgetWarningDiv.textContent = '';
        expenseSummaryDiv.textContent = '';
    }
}

// Event Listeners Setup
function setupEventListeners() {
    document.getElementById('budget-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const amount = parseFloat(document.getElementById('budget-amount').value);
        const month = document.getElementById('budget-month').value;
        await addBudget(amount, month);
        fetchData();
    });

    document.getElementById('expense-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const description = document.getElementById('expense-description').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = document.getElementById('expense-category').value;
        const date = document.getElementById('expense-date').value;

        if (editingId) {
            await editExpense(editingId, description, amount, category, date);
            editingId = null;
        } else {
            await addExpense(description, amount, category, date);
        }
        form.reset();
        fetchData();
    });

    document.getElementById('income-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const description = document.getElementById('income-description').value;
        const amount = parseFloat(document.getElementById('income-amount').value);
        const category = document.getElementById('income-category').value;
        const date = document.getElementById('income-date').value;

        if (editingId) {
            await editIncome(editingId, description, amount, category, date);
            editingId = null;
        } else {
            await addIncome(description, amount, category, date);
        }
        fetchData();
        form.reset();
    });

    document.getElementById('category-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const type = document.getElementById('category-type').value;
        const name = document.getElementById('category-name').value;
        await addCategory(type, name);
        fetchData();
    });
}

// Utility Functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function showError(message) {
    alert(message);
}

// Global Functions (for HTML onclick events)
window.startEdit = function(type, id) {
    editingId = id;
    const item = type === 'expense' 
        ? appData.expenses.find(e => e.id === parseInt(id))
        : appData.incomes.find(i => i.id === parseInt(id));
    
    if (item) {
        const form = document.getElementById(type + '-form');
        form.querySelector('#' + type + '-description').value = item.description;
        form.querySelector('#' + type + '-amount').value = item.amount;
        form.querySelector('#' + type + '-category').value = item.category;
        form.querySelector('#' + type + '-date').value = item.date;
    }
};

window.deleteTransaction = function(type, id) {
    if (type === 'expense') {
        deleteExpense(id);
    } else {
        deleteIncome(id);
    }
};

window.exportToExcel = function() {
    try {
        const allTransactions = [
            ...appData.expenses.map(e => ({ ...e, type: 'Expense' })),
            ...appData.incomes.map(i => ({ ...i, type: 'Income' }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        // Create formatted data for Excel
        const excelData = allTransactions.map(t => ({
            Date: formatDate(t.date),
            Type: t.type,
            Category: t.category,
            Description: t.description,
            Amount: t.type === 'Expense' ? -t.amount : t.amount
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Transactions");

        // Generate file name with date
        const fileName = `expense_tracker_${new Date().toISOString().slice(0,10)}.xlsx`;

        // Write file
        XLSX.writeFile(wb, fileName);

        alert('Excel file has been exported successfully!');
    } catch (error) {
        console.error('Export error:', error);
        showError('Failed to export Excel file');
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    fetchData();
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    document.getElementById('budget-month').value = currentMonth;
});