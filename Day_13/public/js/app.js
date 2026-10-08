/**
 * TaskFlow - Frontend Client Application
 * Vanilla JavaScript implementation for Task Manager Dashboard
 */

// ==========================================================================
// Application State
// ==========================================================================
const state = {
  tasks: [],
  filters: {
    search: '',
    status: 'All',
    priority: 'All',
    category: 'All',
    sortBy: 'createdAt',
    order: 'desc'
  },
  stats: {
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    completionPercentage: 0
  },
  editingTaskId: null,
  deletingTaskId: null,
  isLoading: false,
  searchDebounceTimer: null
};

// ==========================================================================
// DOM Element Selectors
// ==========================================================================
const DOM = {
  // Theme Toggle
  themeToggleBtn: document.getElementById('themeToggleBtn'),

  // Alerts
  dbAlertBanner: document.getElementById('dbAlertBanner'),
  dbAlertMessage: document.getElementById('dbAlertMessage'),

  // Dashboard Stats
  statTotal: document.getElementById('statTotal'),
  statPending: document.getElementById('statPending'),
  statInProgress: document.getElementById('statInProgress'),
  statCompleted: document.getElementById('statCompleted'),
  statOverdue: document.getElementById('statOverdue'),
  completionPctText: document.getElementById('completionPctText'),
  progressBarFill: document.getElementById('progressBarFill'),
  progressBarContainer: document.getElementById('progressBarContainer'),

  // Search & Filters
  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  statusFilterPills: document.querySelectorAll('.filter-pill'),
  priorityFilter: document.getElementById('priorityFilter'),
  categoryFilter: document.getElementById('categoryFilter'),
  sortBySelect: document.getElementById('sortBySelect'),
  resetFiltersBtn: document.getElementById('resetFiltersBtn'),

  // List States & Containers
  tasksCountBadge: document.getElementById('tasksCountBadge'),
  loadingState: document.getElementById('loadingState'),
  emptyState: document.getElementById('emptyState'),
  noResultsState: document.getElementById('noResultsState'),
  taskGrid: document.getElementById('taskGrid'),
  emptyStateAddBtn: document.getElementById('emptyStateAddBtn'),
  clearFilterMatchBtn: document.getElementById('clearFilterMatchBtn'),

  // Task Form Modal
  taskModal: document.getElementById('taskModal'),
  openAddTaskModalBtn: document.getElementById('openAddTaskModalBtn'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  cancelModalBtn: document.getElementById('cancelModalBtn'),
  taskForm: document.getElementById('taskForm'),
  modalTitle: document.getElementById('modalTitle'),
  taskIdInput: document.getElementById('taskIdInput'),
  taskTitle: document.getElementById('taskTitle'),
  taskDescription: document.getElementById('taskDescription'),
  taskPriority: document.getElementById('taskPriority'),
  taskStatus: document.getElementById('taskStatus'),
  taskCategory: document.getElementById('taskCategory'),
  taskDueDate: document.getElementById('taskDueDate'),
  titleError: document.getElementById('titleError'),
  saveTaskBtn: document.getElementById('saveTaskBtn'),

  // Delete Modal
  deleteModal: document.getElementById('deleteModal'),
  deleteTaskTitle: document.getElementById('deleteTaskTitle'),
  closeDeleteModalBtn: document.getElementById('closeDeleteModalBtn'),
  cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
  confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),

  // Toast Container
  toastContainer: document.getElementById('toastContainer')
};

// ==========================================================================
// Theme Management (Dark / Light Mode)
// ==========================================================================
function initTheme() {
  const savedTheme = localStorage.getItem('taskflow_theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = prefersDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', initialTheme);
    localStorage.setItem('taskflow_theme', initialTheme);
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('taskflow_theme', newTheme);
}

