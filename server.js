const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Data file path
let dataPath;

// Initialize data path based on environment
async function initializeDataPath(userDataPath) {
    dataPath = path.join(userDataPath, 'data.json');
    
    // Check if data directory exists, if not create it
    const dataDir = path.dirname(dataPath);
    try {
        await fs.access(dataDir);
    } catch (error) {
        await fs.mkdir(dataDir, { recursive: true });
    }

    // Check if data file exists, if not create it with initial data
    try {
        await fs.access(dataPath);
    } catch (error) {
        const initialData = {
            expenses: [],
            incomes: [],
            budgets: [],
            categories: {
                expense: ["Food", "Transportation", "Utilities", "Rent", "Entertainment", "Other"],
                income: ["Salary", "Freelance", "Investment", "Bonus", "Other"]
            },
            currencies: ["USD", "NTD", "IDR", "EUR"],
            selectedCurrency: "NTD"
        };
        await fs.writeFile(dataPath, JSON.stringify(initialData, null, 2));
    }
}

// Data operations
async function loadData() {
    try {
        const exists = await fs.access(dataPath).then(() => true).catch(() => false);
        if (exists) {
            const data = await fs.readFile(dataPath, 'utf-8');
            return JSON.parse(data);
        }
        return {
            expenses: [],
            incomes: [],
            budgets: [],
            categories: {
                expense: ["Food", "Transportation", "Utilities", "Rent", "Entertainment", "Other"],
                income: ["Salary", "Freelance", "Investment", "Bonus", "Other"]
            }
        };
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

async function saveData(data) {
    try {
        await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        throw error;
    }
}

// API Routes
// Get all data
app.get('/api/data', async (req, res) => {
    try {
        const data = await loadData();
        console.log('Data loaded:', data); 
        res.json(data);
    } catch (error) {
        console.error('Error loading data:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
});

// Add expense
app.post('/api/expenses', async (req, res) => {
    try {
        const data = await loadData();
        const newExpense = { ...req.body, id: Date.now() };
        data.expenses.push(newExpense);
        await saveData(data);
        res.json(newExpense);
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ error: 'Failed to add expense' });
    }
});

// Edit expense
app.put('/api/expenses/:id', async (req, res) => {
    try {
        const data = await loadData();
        const index = data.expenses.findIndex(exp => exp.id === parseInt(req.params.id));
        if (index !== -1) {
            data.expenses[index] = { ...data.expenses[index], ...req.body };
            await saveData(data);
            res.json(data.expenses[index]);
        } else {
            res.status(404).json({ error: 'Expense not found' });
        }
    } catch (error) {
        console.error('Error editing expense:', error);
        res.status(500).json({ error: 'Failed to edit expense' });
    }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
    try {
        const data = await loadData();
        data.expenses = data.expenses.filter(exp => exp.id !== parseInt(req.params.id));
        await saveData(data);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});

// Add income
app.post('/api/incomes', async (req, res) => {
    try {
        const data = await loadData();
        const newIncome = { ...req.body, id: Date.now() };
        data.incomes.push(newIncome);
        await saveData(data);
        res.json(newIncome);
    } catch (error) {
        console.error('Error adding income:', error);
        res.status(500).json({ error: 'Failed to add income' });
    }
});

// Edit income
app.put('/api/incomes/:id', async (req, res) => {
    try {
        const data = await loadData();
        const index = data.incomes.findIndex(inc => inc.id === parseInt(req.params.id));
        if (index !== -1) {
            data.incomes[index] = { ...data.incomes[index], ...req.body };
            await saveData(data);
            res.json(data.incomes[index]);
        } else {
            res.status(404).json({ error: 'Income not found' });
        }
    } catch (error) {
        console.error('Error editing income:', error);
        res.status(500).json({ error: 'Failed to edit income' });
    }
});

// Delete income
app.delete('/api/incomes/:id', async (req, res) => {
    try {
        const data = await loadData();
        data.incomes = data.incomes.filter(inc => inc.id !== parseInt(req.params.id));
        await saveData(data);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting income:', error);
        res.status(500).json({ error: 'Failed to delete income' });
    }
});

// Add budget
app.post('/api/budgets', async (req, res) => {
    try {
        console.log('Received request to add budget:', req.body);
        const data = await loadData();
        const existingBudgetIndex = data.budgets.findIndex(b => b.month === req.body.month);
        if (existingBudgetIndex !== -1) {
            data.budgets[existingBudgetIndex] = { ...req.body, id: data.budgets[existingBudgetIndex].id };
        } else {
            data.budgets.push({ ...req.body, id: Date.now() });
        }
        await saveData(data);
        console.log('Budget added successfully:', data.budgets);
        res.json(data.budgets);
    } catch (error) {
        console.error('Error adding budget:', error);
        res.status(500).json({ error: 'Failed to add budget' });
    }
});

// Add category
app.post('/api/categories', async (req, res) => {
    try {
        const data = await loadData();
        const { type, name } = req.body;
        if (!data.categories[type].includes(name)) {
            data.categories[type].push(name);
            await saveData(data);
            res.json({ success: true });
        } else {
            res.status(400).json({ error: 'Category already exists' });
        }
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ error: 'Failed to add category' });
    }
});

// Delete category
app.delete('/api/categories/:type/:name', async (req, res) => {
    try {
        const data = await loadData();
        const { type, name } = req.params;
        if (data.categories[type]) {
            data.categories[type] = data.categories[type].filter(category => category !== name);
            await saveData(data);
            res.json({ success: true });
        } else {
            res.status(400).json({ error: 'Invalid category type' });
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// Add currency
app.post('/api/currency', async (req, res) => {
    try {
        const data = await loadData();
        data.selectedCurrency = req.body.selectedCurrency;
        if (!data.currencies) {
            data.currencies = [];
        }
        if (!data.currencies.includes(req.body.selectedCurrency)) {
            data.currencies.push(req.body.selectedCurrency);
        }
        await saveData(data);
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving currency:', error);
        res.status(500).json({ error: 'Failed to save currency' });
    }
});

// Delete currency
app.delete('/api/currency/:currency', async (req, res) => {
    try {
        const data = await loadData();
        const currency = req.params.currency;
        const mainCurrencies = ["USD", "NTD", "IDR", "EUR"];
        if (!mainCurrencies.includes(currency)) {
            data.currencies = data.currencies.filter(curr => curr !== currency);
            await saveData(data);
            res.json({ success: true });
        } else {
            res.status(400).json({ error: 'Cannot delete main currency' });
        }
    } catch (error) {
        console.error('Error deleting currency:', error);
        res.status(500).json({ error: 'Failed to delete currency' });
    }
});

// Start server function
async function startServer(userDataPath) {
    await initializeDataPath(userDataPath);
    return new Promise((resolve, reject) => {
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Data file path: ${dataPath}`);
            resolve(server);
        }).on('error', reject);
    });
}

module.exports = { startServer };