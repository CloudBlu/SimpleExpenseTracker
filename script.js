const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const totalAmount = document.getElementById('total-amount');

let expenses = [];

async function fetchExpenses() {
    try {
        const response = await fetch('/api/expenses');
        if (!response.ok) throw new Error('Network response was not ok');
        expenses = await response.json();
        displayExpenses();
    } catch (error) {
        console.error('Error fetching expenses:', error);
    }
}

expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const expenseName = document.getElementById('expense-name').value;
    const expenseAmount = parseFloat(document.getElementById('expense-amount').value);
    const expenseCategory = document.getElementById('expense-category').value;
    const expenseDate = document.getElementById('expense-date').value;

    const expense = { name: expenseName, amount: expenseAmount, category: expenseCategory, date: expenseDate };

    try {
        await fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense),
        });
        fetchExpenses();
        expenseForm.reset();
    } catch (error) {
        console.error('Error adding expense:', error);
    }
});

async function removeExpense(index) {
    try {
        await fetch(`/api/expenses/${index}`, { method: 'DELETE' });
        expenses.splice(index, 1); // Remove from local array
        displayExpenses();
    } catch (error) {
        console.error('Error removing expense:', error);
    }
}

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

// Initial fetch to load expenses
fetchExpenses();