// ==========================================================================
// Toast Notification System
// ==========================================================================
function showToast(message, type = 'info', duration = 3500) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-content">${escapeHtml(message)}</div>
    <button class="toast-close" aria-label="Dismiss">&times;</button>
  `;

  DOM.toastContainer.appendChild(toast);

  const removeToast = () => {
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 250);
  };

  const timer = setTimeout(removeToast, duration);

  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(timer);
    removeToast();
  });
}

// ==========================================================================
// API Client Functions (fetch)
// ==========================================================================
const API_BASE = '/api/tasks';

/**
 * Fetch all tasks matching current state filters
 */
async function fetchTasks() {
  try {
    setLoading(true);

    const params = new URLSearchParams();
    if (state.filters.search.trim()) params.append('search', state.filters.search.trim());
    if (state.filters.status && state.filters.status !== 'All') params.append('status', state.filters.status);
    if (state.filters.priority && state.filters.priority !== 'All') params.append('priority', state.filters.priority);
    if (state.filters.category && state.filters.category !== 'All') params.append('category', state.filters.category);
    if (state.filters.sortBy) params.append('sortBy', state.filters.sortBy);

    // Sorting order
    if (state.filters.sortBy === 'title') {
      params.append('order', 'asc');
    } else if (state.filters.sortBy === 'dueDate') {
      params.append('order', 'asc');
    } else {
      params.append('order', 'desc');
    }

    const response = await fetch(`${API_BASE}?${params.toString()}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch tasks');
    }

    state.tasks = result.data || [];
    renderTasks();
    hideDbAlert();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    showDbAlert(error.message);
    showToast(`Error: ${error.message}`, 'error');
  } finally {
    setLoading(false);
  }
}

/**
 * Fetch task dashboard stats
 */
async function fetchStats() {
  try {
    const response = await fetch(`${API_BASE}/stats`);
    const result = await response.json();

    if (response.ok && result.success) {
      state.stats = result.data;
      renderStats();
    }
  } catch (error) {
    console.error('Error fetching statistics:', error);
  }
}

/**
 * Create a new task
 */
async function apiCreateTask(taskData) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  return handleApiResponse(response);
}

/**
 * Update an existing task
 */
async function apiUpdateTask(id, taskData) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  return handleApiResponse(response);
}

/**
 * Update task status only
 */
