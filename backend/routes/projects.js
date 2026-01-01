const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { validateProjectCreate, validateProjectUpdate } = require('../middleware/validation');
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

// All routes require authentication
router.use(authMiddleware);

// POST /api/projects - Create a new project
router.post('/', validateProjectCreate, createProject);

// GET /api/projects - Get all projects for authenticated user
router.get('/', getAllProjects);

// GET /api/projects/:id - Get a project by ID
router.get('/:id', getProjectById);

// PUT /api/projects/:id - Update a project
router.put('/:id', validateProjectUpdate, updateProject);

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', deleteProject);

module.exports = router;
