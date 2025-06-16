# Tasks Management API with Supabase

A Node.js REST API for managing tasks with Supabase database integration.

## Features

- ✅ Complete CRUD operations for tasks
- ✅ Supabase database integration
- ✅ Row Level Security (RLS) for data protection
- ✅ RESTful API design
- ✅ Error handling and logging
- ✅ Modern ES modules syntax
- ✅ Express.js server with CORS support

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Add your Supabase credentials to `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. The database migration will create the tasks table automatically when you connect to Supabase.

4. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Tasks Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/:id` | Get a specific task |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| PATCH | `/api/tasks/:id/toggle` | Toggle task completion |

### Request Examples

**Create a task:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "x-user-id: demo-user-id" \
  -d '{"title": "Learn Node.js", "description": "Complete the Node.js tutorial"}'
```

**Get all tasks:**
```bash
curl http://localhost:3000/api/tasks \
  -H "x-user-id: demo-user-id"
```

**Update a task:**
```bash
curl -X PUT http://localhost:3000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "x-user-id: demo-user-id" \
  -d '{"title": "Updated title", "completed": true}'
```

**Delete a task:**
```bash
curl -X DELETE http://localhost:3000/api/tasks/TASK_ID \
  -H "x-user-id: demo-user-id"
```

## Database Schema

### Tasks Table
- `id` (uuid) - Primary key
- `title` (text) - Task title (required)
- `description` (text) - Task description
- `completed` (boolean) - Completion status
- `created_at` (timestamp) - Creation timestamp
- `updated_at` (timestamp) - Last update timestamp
- `user_id` (uuid) - User reference

## Security

- Row Level Security (RLS) enabled
- Users can only access their own tasks
- Authenticated access required for all operations

## Project Structure

```
src/
├── index.js              # Main server file
├── config/
│   ├── index.js          # App configuration
│   └── supabase.js       # Supabase client setup
├── services/
│   └── taskService.js    # Database operations
├── routes/
│   └── taskRoutes.js     # API route handlers
└── utils/
    └── logger.js         # Logging utility

supabase/
└── migrations/
    └── create_tasks_table.sql  # Database schema
```

Ready to manage your tasks! 🚀