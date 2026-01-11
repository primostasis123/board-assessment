# Task Board System

A task management application with boards and tasks, featuring a Kanban-style interface.

## Requirements

- Minimum: Node.js 18.18.0
- Recommended: Node.js 20.x or 22.x LTS or 24.x LTS
- PostgreSQL database

## Setup

1. Clone the repository and navigate to the project folder

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your database connection:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/taskboard"
   ```

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Set up the database and run migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Run the application:
   ```bash
   npm run dev
   ```

7. Open in browser: http://localhost:3000

## Tech Stack

- Next.js with App Router
- TypeScript
- React 19
- Prisma ORM
- PostgreSQL
- Tailwind CSS

## Features

- Create, view, and delete boards
- Create, edit, and delete tasks
- Change task status (To Do, In Progress, Done)
- Filter tasks by status
- Sort tasks by created date, priority, or title
- Kanban-style board view
- Real-time updates without page refresh

## API Endpoints

### Boards
- `GET /api/boards` - Get all boards
- `POST /api/boards` - Create a new board
- `GET /api/boards/[id]` - Get a board with its tasks
- `DELETE /api/boards/[id]` - Delete a board

### Tasks
- `GET /api/tasks` - Get all tasks (optional `?boardId=` filter)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/[id]` - Get a single task
- `PATCH /api/tasks/[id]` - Update a task
- `DELETE /api/tasks/[id]` - Delete a task
