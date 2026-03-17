const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');

router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get projects involving the user
    const projects = await Project.find({
      $or: [{ owner: userId }, { members: userId }]
    });
    
    const projectIds = projects.map(p => p._id);
    
    // Get all tasks for these projects
    const allTasks = await Task.find({ projectId: { $in: projectIds } });
    
    // Aggregate stats
    const totalProjects = projects.length;
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = allTasks.filter(t => t.status === 'Pending').length;
    const inProgressTasks = allTasks.filter(t => t.status === 'In Progress').length;

    res.json({
      totalProjects,
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
