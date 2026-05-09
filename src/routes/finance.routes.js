const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Unified Transactions (Legacy Support for Flutter UI)
router.get('/transactions', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM expenses ORDER BY date DESC');
    // Map database fields to Flutter model fields
    const mapped = result.rows.map(r => ({
      ...r,
      type: 'expense'
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/transactions', async (req, res) => {
  const { user_id, title, amount, category, date, type } = req.body;
  try {
    const defaultUserRes = await db.query('SELECT id FROM users LIMIT 1');
    const finalUserId = user_id || (defaultUserRes.rows[0] ? defaultUserRes.rows[0].id : null);

    // For now, treat all transactions from this endpoint as expenses
    const result = await db.query(
      'INSERT INTO expenses (user_id, title, amount, category, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [finalUserId, title, amount, category || 'misc', date || new Date()]
    );
    res.status(201).json({ ...result.rows[0], type: 'expense' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Finance Overview (Aggregated)
router.get('/overview', async (req, res) => {
  try {
    const expenses = await db.query('SELECT COALESCE(SUM(amount), 0) as total FROM expenses');
    const income = await db.query('SELECT COALESCE(SUM(amount), 0) as total FROM income');
    const debts = await db.query('SELECT COALESCE(SUM(amount), 0) as total FROM debts WHERE status = \'pending\'');
    
    res.json({
      balance: parseFloat(income.rows[0].total) - parseFloat(expenses.rows[0].total),
      totalExpenses: parseFloat(expenses.rows[0].total),
      totalIncome: parseFloat(income.rows[0].total),
      pendingDebts: parseFloat(debts.rows[0].total)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Expenses
router.get('/expenses', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM expenses ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/expenses', async (req, res) => {
  const { user_id, title, amount, category, date, metadata } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO expenses (user_id, title, amount, category, date, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, title, amount, category, date || new Date(), metadata || {}]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debts
router.get('/debts', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM debts ORDER BY due_date ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/debts', async (req, res) => {
  const { user_id, creditor_debtor, amount, due_date, type, status } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO debts (user_id, creditor_debtor, amount, due_date, type, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, creditor_debtor, amount, due_date, type || 'to_pay', status || 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
