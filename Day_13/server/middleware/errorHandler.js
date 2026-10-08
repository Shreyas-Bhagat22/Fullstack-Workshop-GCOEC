/**
 * Centralized Error Handling Middleware for Express & Supabase
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Log error to server console for debugging
  console.error(`🚨 [API Error] ${req.method} ${req.originalUrl}:`, err);

  // PostgreSQL / Supabase Error Code Handlers
  if (err.code) {
    switch (err.code) {
      // Invalid input syntax (e.g. invalid UUID format)
      case '22P02':
        statusCode = 400;
        message = 'Invalid resource identifier format (valid UUID expected)';
        break;

      // Unique constraint violation
      case '23505':
        statusCode = 400;
        message = 'A task with this information already exists';
        break;

      // Check constraint violation (e.g. invalid status, priority, or category)
      case '23514':
        statusCode = 400;
        message = 'Provided value violates database allowed values (priority, status, or category)';
        break;

      // Not-null constraint violation
      case '23502':
        statusCode = 400;
        message = `Required field missing: ${err.details || 'please check input fields'}`;
        break;

      // Relation / table does not exist
      case '42P01':
      case 'PGRST205':
        statusCode = 503;
        message = 'Database table "tasks" does not exist yet. Run supabase/schema.sql in your Supabase SQL Editor.';
        break;

      // PostgREST row count error
      case 'PGRST116':
        statusCode = 404;
        message = 'Requested task was not found';
        break;

      default:
        // Keep existing status code or 500
        break;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
