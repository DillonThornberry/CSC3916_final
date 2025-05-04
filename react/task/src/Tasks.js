import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Task from './Task';
import { useNavigate } from 'react-router-dom';

const API_URL = (process.env.API_URL || 'http://localhost:5000') + '/api';

function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [message, setMessage] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [dueDate, setDueDate] = useState('');
    const [employeeEmail, setEmployeeEmail] = useState('');
    const [employees, setEmployees] = useState([]);

    //const employees = JSON.parse(localStorage.getItem('employees')) || [];
    const role = localStorage.getItem('role') || 'individual';

    // const { state } = useLocation();
    // const employees = state?.employees || [];
    // const role = state?.role || 'individual';

    const navigate = useNavigate();

    const handleSignOut = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    useEffect(() => {
        const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/tasks?role=${role}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
            });
            console.log(res.data)
            setTasks(res.data.tasks);
            setEmployees(res.data.employees);
        } catch (err) {
            setMessage('Failed to fetch tasks');
        }
        };

        fetchTasks();

        
    }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage('Title is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/tasks`, {
        title,
        description,
        priority,
        dueDate,
        employeeEmail,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTasks(prev => [...prev, res.data.task]);
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setDueDate('');
      setMessage('Task added successfully');
      setEmployeeEmail('');
    } catch (err) {
      setMessage('Failed to add task');
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(prev => prev.filter(task => task._id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      setMessage('Failed to delete task');
    }
  };

  const handleComplete = async (id, complete) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.put(`${API_URL}/tasks/${id}`, { isCompleted: !complete }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(res.data)
      setTasks(prev =>
        prev.map(task => task._id === id ? res.data.task : task)
      );
    } catch (err) {
      console.error('Mark complete failed', err);
      setMessage('Failed to mark task as completed');
    }
  };

  

  return (
    <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
      <h2>Tasks</h2>
      
      <ul>
        {tasks.map(task => (
            <Task key={task._id} task={task} onDelete={handleDelete} onComplete={handleComplete}/>
        )).sort((a, b) => {
            if (a.props.task.isCompleted && !b.props.task.isCompleted) return 1;
            if (!a.props.task.isCompleted && b.props.task.isCompleted) return -1;
            // if (a.props.task.priority !== b.props.task.priority) {
            //     const priorities = ['Low', 'Medium', 'High'];
            //     return priorities.indexOf(a.props.task.priority) - priorities.indexOf(b.props.task.priority);
            // }
            const dateA = new Date(a.props.task.dueDate || 0).getTime();
            const dateB = new Date(b.props.task.dueDate || 0).getTime();
            return dateA - dateB;
        })}
      </ul>

      <h3>Add New Task</h3>


      {/* Add Task Form */}
      <form onSubmit={handleAddTask} style={{ marginBottom: '2rem' }}>
        <input
          placeholder="Title *"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        /><br />

        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        /><br />

        <label>
          Priority:
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </label><br />

        <label>
          Due Date:
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </label><br />

        {role === 'employer' && (
          <label>
            Assign to Employee:
            <select value={employeeEmail} onChange={e => setEmployeeEmail(e.target.value)}>
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp.email}>{emp.email}</option>
              ))}
            </select>
          </label>
        )}

        <button type="submit">Add Task</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Tasks;