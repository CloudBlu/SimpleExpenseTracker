const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const totalAmount = document.getElementById('total-amount');

let expenses = [];

async function fetchExpenses() {
    const response = await fetch('/api/expenses');
    expenses = await response.json();
    displayExpenses();
}

expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const expenseName = document.getElementById('expense-name').value;
    const expenseAmount = parseFloat(document.getElementById('expense-amount').value);
    const expenseCategory = document.getElementById('expense-category').value;
    const expenseDate = document.getElementById('expense-date').value;

    const expense = { name: expenseName, amount: expenseAmount, category: expenseCategory, date: expenseDate };

    await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
    });

    fetchExpenses();
    expenseForm.reset();
});

async function removeExpense(index) {
    await fetch(`/api/expenses/${index}`, { method: 'DELETE' });
    fetchExpenses();
}

fetchExpenses();

expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const expenseName = document.getElementById('expense-name').value;
    const expenseAmount = parseFloat(document.getElementById('expense-amount').value);
    const expenseCategory = document.getElementById('expense-category').value;
    const expenseDate = document.getElementById('expense-date').value;

    const expense = {
        name: expenseName,
        amount: expenseAmount,
        category: expenseCategory,
        date: expenseDate,
    };

    expenses.push(expense);
    displayExpenses();
    expenseForm.reset();
});

function displayExpenses() {
    expenseList.innerHTML = '';
    let total = 0;

    expenses.forEach((expense, index) => {
        total += expense.amount;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.name}</td>
            <td>$${expense.amount.toFixed(2)}</td>
            <td>${expense.category}</td>
            <td>${expense.date}</td>
            <td><button onclick="removeExpense(${index})">Remove</button></td>
        `;
        expenseList.appendChild(row);
    });

    totalAmount.textContent = total.toFixed(2);
}

function removeExpense(index) {
    expenses.splice(index, 1);
    displayExpenses();
}