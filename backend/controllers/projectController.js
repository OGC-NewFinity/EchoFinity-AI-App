const { Project } = require('../models');

/**
 * Create a new project
 * POST /api/projects
 */
const createProject = async (req, res, next) => {
  try {
    const { title, description, status, clips } = req.body;
    const userId = req.userId;

    // Create project
    const project = await Project.create({
      title,
      description,
      status: status || 'draft',
      clips: clips || null,
      userId,
    });

    res.status(201).json({
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all projects for the authenticated user
 * GET /api/projects
 */
const getAllProjects = async (req, res, next) => {
  try {
    const userId = req.userId;

    const projects = await Project.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    res.json({
      message: 'Projects retrieved successfully',
      projects,
      count: projects.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a project by ID (only if owned by user)
 * GET /api/projects/:id
 */
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const project = await Project.findOne({
      where: { id, userId },
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found or you do not have access to it',
      });
    }

    res.json({
      message: 'Project retrieved successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a project (only if owned by user)
 * PUT /api/projects/:id
 */
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { title, description, status, clips } = req.body;

    // Find project and verify ownership
    const project = await Project.findOne({
      where: { id, userId },
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found or you do not have access to it',
      });
    }

    // Update allowed fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (clips !== undefined) updateData.clips = clips;

    // Update project
    await project.update(updateData);

    // Reload to get updated data
    await project.reload();

    res.json({
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a project (only if owned by user)
 * DELETE /api/projects/:id
 */
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Find project and verify ownership
    const project = await Project.findOne({
      where: { id, userId },
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found or you do not have access to it',
      });
    }

    // Delete project
    await project.destroy();

    res.json({
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
