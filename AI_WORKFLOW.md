# AI Workflow

## Tool Used

I used **Cursor + ChatGPT**  to assist with building this task board application.

How I used it:
- Used it to help debug errors and understand Prisma 7.x changes
- Generated boilerplate code for frontend components

## Example Prompts

### Prompt 1: Understanding Prisma 7.x Setup
```
How do I set up PrismaClient with PostgreSQL in Prisma 7?
```

**Why this prompt:** Prisma 7.x has breaking changes from previous versions. I needed to understand the new adapter pattern.

**Result:** Learned that Prisma 7.x requires `@prisma/adapter-pg` package and a different initialization pattern.

### Prompt 2: React Component Structure
```
Create a dashboard page component that displays boards as cards with a create form
```

**Why this prompt:** Wanted a starting point for the frontend layout with proper React patterns.

**Result:** Got a good component structure that I then customized for my needs.


## My Process

### What AI was used for:
- Understanding Prisma 7.x breaking changes and adapter setup
- Generating React component boilerplate
- Helping with TypeScript types for Task and Board models
- Debugging build errors
- Help me create boiler plate for the README, AI_WORKFLOW, ARCHITECTURE

### What I coded manually:
- All API route handlers (boards and tasks endpoints)
- Database queries with Prisma
- Input validation and error handling logic
- State management for real-time updates
- Filtering and sorting implementation details
- Update README, AI_WORKFLOW, ARCHITECTURE

### Where AI-generated code didn't work:
1. **Prisma imports:** Had to fix import paths to use explicit files like `@/generated/prisma/client`
2. **PrismaClient initialization:** Needed manual adjustment for the adapter pattern in Prisma 7.x

### How problems were fixed:
- Read error messages from `npm run build`
- Checked Prisma documentation for version 7.x changes
- Installed required packages

## Time Management

### Build Order:
1. **First 10 min:** Set up project structure and Prisma schema
2. **Next 20 min:** Built all API endpoints for boards and tasks
3. **Next 15 min:** Created Dashboard page with board management
4. **Next 20 min:** Built Board detail page with task CRUD operations
5. **Next 5 min:** Added Kanban-style columns and status management
6. **Next 5 min:** Implemented filtering and sorting features
7. **Next 15 min:** Add ReadMe, AI Workflow, Architecture

### What was skipped:
- Board editing functionality
- Advanced styling and animations
- User authentication
- Drag-and-drop for tasks

### If I had more time, I would add:
- Drag-and-drop task reordering
- Board editing (rename, description)
- Due date picker for tasks
- Search functionality
- User authentication
