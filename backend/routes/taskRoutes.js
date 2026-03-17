const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

router.route('/').post(protect, createTask);
router.route('/project/:projectId').get(protect, getTasks);
router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);

module.exports = router;
