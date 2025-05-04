const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const verifyToken = require('./auth'); // Assuming you have an auth.js file for token verification
const { getTasks, createTask, updateTask, deleteTask } = require('./tasks');
const User = require('./user'); 
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(console.error);
  

// Register route
app.post('/api/register', async (req, res) => {
  console.log('Registering user:', req.body);
  const { email, password, role, employeeEmails = [] } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ email, password: hashedPassword, role });

  if (role === 'employer') {
    console.log('employer')
    // Look up existing employees by email
    const employeeUsers = await User.find({ email: { $in: employeeEmails } });

    newUser.employees = employeeUsers.map(u => u._id);
  }

  await newUser.save();
  res.status(201).json({ message: 'User registered' });
});

// Sign-in route
app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  console.log('employee', user.employees)
  res.json({ message: 'Sign in successful', token, id: user._id, role: user.role, employees: user.employees });
});

app.get('/api/tasks', verifyToken, (req, res) => {
  getTasks(req, res);
});

app.post('/api/tasks', verifyToken, (req, res) => {
  createTask(req, res);
});

app.put('/api/tasks/:id', verifyToken, (req, res) => {
  updateTask(req, res);
});

app.delete('/api/tasks/:id', verifyToken, async (req, res) => {
  deleteTask(req, res);
});

app.listen(process.env.PORT || 5000, () => console.log('Server running'));

module.exports = User;