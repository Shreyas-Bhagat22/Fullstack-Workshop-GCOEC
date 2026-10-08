const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
} = require('../controllers/taskController');

// Stats route (MUST be placed before /:id)
router.get('/stats', getTaskStats);

// Tasks collection routes
router.route('/')
  .get(getTasks)
  .post(createTask);

// Task status quick patch route
router.patch('/:id/status', updateTaskStatus);

// Individual task routes by ID
router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
