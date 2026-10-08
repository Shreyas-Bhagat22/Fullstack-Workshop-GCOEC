# TaskFlow - Modern Full-Stack Task Manager (Supabase PostgreSQL Edition)

A modern, responsive, full-stack Task Management web application built with **HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js, and Supabase PostgreSQL**.

Built as a clean, production-grade project demonstrating REST API architecture, relational database schema design, asynchronous client-server communication using the native Fetch API, and responsive UI design without any frontend frameworks.

---

## 🌟 Key Features

- **Intuitive Productivity Dashboard**: Displays real-time statistics for Total Tasks, Pending, In Progress, Completed, Overdue tasks, and an animated completion progress bar.
- **Full CRUD Functionality**: Create, Read, Update, Delete, and quick status changes with instant UI updates without page reloading.
- **Search & Filtering**: Real-time debounced search by task title and description; filter by Status (All, Pending, In Progress, Completed), Priority (Low, Medium, High), and Category (Personal, College, Work, Other).
- **Multi-criteria Sorting**: Sort tasks by Due Date, Priority (High to Low), Recently Created, or Alphabetical (A-Z).
- **Visual Status Differentiation**: Distinct visual treatments for Pending, In Progress, Completed (subdued with strikethrough), and Overdue tasks (prominent warning accents and badges).
- **Light & Dark Theme**: Sleek, eye-friendly dark/light theme toggle with persistence in `localStorage`.
- **Toast Notifications**: Non-blocking toast feedback for all CRUD operations and error alerts (no disruptive browser `alert()` popups).
- **Accessible Modals**: Accessible modal dialogs for task creation/editing and deletion confirmation with keyboard support (`Escape` to close).
- **100% Vanilla Frontend**: Zero React, Vue, Angular, or Tailwind dependencies — pure HTML5, modern CSS3 (custom properties, flexbox, CSS grid), and Vanilla JavaScript.
- **Robust REST API & Validation**: Backend validation, centralized Express error handling, and standard HTTP response codes.
- **Cloud Relational Database**: Backed by **Supabase PostgreSQL** with automated timestamps, database constraints, performance indexes, and Row Level Security.

---

## 🛠️ Tech Stack

### Frontend
- **HTML5**: Semantic layout with accessibility features (`aria-*`, modal dialogs, role definitions).
- **CSS3**: Modern CSS variables (custom properties), Flexbox, CSS Grid, media queries, smooth micro-interactions, dark mode.
- **Vanilla JavaScript**: ES6+ modules/functions, DOM manipulation, asynchronous state management.
- **Fetch API**: Client-server REST communication.

### Backend
- **Node.js**: Asynchronous JavaScript runtime environment.
- **Express.js**: RESTful API server and static file hosting.
- **@supabase/supabase-js**: Official Supabase JavaScript client for PostgreSQL database operations.
- **dotenv**: Environment variable management.
- **cors**: Cross-Origin Resource Sharing middleware.

### Database
- **Supabase PostgreSQL**: Scalable relational database with automated UUID generation, constraints, triggers, and Row Level Security (RLS).

---

## 📁 Project Structure

```text
Day_13/
│
├── server/
│   ├── config/
│   │   └── supabase.js           # Supabase client initialization & connection diagnostics
│   │
│   ├── routes/
│   │   └── taskRoutes.js         # REST API route declarations
│   │
│   ├── controllers/
│   │   └── taskController.js     # Request handlers & CRUD business logic (Supabase client)
│   │
│   ├── middleware/
│   │   └── errorHandler.js       # Centralized error handler (PostgreSQL / Supabase error codes)
│   │
│   ├── server.js                 # Express application entry point
│   ├── .env                      # Environment variables (PORT, SUPABASE_URL, SUPABASE_ANON_KEY)
│   └── .env.example              # Template for environment variables
│
├── supabase/
│   └── schema.sql                # PostgreSQL table, triggers, indexes, and RLS policies
│
├── public/
│   ├── index.html                # Semantic single-page application layout
│   ├── css/
│   │   └── style.css             # Design system, CSS variables, dark/light themes
│   │
│   └── js/
│       └── app.js                # Frontend state, DOM events, and Fetch API calls
│
├── SUPABASE_SETUP.md             # Detailed step-by-step Supabase setup guide
├── package.json                  # Project metadata, dependencies, and npm scripts
├── .gitignore                    # Ignored files (node_modules, .env)
└── README.md                     # Comprehensive project documentation
```

---

## 📋 Prerequisites

Before running the project, ensure you have:
1. **Node.js** (v18 or higher recommended) installed:
   ```bash
   node -v
   ```
2. A free **Supabase** account at [supabase.com](https://supabase.com).

---

## 🗄️ Supabase Database Setup

Follow these simple steps to set up your PostgreSQL database in Supabase:

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com) and click **New Project**.
   - Set a name (e.g. `TaskFlow`) and a database password.

2. **Open the SQL Editor & Run Schema**:
   - In your Supabase Dashboard, click on **SQL Editor** from the left navigation.
   - Click **+ New query**.
   - Copy the entire SQL contents from [`supabase/schema.sql`](supabase/schema.sql) and paste them in.
   - Click **Run**. This creates the `tasks` table with UUID primary keys, check constraints, indexes, an automatic `updated_at` trigger, and Row Level Security (RLS) policies.

