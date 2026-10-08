# 🚀 Supabase Setup Guide for TaskFlow

This guide walks you step-by-step through setting up Supabase PostgreSQL for the TaskFlow Task Manager application.

---

## 1. Create a Supabase Project

1. Visit [https://supabase.com](https://supabase.com) and sign in or create a free account.
2. In the Supabase Dashboard, click **New Project**.
3. Choose your organization.
4. Enter project details:
   - **Name**: `TaskFlow` (or any name you prefer)
   - **Database Password**: Choose a strong password and save it securely.
   - **Region**: Select the region geographically closest to you.
5. Click **Create new project** and wait 1–2 minutes for the database to provision.

---

## 2. Run the Database Schema

1. In your Supabase project dashboard sidebar, click on **SQL Editor** (the terminal/script icon).
2. Click **+ New query**.
3. Open [`supabase/schema.sql`](supabase/schema.sql) from this project, copy the entire SQL script, and paste it into the SQL Editor.
4. Click the **Run** button (or press `Ctrl+Enter` / `Cmd+Enter`).
5. You should see `Success. No rows returned`.
6. To verify:
   - Click **Table Editor** in the left sidebar.
   - Confirm that the `tasks` table is present with columns: `id`, `title`, `description`, `priority`, `status`, `category`, `due_date`, `created_at`, and `updated_at`.

---

## 3. Obtain Supabase Project URL & API Key

1. In the Supabase dashboard sidebar, click **Project Settings** (gear icon at the bottom).
2. Under Configuration, click **API**.
3. Copy the following two values:
   - **Project URL**: (e.g., `https://your-project-id.supabase.co`)
   - **anon / public key**: (under **Project API keys**, select the `anon` / `public` key)

> ⚠️ **Important Security Rule**:
> Never use or commit the `service_role` (secret) key into frontend or public repositories. The application uses the `anon` key inside the Node.js backend.

---

## 4. Configure Environment Variables

1. Open `Day_13/server/.env` (or copy from `server/.env.example`):
   ```bash
   cp server/.env.example server/.env
   ```
2. Fill in your project credentials:
   ```env
   PORT=5000
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```
3. Save the file. (Note: `.env` is ignored by `.gitignore` so your keys won't be pushed to git).

---

## 5. Install Dependencies & Start the Server

1. Open a terminal in the `Day_13` project directory:
   ```bash
   cd Day_13
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   Or start the production server:
   ```bash
   npm start
   ```

---

## 6. Verify the Database Connection

When starting the server, you will see output in your terminal:
```text
🚀 TaskFlow Server is running on port 5000
🌐 Frontend accessible at http://localhost:5000
📡 API accessible at http://localhost:5000/api/tasks
⚡ Database: Supabase PostgreSQL
✅ Supabase Connected Successfully: https://your-project-id.supabase.co
```

1. Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```
2. Create a test task:
   - Click **+ Add Task**.
   - Enter a title, description, priority, category, and due date.
   - Click **Add Task**.
3. Go back to your Supabase Dashboard -> **Table Editor** -> **tasks** table:
   - You will see your newly created task with its generated UUID `id`!
4. Try updating the task, checking it off, changing status, and deleting it to verify full end-to-end functionality.
