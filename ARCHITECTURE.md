# Architecture Decisions

## Why did you choose your technologies?

### Why Next.js with App Router?
- **App Router** provides a modern file-based routing system with built-in support for layouts
- Server Components by default reduce client-side JavaScript bundle size
- API routes can be co-located in the same project, simplifying deployment
- Built-in TypeScript support for type safety

### Why PostgreSQL?
- Relational database is ideal for structured data with relationships (boards and tasks)
- ACID compliance ensures data integrity
- Prisma ORM provides excellent PostgreSQL support with type-safe queries
- Scales well for production workloads

### Why Tailwind CSS?
- Utility-first approach allows rapid UI development
- No context switching between CSS and component files
- Small production bundle with automatic purging of unused styles

### Why Prisma ORM?
- Type-safe database queries with auto-generated TypeScript types
- Simple migration system for database schema changes
- Intuitive query API that reduces boilerplate code
- Works seamlessly with Next.js and PostgreSQL


## How did you structure your data?

```
Board
├── id (String, CUID)
├── name (String, required)
├── description (String, optional)
├── color (String, optional)
├── createdAt (DateTime)
├── updatedAt (DateTime)
└── tasks[] (relation)

Task
├── id (String, CUID)
├── title (String, required)
├── description (String, optional)
├── status (Enum: todo, in_progress, done)
├── priority (Enum: low, medium, high, optional)
├── assignedTo (String, optional)
├── dueDate (DateTime, optional)
├── createdAt (DateTime)
├── updatedAt (DateTime)
├── boardId (Foreign Key)
└── board (relation)
```

### Why did you design the database tables this way?
- **One-to-Many Relationship:** A board can have many tasks, but each task belongs to one board
- **CUID for IDs:** More secure than auto-incrementing integers, URL-friendly
- **Status as Enum:** Ensures only valid status values (todo, in_progress, done)
- **Optional Fields:** Flexibility for users to add details gradually
- **Timestamps:** Track creation and modification times automatically

### What happens when you delete a board?
When a board is deleted, all associated tasks are automatically deleted (`onDelete: Cascade`). This prevents orphaned tasks and maintains data integrity.

## How did you design your API?

### What endpoints did you create?

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/boards` | Get all boards with task counts |
| POST | `/api/boards` | Create a new board |
| GET | `/api/boards/[id]` | Get a board with all its tasks |
| DELETE | `/api/boards/[id]` | Delete a board and its tasks |
| GET | `/api/tasks` | Get tasks (optional boardId filter) |
| POST | `/api/tasks` | Create a new task |
| GET | `/api/tasks/[id]` | Get a single task |
| PATCH | `/api/tasks/[id]` | Update a task |
| DELETE | `/api/tasks/[id]` | Delete a task |

### Why did you structure them this way?
- **Predictable URLs:** Resource-based endpoints are intuitive
- **Standard HTTP Methods:** GET for reading, POST for creating, PATCH for updating, DELETE for removing
- **Proper Status Codes:** 200 (success), 201 (created), 400 (bad request), 404 (not found), 500 (server error)
- **JSON Responses:** Consistent response format for all endpoints

### Validation Strategy
- Required fields are validated before database operations
- Invalid enum values return 400 errors with descriptive messages
- Foreign key existence is verified (e.g., board must exist before creating a task)

## How did you organize your frontend?

### Component Structure

```
src/app/
├── page.tsx              # Dashboard (list all boards)
├── layout.tsx            # Root layout with fonts and metadata
├── board/
│   └── [id]/
│       └── page.tsx      # Board detail page with tasks
└── api/
    ├── boards/
    │   ├── route.ts      # GET all, POST
    │   └── [id]/
    │       └── route.ts  # GET one, DELETE
    └── tasks/
        ├── route.ts      # GET all, POST
        └── [id]/
            └── route.ts  # GET one, PATCH, DELETE
```

### Where did you put state management?
- **Local State with useState:** Each page manages its own state
- **No Global State Library:** Application is simple enough without Redux/Zustand
- **Fetch on Mount:** Data loaded via useEffect when components mount
- **Optimistic Updates:** UI updates immediately, then syncs with server

### Why This Approach?
- Keeps complexity low for a small application
- Each page is self-contained and easy to understand
- No prop drilling issues due to flat component hierarchy

### How did you structure components?
- **File-based Routing:** Next.js App Router handles all routing automatically
- **Dynamic Routes:** `[id]` segments for board detail pages
- **Client Components:** Pages use `'use client'` for interactivity

## What would you change?

### What would you improve with more time?
- **Server Components:** Maximize the use of Server Components to reduce client-side JavaScript bundle size
- **Components Structure:**  Ability to easily reuse component that are repeatedly used
- **Board Editing:** Ability to rename boards and update descriptions
- **Drag-and-Drop:** Reorder tasks between columns using a library like dnd-kit
- **Real-time Updates:** WebSocket or Server-Sent Events for multi-user collaboration
- **Search:** Global search across all boards and tasks

### What problems exist in your code
- **No Pagination:** All boards/tasks load at once (won't scale for large datasets)
- **No Caching:** Every page load fetches fresh data from the database
- **No Loading States:** Missing skeleton loaders during data fetching
- **No Error Boundaries:** Unhandled errors could crash the entire page

### What would be different in a real production app?
- **Authentication:** Add Authentication for user management
- **Monitoring:** Error tracking with Sentry, analytics with PostHog
- **Testing:** Unit tests with Jest, E2E tests with Playwright
- **CI/CD Pipeline:** Automated testing and deployment
