const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProjects, createProject, getProjectById, updateProject, deleteProject, addMember } = require('../controllers/projectController');

router.route('/').get(protect, getProjects).post(protect, createProject);
router.route('/:id').get(protect, getProjectById).put(protect, updateProject).delete(protect, deleteProject);
router.route('/:id/members').post(protect, addMember);

module.exports = router;
