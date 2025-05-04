import React, { useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Register from './Register';
import Tasks from './Tasks';

const API_URL = 'http://localhost:5000/api'

function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e, endpoint) => {
    e.preventDefault();
    try {
      console.log(API_URL)
      const res = await axios.post(`${API_URL}/${endpoint}`, { email, password });
      setMessage(res.data.message);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        navigate('/tasks');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Sign In or Register</h2>
      <form>
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        /><br />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        /><br />
        <button onClick={(e) => handleSubmit(e, 'signin')}>Sign In</button>

        <button onClick={() => navigate('/register')}>Register</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tasks" element={<Tasks />} />
      </Routes>
    </Router>
  );
  
}

export default App;
