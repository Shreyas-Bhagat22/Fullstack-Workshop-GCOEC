-- ==============================================================================
-- Supabase Schema: TaskFlow Task Manager
-- ==============================================================================
-- This script creates the `tasks` table with appropriate UUID generation,
-- constraints, default values, indexes, automatic updated_at timestamp trigger,
-- and Row Level Security (RLS) policies for anonymous & authenticated access.
-- ==============================================================================

-- 1. Enable pgcrypto / uuid-ossp extension for gen_random_uuid() (standard in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    priority TEXT NOT NULL DEFAULT 'Medium',
    status TEXT NOT NULL DEFAULT 'Pending',
    category TEXT NOT NULL DEFAULT 'Other',
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints on allowed enum-like values
    CONSTRAINT tasks_priority_check CHECK (priority IN ('Low', 'Medium', 'High')),
    CONSTRAINT tasks_status_check CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    CONSTRAINT tasks_category_check CHECK (category IN ('Personal', 'College', 'Work', 'Other'))
);

-- 3. Trigger function to automatically maintain `updated_at` on row updates
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Attach trigger to tasks table
DROP TRIGGER IF EXISTS trigger_tasks_updated_at ON tasks;
CREATE TRIGGER trigger_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_tasks_updated_at();

-- 5. Performance Indexes for querying, filtering, and sorting
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- 6. Configure Row Level Security (RLS)
-- Enables security while permitting access through the Supabase client
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow anon and authenticated roles full CRUD access to tasks
DROP POLICY IF EXISTS "Allow anon all operations on tasks" ON tasks;
CREATE POLICY "Allow anon all operations on tasks"
ON tasks
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Optional: Sample initial tasks for demonstration
-- INSERT INTO tasks (title, description, priority, status, category, due_date)
-- VALUES 
--   ('Welcome to TaskFlow', 'Explore the modernized Supabase PostgreSQL task manager.', 'High', 'In Progress', 'Work', now() + interval '3 days'),
--   ('Complete Project Documentation', 'Review API routes and ensure all endpoints are functioning smoothly.', 'Medium', 'Pending', 'College', now() + interval '5 days');
