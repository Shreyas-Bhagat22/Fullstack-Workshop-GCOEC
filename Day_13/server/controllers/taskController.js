const { supabase } = require('../config/supabase');

/**
 * Normalizes a database task row for the frontend
 * Provides both camelCase and snake_case, as well as id and _id
 * for 100% backwards compatibility with existing frontend code.
 */
const transformTask = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id, // Ensures existing frontend data-id and state lookups work seamlessly
    title: row.title,
    description: row.description || '',
    priority: row.priority,
    status: row.status,
    category: row.category,
    dueDate: row.due_date,
    due_date: row.due_date,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at
  };
};

/**
 * @desc    Get all tasks with optional search, filter, and sort
 * @route   GET /api/tasks
 */
const getTasks = async (req, res, next) => {
  try {
    const { search, status, priority, category, sortBy, order } = req.query;

    let query = supabase.from('tasks').select('*');

    // 1. Text Search (title or description using case-insensitive ilike)
    if (search && search.trim() !== '') {
      const sanitized = search.trim().replace(/,/g, '');
      query = query.or(`title.ilike.%${sanitized}%,description.ilike.%${sanitized}%`);
    }

    // 2. Status Filter
    if (status && status !== 'All') {
      query = query.eq('status', status);
    }

    // 3. Priority Filter
    if (priority && priority !== 'All') {
      query = query.eq('priority', priority);
    }

    // 4. Category Filter
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    // 5. Sorting
    const isAscending = order === 'asc';

    if (sortBy === 'dueDate') {
      // Ascending due date puts closest due dates first, nulls at the end
      query = query.order('due_date', { ascending: isAscending, nullsFirst: false });
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'title') {
      query = query.order('title', { ascending: isAscending });
    } else if (sortBy === 'createdAt') {
      query = query.order('created_at', { ascending: isAscending });
    } else if (sortBy === 'priority') {
      // Will handle custom High > Medium > Low weight sorting in-memory below
      query = query.order('created_at', { ascending: false });
    } else {
      // Default: newest created tasks first
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      return next(error);
    }

    let tasks = (data || []).map(transformTask);

    // Custom sorting enhancement for priority (High > Medium > Low)
    if (sortBy === 'priority') {
      const priorityWeight = { High: 3, Medium: 2, Low: 1 };
      tasks.sort((a, b) => {
        const weightA = priorityWeight[a.priority] || 0;
        const weightB = priorityWeight[b.priority] || 0;
        return isAscending ? weightA - weightB : weightB - weightA;
      });
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get task dashboard statistics
 * @route   GET /api/tasks/stats
 */
const getTaskStats = async (req, res, next) => {
  try {
    const nowIso = new Date().toISOString();

    const [
      { count: total, error: totalErr },
      { count: pending, error: pendingErr },
      { count: inProgress, error: inProgErr },
      { count: completed, error: compErr },
      { count: overdue, error: overdueErr }
    ] = await Promise.all([
      supabase.from('tasks').select('*', { count: 'exact', head: true }),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'In Progress'),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'Completed'),
      supabase.from('tasks').select('*', { count: 'exact', head: true })
        .neq('status', 'Completed')
        .not('due_date', 'is', null)
        .lt('due_date', nowIso)
    ]);

    const firstError = totalErr || pendingErr || inProgErr || compErr || overdueErr;
    if (firstError) {
      return next(firstError);
    }

    const totalCount = total || 0;
    const pendingCount = pending || 0;
    const inProgressCount = inProgress || 0;
    const completedCount = completed || 0;
    const overdueCount = overdue || 0;
    const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        total: totalCount,
        pending: pendingCount,
        inProgress: inProgressCount,
        completed: completedCount,
        overdue: overdueCount,
        completionPercentage
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 */
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return next(error);
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id: ${id}`
      });
    }

    res.status(200).json({
      success: true,
      data: transformTask(data)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, category, dueDate, due_date } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    const rawDueDate = dueDate !== undefined ? dueDate : due_date;

    const newTaskPayload = {
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'Medium',
      status: status || 'Pending',
      category: category || 'Other',
      due_date: rawDueDate ? new Date(rawDueDate).toISOString() : null
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([newTaskPayload])
      .select()
      .single();

    if (error) {
      return next(error);
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: transformTask(data)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task details
 * @route   PUT /api/tasks/:id
 */
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, category, dueDate, due_date } = req.body;

    if (title !== undefined && title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Task title cannot be empty'
      });
    }

    const rawDueDate = dueDate !== undefined ? dueDate : due_date;

    const updatePayload = {};
    if (title !== undefined) updatePayload.title = title.trim();
    if (description !== undefined) updatePayload.description = description.trim();
    if (priority !== undefined) updatePayload.priority = priority;
    if (status !== undefined) updatePayload.status = status;
    if (category !== undefined) updatePayload.category = category;
    if (dueDate !== undefined || due_date !== undefined) {
      updatePayload.due_date = rawDueDate ? new Date(rawDueDate).toISOString() : null;
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return next(error);
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id: ${id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: transformTask(data)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task status only
 * @route   PATCH /api/tasks/:id/status
 */
const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['Pending', 'In Progress', 'Completed'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return next(error);
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id: ${id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: transformTask(data)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 */
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return next(error);
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id: ${id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: transformTask(data)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
};
