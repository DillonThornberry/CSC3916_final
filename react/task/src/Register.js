// React component for user registration
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
//import './Register.css';

const API_URL = (process.env.API_URL || 'http://localhost:5000') + '/api'; // Adjust the URL as needed

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('individual');
    const [employeeEmails, setEmployeeEmails] = useState(['']);
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Hook to programmatically navigate
    
    const handleRegister = async (e) => {
        e.preventDefault();
        const payload = {
          email,
          password,
          role,
          ...(role === 'employer' && { employeeEmails: employeeEmails.filter(Boolean) }),
        };
    
        try {
          const res = await axios.post(`${API_URL}/register`, payload);
          setMessage(res.data.message);
          if (res.data.message === 'User registered') {
            // Redirect to home page after successful registration
            setTimeout(() => navigate('/'), 1000); // Delay navigation to show message
          }
        } catch (err) {
          setMessage(err.response?.data?.message || 'Registration failed');
        }
      };
    
      const handleEmployeeChange = (index, value) => {
        const updated = [...employeeEmails];
        updated[index] = value;
        setEmployeeEmails(updated);
      };
    
      const addEmployeeEmail = () => {
        setEmployeeEmails([...employeeEmails, '']);
      };
    
    return (
        <div className="register-container">
            <button onClick={() => navigate('/')}>Back</button>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <label>
                    <input
                    type="radio"
                    value="individual"
                    checked={role === 'individual'}
                    onChange={() => setRole('individual')}
                    />
                    Individual
                </label>
                <label style={{ marginLeft: '1rem' }}>
                    <input
                    type="radio"
                    value="employer"
                    checked={role === 'employer'}
                    onChange={() => setRole('employer')}
                    />
                    Employer
                </label>

                {role === 'employer' && (
                <div style={{ marginTop: '1rem' }}>
                    <label>Employee Emails:</label><br />
                    {employeeEmails.map((email, idx) => (
                    <div key={idx}>
                        <input
                        placeholder="Employee Email"
                        value={email}
                        onChange={e => handleEmployeeChange(idx, e.target.value)}
                        style={{ marginBottom: '0.5rem' }}
                        />
                    </div>
                    ))}
                    <button type="button" onClick={addEmployeeEmail}>+ Add Employee</button>
                </div>
                )}

                <br /><br />
                <button type="submit">Register</button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
}


export default Register;
