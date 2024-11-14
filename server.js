const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

let expenses = [];

app.get('/api/expenses', (req, res) => {
    res.json(expenses);
});

app.post('/api/expenses', (req, res) => {
    const expense = req.body;
    expenses.push(expense);
    res.status(201).json(expense);
});

app.delete('/api/expenses/:index', (req, res) => {
    const index = req.params.index;
    if (index >= 0 && index < expenses.length) {
        expenses.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).send('Expense not found');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});