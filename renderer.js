const XLSX = require('xlsx');

window.addEventListener('DOMContentLoaded', async () => {
    const { ipcRenderer } = require('electron');
    let appData = null;
    let editingId = null;

    // Initialize data
    async function initialize() {
        appData = await ipcRenderer.invoke('load-data');
        setupEventListeners();
        
        // Set default month in budget form to current month
        const currentMonth = new Date().toISOString().slice(0, 7);
        document.getElementById('budget-month').value = currentMonth;
        
        renderAll();
    }

    function setupEventListeners() {
        // Expense form submission
        document.getElementById('expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const description = document.getElementById('expense-description').value;
            const amount = document.getElementById('expense-amount').value;
            const category = document.getElementById('expense-category').value;
            const date = document.getElementById('expense-date').value;

            if (editingId) {
                editExpense(editingId, description, amount, category, date);
                editingId = null;
            } else {
                addExpense(description, amount, category, date);
            }
            e.target.reset();
        });

        // Income form submission
        document.getElementById('income-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const description = document.getElementById('income-description').value;
            const amount = document.getElementById('income-amount').value;
            const category = document.getElementById('income-category').value;
            const date = document.getElementById('income-date').value;

            if (editingId) {
                editIncome(editingId, description, amount, category, date);
                editingId = null;
            } else {
                addIncome(description, amount, category, date);
            }
            e.target.reset();
        });

        // Budget form submission
        document.getElementById('budget-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = document.getElementById('budget-amount').value;
            const month = document.getElementById('budget-month').value;
            addBudget(amount, month);
            e.target.reset();
            
            // Reset to current month after submission
            const currentMonth = new Date().toISOString().slice(0, 7);
            document.getElementById('budget-month').value = currentMonth;
        });

        // Category form submission
        document.getElementById('category-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const type = document.getElementById('category-type').value;
            const name = document.getElementById('category-name').value;
            addCategory(type, name);
            e.target.reset();
        });
    }

    // Expense functions
    function addExpense(description, amount, category, date) {
        appData.expenses.push({
            id: Date.now(),
            description,
            amount: parseFloat(amount),
            category,
            date,
            type: 'expense'
        });
        saveAndRender();
    }

    function editExpense(id, description, amount, category, date) {
        const index = appData.expenses.findIndex(exp => exp.id === parseInt(id));
        if (index !== -1) {
            appData.expenses[index] = {
                id: parseInt(id),
                description,
                amount: parseFloat(amount),
                category,
                date,
                type: 'expense'
            };
            saveAndRender();
        }
    }

    function deleteExpense(id) {
        appData.expenses = appData.expenses.filter(exp => exp.id !== parseInt(id));
        saveAndRender();
    }

    // Income functions
    function addIncome(description, amount, category, date) {
        appData.incomes.push({
            id: Date.now(),
            description,
            amount: parseFloat(amount),
            category,
            date,
            type: 'income'
        });
        saveAndRender();
    }

    function editIncome(id, description, amount, category, date) {
        const index = appData.incomes.findIndex(inc => inc.id === parseInt(id));
        if (index !== -1) {
            appData.incomes[index] = {
                id: parseInt(id),
                description,
                amount: parseFloat(amount),
                category,
                date,
                type: 'income'
            };
            saveAndRender();
        }
    }

    function deleteIncome(id) {
        appData.incomes = appData.incomes.filter(inc => inc.id !== parseInt(id));
        saveAndRender();
    }

    // Budget functions
    function addBudget(amount, month) {
        // Remove any existing budget for the same month
        appData.budgets = appData.budgets.filter(b => b.month !== month);
        
        // Add new budget
        appData.budgets.push({
            id: Date.now(),
            amount: parseFloat(amount),
            month
        });
        saveAndRender();
    }

    function checkBudget() {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const currentBudget = appData.budgets.find(b => b.month === currentMonth);
        const warningElement = document.getElementById('budget-warning');
        const currentBudgetElement = document.getElementById('current-budget');
        const expenseSummaryElement = document.getElementById('expense-summary');
        
        if (currentBudget) {
            const totalExpenses = appData.expenses
                .filter(e => e.date.startsWith(currentMonth))
                .reduce((sum, exp) => sum + exp.amount, 0);

            // Display current budget
            currentBudgetElement.innerHTML = `Current Budget for ${formatMonthYear(currentMonth)}: $${currentBudget.amount.toFixed(2)}`;
            
            // Display total expenses
            expenseSummaryElement.innerHTML = `Total Expenses: $${totalExpenses.toFixed(2)}`;
                
            if (totalExpenses > currentBudget.amount) {
                warningElement.innerHTML = 
                    `Warning: You've exceeded the limit! ($${totalExpenses.toFixed(2)} out of $${currentBudget.amount.toFixed(2)})`;
                warningElement.classList.add('active');
            } else {
                warningElement.classList.remove('active');
                warningElement.innerHTML = '';
            }
        } else {
            currentBudgetElement.innerHTML = `No budget set for ${formatMonthYear(currentMonth)}`;
            expenseSummaryElement.innerHTML = '';
            warningElement.classList.remove('active');
        }
    }

    // Category functions
    function addCategory(type, name) {
        if (!appData.categories[type].includes(name)) {
            appData.categories[type].push(name);
            saveAndRender();
        }
    }

    // Render functions
    function renderAll() {
        renderTransactions();
        renderCategories();
        checkBudget();
    }

    function renderTransactions() {
        const tableBody = document.getElementById('transactions-table').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';
        
        const allTransactions = [
            ...appData.expenses.map(e => ({ ...e, type: 'expense' })),
            ...appData.incomes.map(i => ({ ...i, type: 'income' }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        allTransactions.forEach(transaction => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${formatDate(transaction.date)}</td>
                <td>${capitalizeFirst(transaction.type)}</td>
                <td>${transaction.category}</td>
                <td>${transaction.description}</td>
                <td class="${transaction.type === 'income' ? 'income' : 'expense'}">
                    ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                </td>
                <td>
                    <button onclick="startEdit('${transaction.type}', ${transaction.id})">Edit</button>
                    <button onclick="deleteTransaction('${transaction.type}', ${transaction.id})">Delete</button>
                </td>
            `;
        });
    }

    function renderCategories() {
        const expenseSelect = document.getElementById('expense-category');
        const incomeSelect = document.getElementById('income-category');
        
        expenseSelect.innerHTML = '';
        incomeSelect.innerHTML = '';
        
        appData.categories.expense.forEach(category => {
            const option = new Option(category, category);
            expenseSelect.add(option);
        });
        
        appData.categories.income.forEach(category => {
            const option = new Option(category, category);
            incomeSelect.add(option);
        });
    }

    // Utility functions
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    function formatMonthYear(dateString) {
        const date = new Date(dateString + '-01'); // Add day for proper date parsing
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }

    function capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    async function saveAndRender() {
        await ipcRenderer.invoke('save-data', appData);
        renderAll();
    }

    // Make functions globally available for HTML onclick events
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
    
            // Show success message
            alert('Excel file has been exported successfully!');
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export Excel file. Check console for details.');
        }
    };

    // Initialize the application
    initialize();
});