async function apiUpdateTaskStatus(id, status) {
  const response = await fetch(`${API_BASE}/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return handleApiResponse(response);
}

/**
 * Delete a task
 */
async function apiDeleteTask(id) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE'
  });
  return handleApiResponse(response);
}

async function handleApiResponse(response) {
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'An error occurred with the request');
  }
  return result;
}

// ==========================================================================
// Rendering Logic
// ==========================================================================

function renderStats() {
  const { total, pending, inProgress, completed, overdue, completionPercentage } = state.stats;

  DOM.statTotal.textContent = total;
  DOM.statPending.textContent = pending;
  DOM.statInProgress.textContent = inProgress;
  DOM.statCompleted.textContent = completed;
  DOM.statOverdue.textContent = overdue;

  DOM.completionPctText.textContent = `${completionPercentage}%`;
  DOM.progressBarFill.style.width = `${completionPercentage}%`;
  DOM.progressBarContainer.setAttribute('aria-valuenow', completionPercentage);
}

function renderTasks() {
  const hasTasks = state.tasks.length > 0;
  const isFiltering =
    state.filters.search.trim() !== '' ||
    state.filters.status !== 'All' ||
    state.filters.priority !== 'All' ||
    state.filters.category !== 'All';

  DOM.tasksCountBadge.textContent = `${state.tasks.length} task${state.tasks.length === 1 ? '' : 's'}`;

  if (!hasTasks) {
    DOM.taskGrid.style.display = 'none';
    if (isFiltering) {
      DOM.emptyState.style.display = 'none';
      DOM.noResultsState.style.display = 'flex';
    } else {
      DOM.noResultsState.style.display = 'none';
      DOM.emptyState.style.display = 'flex';
    }
    return;
  }

  DOM.emptyState.style.display = 'none';
  DOM.noResultsState.style.display = 'none';
  DOM.taskGrid.style.display = 'grid';

  DOM.taskGrid.innerHTML = state.tasks.map(task => createTaskCardHTML(task)).join('');

  // Attach event listeners to card buttons
  attachCardEventListeners();
}

function isTaskOverdue(task) {
  if (!task.dueDate || task.status === 'Completed') return false;
  const due = new Date(task.dueDate);
  // Compare end of due date day with current time
  const now = new Date();
  return due < now;
}

function createTaskCardHTML(task) {
  const taskId = task.id || task._id;
  const isCompleted = task.status === 'Completed';
  const overdue = isTaskOverdue(task);

  // Status badge class
  let statusBadgeClass = 'badge-status-pending';
  if (task.status === 'In Progress') statusBadgeClass = 'badge-status-progress';
  if (task.status === 'Completed') statusBadgeClass = 'badge-status-completed';

  // Priority badge class
  const priorityClass = `badge-priority-${task.priority.toLowerCase()}`;

  // Formatted Dates
  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'No due date';

  const formattedCreated = new Date(task.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return `
    <article class="task-card ${isCompleted ? 'is-completed' : ''} ${overdue ? 'is-overdue-card' : ''}" data-id="${taskId}">
      <div class="task-card-header">
        <div class="badges-group">
          <span class="badge ${statusBadgeClass}">
            ${escapeHtml(task.status)}
          </span>
          <span class="badge ${priorityClass}">
            ${escapeHtml(task.priority)}
          </span>
          ${overdue ? `
            <span class="badge badge-overdue" title="Task is past its due date">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Overdue
            </span>
          ` : ''}
        </div>
        <span class="category-chip">${escapeHtml(task.category)}</span>
      </div>

      <div class="task-title-row">
        <input 
          type="checkbox" 
          class="status-checkbox" 
          ${isCompleted ? 'checked' : ''} 
          data-id="${taskId}"
          title="Toggle Complete / Pending"
          aria-label="Mark task as ${isCompleted ? 'pending' : 'completed'}"
        >
        <h4 class="task-title">${escapeHtml(task.title)}</h4>
      </div>

      ${task.description ? `<p class="task-desc">${escapeHtml(task.description)}</p>` : '<p class="task-desc"></p>'}

      <div class="task-meta">
        <div class="meta-date-wrap">
          <span class="meta-due-date ${overdue ? 'is-overdue' : ''}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Due: ${formattedDueDate}
          </span>
          <span class="meta-created-date">Created ${formattedCreated}</span>
        </div>

        <div class="task-actions">
          <!-- Quick Status Changer -->
          <select class="quick-status-select" data-id="${taskId}" aria-label="Change status">
            <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>

          <!-- Edit Button -->
          <button class="action-btn edit-btn" data-id="${taskId}" title="Edit Task" aria-label="Edit Task">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>

          <!-- Delete Button -->
          <button class="action-btn delete-btn" data-id="${taskId}" title="Delete Task" aria-label="Delete Task">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    </article>
  `;
}

function attachCardEventListeners() {
  // Checkbox status toggle
  document.querySelectorAll('.status-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', async (e) => {
      const id = e.target.getAttribute('data-id');
      const newStatus = e.target.checked ? 'Completed' : 'Pending';
      await handleQuickStatusChange(id, newStatus);
    });
  });

  // Select status quick change
  document.querySelectorAll('.quick-status-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const id = e.target.getAttribute('data-id');
      const newStatus = e.target.value;
      await handleQuickStatusChange(id, newStatus);
    });
  });

  // Edit button
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      openEditTaskModal(id);
    });
  });

  // Delete button
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      openDeleteConfirmation(id);
    });
  });
}

async function handleQuickStatusChange(id, newStatus) {
  try {
    const result = await apiUpdateTaskStatus(id, newStatus);
    showToast(`Task marked as ${newStatus}`, 'success');
    
    // Refresh task list and stats dynamically
    await Promise.all([fetchTasks(), fetchStats()]);
  } catch (error) {
    showToast(`Failed to update status: ${error.message}`, 'error');
    // Revert visually by refetching
    await fetchTasks();
  }
}

// ==========================================================================
// Modal Management (Add / Edit)
// ==========================================================================

function openAddTaskModal() {
  state.editingTaskId = null;
  DOM.modalTitle.textContent = 'Add New Task';
  DOM.saveTaskBtn.querySelector('.btn-text').textContent = 'Add Task';
  DOM.taskIdInput.value = '';
  DOM.taskForm.reset();
  DOM.titleError.textContent = '';
  DOM.taskPriority.value = 'Medium';
  DOM.taskStatus.value = 'Pending';
  DOM.taskCategory.value = 'Personal';

  DOM.taskModal.classList.add('open');
  DOM.taskModal.setAttribute('aria-hidden', 'false');
  setTimeout(() => DOM.taskTitle.focus(), 100);
}

function openEditTaskModal(id) {
  const task = state.tasks.find(t => (t.id || t._id) === id);
  if (!task) return;

  const taskId = task.id || task._id;
  state.editingTaskId = taskId;
  DOM.modalTitle.textContent = 'Edit Task';
  DOM.saveTaskBtn.querySelector('.btn-text').textContent = 'Save Changes';
  DOM.taskIdInput.value = taskId;
  DOM.taskTitle.value = task.title;
  DOM.taskDescription.value = task.description || '';
  DOM.taskPriority.value = task.priority;
  DOM.taskStatus.value = task.status;
  DOM.taskCategory.value = task.category;
  DOM.titleError.textContent = '';

  if (task.dueDate) {
    // Format to YYYY-MM-DD for date input
    const d = new Date(task.dueDate);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    DOM.taskDueDate.value = `${year}-${month}-${day}`;
  } else {
    DOM.taskDueDate.value = '';
  }

  DOM.taskModal.classList.add('open');
  DOM.taskModal.setAttribute('aria-hidden', 'false');
  setTimeout(() => DOM.taskTitle.focus(), 100);
}

function closeTaskModal() {
  DOM.taskModal.classList.remove('open');
  DOM.taskModal.setAttribute('aria-hidden', 'true');
  state.editingTaskId = null;
  DOM.taskForm.reset();
  DOM.titleError.textContent = '';
}

// ==========================================================================
// Delete Modal Management
// ==========================================================================

function openDeleteConfirmation(id) {
  const task = state.tasks.find(t => (t.id || t._id) === id);
  if (!task) return;

  state.deletingTaskId = task.id || task._id;
  DOM.deleteTaskTitle.textContent = `"${task.title}"`;
  DOM.deleteModal.classList.add('open');
  DOM.deleteModal.setAttribute('aria-hidden', 'false');
}

function closeDeleteModal() {
  DOM.deleteModal.classList.remove('open');
  DOM.deleteModal.setAttribute('aria-hidden', 'true');
  state.deletingTaskId = null;
}

async function handleConfirmDelete() {
  if (!state.deletingTaskId) return;

  const btnText = DOM.confirmDeleteBtn.querySelector('.btn-text');
  const btnSpinner = DOM.confirmDeleteBtn.querySelector('.btn-spinner');

  try {
    DOM.confirmDeleteBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';

    await apiDeleteTask(state.deletingTaskId);
    showToast('Task deleted successfully', 'success');

    closeDeleteModal();
    await Promise.all([fetchTasks(), fetchStats()]);
  } catch (error) {
    showToast(`Error deleting task: ${error.message}`, 'error');
  } finally {
    DOM.confirmDeleteBtn.disabled = false;
    btnText.style.display = 'inline-block';
    btnSpinner.style.display = 'none';
  }
}

// ==========================================================================
// Form Submission (Create / Edit)
// ==========================================================================

async function handleTaskFormSubmit(e) {
  e.preventDefault();

  const title = DOM.taskTitle.value.trim();
  if (!title) {
    DOM.titleError.textContent = 'Please enter a task title';
    DOM.taskTitle.focus();
    return;
  }
  DOM.titleError.textContent = '';

  const taskData = {
    title,
    description: DOM.taskDescription.value.trim(),
    priority: DOM.taskPriority.value,
    status: DOM.taskStatus.value,
    category: DOM.taskCategory.value,
    dueDate: DOM.taskDueDate.value ? DOM.taskDueDate.value : null
  };

  const btnText = DOM.saveTaskBtn.querySelector('.btn-text');
  const btnSpinner = DOM.saveTaskBtn.querySelector('.btn-spinner');

  try {
    DOM.saveTaskBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';

    if (state.editingTaskId) {
      await apiUpdateTask(state.editingTaskId, taskData);
      showToast('Task updated successfully', 'success');
    } else {
      await apiCreateTask(taskData);
      showToast('Task created successfully', 'success');
    }

    closeTaskModal();
    await Promise.all([fetchTasks(), fetchStats()]);
  } catch (error) {
    showToast(`Error: ${error.message}`, 'error');
  } finally {
    DOM.saveTaskBtn.disabled = false;
    btnText.style.display = 'inline-block';
    btnSpinner.style.display = 'none';
  }
}

// ==========================================================================
// Filter & Search Handlers
// ==========================================================================

function handleSearchInput(e) {
  const value = e.target.value;
  DOM.clearSearchBtn.style.display = value ? 'inline-block' : 'none';

  clearTimeout(state.searchDebounceTimer);
  state.searchDebounceTimer = setTimeout(() => {
    state.filters.search = value;
    fetchTasks();
  }, 250);
}

function handleClearSearch() {
  DOM.searchInput.value = '';
  DOM.clearSearchBtn.style.display = 'none';
  state.filters.search = '';
  fetchTasks();
  DOM.searchInput.focus();
}

function handleStatusFilterClick(e) {
  const clickedBtn = e.target.closest('.filter-pill');
  if (!clickedBtn) return;

  DOM.statusFilterPills.forEach(pill => pill.classList.remove('active'));
  clickedBtn.classList.add('active');

  state.filters.status = clickedBtn.getAttribute('data-status');
  fetchTasks();
}

function handlePriorityFilterChange(e) {
  state.filters.priority = e.target.value;
  fetchTasks();
}

function handleCategoryFilterChange(e) {
  state.filters.category = e.target.value;
  fetchTasks();
}

function handleSortByChange(e) {
  state.filters.sortBy = e.target.value;
  fetchTasks();
}

function resetAllFilters() {
  state.filters.search = '';
  state.filters.status = 'All';
  state.filters.priority = 'All';
  state.filters.category = 'All';
  state.filters.sortBy = 'createdAt';

  DOM.searchInput.value = '';
  DOM.clearSearchBtn.style.display = 'none';

  DOM.statusFilterPills.forEach(pill => {
    pill.classList.toggle('active', pill.getAttribute('data-status') === 'All');
  });

  DOM.priorityFilter.value = 'All';
  DOM.categoryFilter.value = 'All';
  DOM.sortBySelect.value = 'createdAt';

  fetchTasks();
  showToast('Filters reset to default', 'info');
}

// ==========================================================================
// UI Helpers
// ==========================================================================

function setLoading(loading) {
  state.isLoading = loading;
  if (loading) {
    DOM.loadingState.style.display = 'flex';
    DOM.taskGrid.style.display = 'none';
    DOM.emptyState.style.display = 'none';
    DOM.noResultsState.style.display = 'none';
  } else {
    DOM.loadingState.style.display = 'none';
  }
}

function showDbAlert(message) {
  DOM.dbAlertBanner.style.display = 'flex';
  DOM.dbAlertMessage.textContent = `Server / Database Notice: ${message}. Make sure Supabase credentials are configured in server/.env and the database is accessible.`;
}

function hideDbAlert() {
  DOM.dbAlertBanner.style.display = 'none';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================================
// Initialization & Event Binding
// ==========================================================================

function setupEventListeners() {
  // Theme Toggle
  DOM.themeToggleBtn.addEventListener('click', toggleTheme);

  // Modal Open/Close
  DOM.openAddTaskModalBtn.addEventListener('click', openAddTaskModal);
  DOM.emptyStateAddBtn.addEventListener('click', openAddTaskModal);
  DOM.closeModalBtn.addEventListener('click', closeTaskModal);
  DOM.cancelModalBtn.addEventListener('click', closeTaskModal);

  // Form Submit
  DOM.taskForm.addEventListener('submit', handleTaskFormSubmit);

  // Delete Modal
  DOM.closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
  DOM.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  DOM.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

  // Close modals on backdrop click
  DOM.taskModal.addEventListener('click', (e) => {
    if (e.target === DOM.taskModal) closeTaskModal();
  });
  DOM.deleteModal.addEventListener('click', (e) => {
    if (e.target === DOM.deleteModal) closeDeleteModal();
  });

  // Keyboard navigation: Escape key closes modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (DOM.taskModal.classList.contains('open')) closeTaskModal();
      if (DOM.deleteModal.classList.contains('open')) closeDeleteModal();
    }
  });

  // Search & Filter controls
  DOM.searchInput.addEventListener('input', handleSearchInput);
  DOM.clearSearchBtn.addEventListener('click', handleClearSearch);
  DOM.statusFilterPills.forEach(pill => {
    pill.addEventListener('click', handleStatusFilterClick);
  });
  DOM.priorityFilter.addEventListener('change', handlePriorityFilterChange);
  DOM.categoryFilter.addEventListener('change', handleCategoryFilterChange);
  DOM.sortBySelect.addEventListener('change', handleSortByChange);
  DOM.resetFiltersBtn.addEventListener('click', resetAllFilters);
  DOM.clearFilterMatchBtn.addEventListener('click', resetAllFilters);
}

// Bootstrap Application
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  setupEventListeners();

  // Load initial data
  await Promise.all([fetchTasks(), fetchStats()]);
});
