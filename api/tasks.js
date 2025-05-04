const mongoose = require('mongoose');
const User = require('./user'); // Assuming you have a User model defined in user.js

const TaskSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    title: { type: String, required: true },
    description: String,
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    dueDate: Date,
    isCompleted: { type: Boolean, default: false },
});

const Task = mongoose.model('Task', TaskSchema, 'Tasks');

const getTasks = async (req, res) => {

    const role = req.query.role
    console.log(role)
    //console.log(req)

    if (role === 'individual'){
        try {
            const tasks = await Task.find({ userId: req.user.id });
            console.log(tasks)
            res.json({tasks});
        } catch (err) {
            res.status(500).json({ message: 'Error fetching tasks' });
        }
    }
    else if (role === 'employer'){
        // // Combine own ID and employee IDs
        // const user = await User.findById(req.user.id).lean();
        // const idsToQuery = [req.user.id, ...(user.employees || [])];
        // console.log(idsToQuery)

        // const tasks = await Task.find({ userId: { $in: idsToQuery } });
        // //const tasks = await Task.find({ userId: { $in: req.user.employees } });
        // console.log(tasks)
        // res.json(tasks);

        try {
            const user = await User.findById(req.user.id).lean(); // Fetch the authenticated user
            if (!user) return res.status(404).json({ message: 'User not found' });
        
            const employeeIds = user.employees || [];
        
            // Fetch employees' user data (with email)
            const employees = await User.find({ _id: { $in: employeeIds } }).lean();
        
            // Build a lookup map from userId to email
            const emailMap = {};
            employees.forEach(emp => {
              emailMap[emp._id.toString()] = emp.email;
            });
        
            // Fetch tasks where userId is either the authenticated user or one of their employees
            const tasks = await Task.find({ userId: { $in: [user._id, ...employeeIds] } }).lean();
        
            // Append email to each task based on the userId
            const tasksWithEmail = tasks.map(task => ({
              ...task,
              employeeEmail: emailMap[task.userId.toString()] || 'Unknown'
            }));

            console.log(tasksWithEmail)
        
            res.json({tasks: tasksWithEmail, employees });
          } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error retrieving tasks' });
          }
    } 
}

const createTask = async (req, res) => {
    console.log(req.body)
    const { title, description, priority, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });
    console.log(req.user)

    try {
        const task = new Task({ userId: req.user.id, title, description, priority, dueDate });
        await task.save();
        res.status(201).json({ message: 'Task created', task });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating task' });
    }
}
const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, priority, dueDate, isCompleted } = req.body;

    try {
        const task = await Task.findByIdAndUpdate(id, { title, description, priority, dueDate, isCompleted }, { new: true });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task updated', task });
    } catch (err) {
        res.status(500).json({ message: 'Error updating task' });
    }
}

const deleteTask = async (req, res) => {
    try {
        const deleted = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!deleted) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting task' });
      }
}

module.exports = { getTasks, createTask, updateTask, deleteTask };
