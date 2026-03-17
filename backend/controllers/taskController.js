const Task = require('../models/Task');
const Project = require('../models/Project');

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('assignees', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, projectId, assignees, status, priority, deadline } = req.body;
    
    // Check project access
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const task = await Task.create({
      title,
      projectId,
      assignees: assignees || [],
      status: status || 'Pending',
      priority: priority || 'Medium',
      deadline
    });
    
    const populatedTask = await Task.findById(task._id).populate('assignees', 'name email');
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, assignees, status, priority, deadline } = req.body;
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.title = title || task.title;
    task.assignees = assignees || task.assignees;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.deadline = deadline || task.deadline;

    await task.save();
    
    const updatedTask = await Task.findById(task._id).populate('assignees', 'name email');
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