3. **Get Your Project URL and Anon API Key**:
   - Go to **Project Settings** (gear icon) -> **API**.
   - Copy the **Project URL** (e.g. `https://xyzproject.supabase.co`).
   - Copy the **anon / public key** under **Project API keys**.

4. **Configure Environment Variables**:
   - Open `server/.env` (or duplicate `server/.env.example` as `server/.env`).
   - Update with your credentials:
     ```env
     PORT=5000
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

*(For detailed visual instructions, see [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md).)*

---

## ⚙️ Installation & Setup

1. **Navigate to the project directory**:
   ```bash
   cd Day_13
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Ensure `server/.env` contains your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

---

## 🚀 Running the Application

### Development Mode (with automatic restart on changes)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Once started, open your web browser and visit:
👉 **`http://localhost:5000`**

---

## 📡 REST API Documentation

Base URL: `http://localhost:5000/api/tasks`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/tasks` | Retrieve all tasks. Supports query params: `search`, `status`, `priority`, `category`, `sortBy`, `order` |
| **GET** | `/api/tasks/stats` | Retrieve dashboard stats: total, pending, in-progress, completed, overdue, completion percentage |
| **GET** | `/api/tasks/:id` | Retrieve a single task by its UUID |
| **POST** | `/api/tasks` | Create a new task |
| **PUT** | `/api/tasks/:id` | Update an existing task |
| **PATCH**| `/api/tasks/:id/status`| Update only the status (`Pending`, `In Progress`, `Completed`) |
| **DELETE**| `/api/tasks/:id` | Delete a task by UUID |

---

## 📝 Example API Requests & Responses

### 1. Create a Task (`POST /api/tasks`)
**Request**:
```http
POST /api/tasks HTTP/1.1
Content-Type: application/json

{
  "title": "Migrate to Supabase",
  "description": "Switch TaskFlow database layer from MongoDB to Supabase PostgreSQL",
  "priority": "High",
  "status": "In Progress",
  "category": "Work",
  "dueDate": "2026-10-15T00:00:00.000Z"
}
```

**Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "e44d5c12-32a8-4c91-a1e6-b9247345610e",
    "_id": "e44d5c12-32a8-4c91-a1e6-b9247345610e",
    "title": "Migrate to Supabase",
    "description": "Switch TaskFlow database layer from MongoDB to Supabase PostgreSQL",
    "priority": "High",
    "status": "In Progress",
    "category": "Work",
    "dueDate": "2026-10-15T00:00:00.000Z",
    "createdAt": "2026-10-07T10:30:00.000Z",
    "updatedAt": "2026-10-07T10:30:00.000Z"
  }
}
```

### 2. Get Dashboard Stats (`GET /api/tasks/stats`)
**Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "total": 12,
    "pending": 4,
    "inProgress": 3,
    "completed": 5,
    "overdue": 1,
    "completionPercentage": 42
  }
}
```

### 3. Update Task Status (`PATCH /api/tasks/:id/status`)
**Request**:
```http
PATCH /api/tasks/e44d5c12-32a8-4c91-a1e6-b9247345610e/status HTTP/1.1
Content-Type: application/json

{
  "status": "Completed"
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "id": "e44d5c12-32a8-4c91-a1e6-b9247345610e",
    "_id": "e44d5c12-32a8-4c91-a1e6-b9247345610e",
    "title": "Migrate to Supabase",
    "status": "Completed",
    "updatedAt": "2026-10-07T10:35:00.000Z"
  }
}
```

---

## 🔄 Architectural Flow: Frontend → Backend → Supabase

1. **User Action**: The user interacts with the UI (e.g. types a search term, clicks "Add Task", or changes task status).
2. **Client-side JavaScript (`app.js`)**:
   - Captures the DOM event.
   - Formats parameters or serializes input data into JSON.
   - Dispatches an asynchronous HTTP request using the native browser `fetch()` API to the Node.js/Express backend (e.g. `POST /api/tasks`).
   - Private Supabase credentials are **never exposed** to the frontend.
3. **Express Server & Routing (`server.js` & `taskRoutes.js`)**:
   - Parses the request body and routes it to `taskController.js`.
4. **Backend Supabase Client (`taskController.js` & `supabase.js`)**:
   - The backend communicates with Supabase PostgreSQL using `@supabase/supabase-js`.
   - Executes queries and mutations safely on the `tasks` table.
5. **JSON Response**: The controller returns a standardized JSON payload (`{ success: true, data: ... }`) with the appropriate HTTP status code (`200`, `201`, `400`, `404`, `500`).
6. **Reactive DOM Update**: The frontend receives the JSON response, updates its local state, renders the updated task card(s), recalculates statistics, and displays a toast notification without refreshing the page!

---

## 🛡️ Security Best Practices

- **Zero Client Credential Leakage**: The browser frontend only communicates with your Express server endpoints (`/api/tasks`). No Supabase keys or secrets are loaded or bundled in the frontend.
- **Environment Isolation**: `.env` is listed in `.gitignore` to prevent committing sensitive project keys.
- **Row Level Security (RLS)**: Prepared with clean RLS policies in `supabase/schema.sql`.
