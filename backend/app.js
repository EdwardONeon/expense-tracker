require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const Expense = require('./model/expense');
const cors = require('cors');
const bodyParser = require('body-parser');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('successfully connected to database.')
  }).catch(err => {
    console.log('connection failed.')
    console.log(err);
  });

// Enable body parser
app.use(bodyParser.json())
// Enable CORS
app.use(cors());

// Get all expenses from database
app.get('/expenses', async (req, res) => {
  const expenses = await Expense.find({});
  res.json(expenses);
});

// Add a new expense
app.post('/expense', async (req, res) => {
  const expense = new Expense({
    description: req.body.description,
    amount: req.body.amount
  });
  await expense.save();
  res.status(200).send(`${expense.description} is stored.`)
});

// Delete a expense by its description
app.delete('/expenses/del/', async (req, res) => {
  const description = req.body.description;
  try {
    const deleteRes = await Expense.findOneAndDelete({ description: description }).exec();
    if (deleteRes) {
      res.status(200).send(`${description} is deleted`);
    } else {
      res.status(404).send(`${description} not found`);
    }

  } catch (e) {
    res.status(500).send(e.message)
  }

});

// Update an expense with either new name or/and new amount
app.put('/expense/update/:dscp', async (req, res) => {
  const filter = { description: req.params.dscp };
  const update = { description: req.body.description, amount: req.body.amount };
  try {
    const doc = await Expense.findOneAndUpdate(filter, update, { new: true });
    if (doc) {
      res.status(200).send(`${req.params.dscp} is updated to ${req.body.description} with amount ${req.body.amount}`);
    } else {
      res.status(404).send(`${req.params.dscp} not found`)
    }
  } catch (e) {
    res.status(500).send(e.message)
  }

});

app.listen(port);
