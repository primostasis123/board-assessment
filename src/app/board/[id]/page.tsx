'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'

type Task = {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high' | null
  createdAt: string
  updatedAt: string
}

type Board = {
  id: string
  name: string
  description: string | null
  tasks: Task[]
}

type SortOption = 'createdAt' | 'priority' | 'title'
type SortDirection = 'asc' | 'desc'

const statusLabels = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done'
}

const statusColors = {
  todo: 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300',
  in_progress: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
  done: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
}

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
}

const priorityColors = {
  low: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  medium: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400',
  high: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
}

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: boardId } = use(params)

  const [board, setBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Task creation
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | ''>('')
  const [creating, setCreating] = useState(false)

  // Task editing
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState('')

  // Filtering and sorting
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const fetchBoard = useCallback(async () => {
    try {
      const res = await fetch(`/api/boards/${boardId}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Board not found')
        } else {
          throw new Error('Failed to fetch board')
        }
        return
      }
      const data = await res.json()
      setBoard(data)
      setError(null)
    } catch {
      setError('Failed to load board')
    } finally {
      setLoading(false)
    }
  }, [boardId])

  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    setCreating(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription || null,
          priority: newTaskPriority || null,
          boardId
        })
      })

      if (!res.ok) throw new Error('Failed to create task')

      setNewTaskTitle('')
      setNewTaskDescription('')
      setNewTaskPriority('')
      setShowTaskForm(false)
      await fetchBoard()
    } catch {
      setError('Failed to create task')
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateStatus = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) throw new Error('Failed to update task')
      await fetchBoard()
    } catch {
      setError('Failed to update task status')
    }
  }

  const handleUpdateTitle = async (taskId: string) => {
    if (!editTitle.trim()) return

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle })
      })

      if (!res.ok) throw new Error('Failed to update task')

      setEditingTask(null)
      setEditTitle('')
      await fetchBoard()
    } catch {
      setError('Failed to update task title')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete task')
      await fetchBoard()
    } catch {
      setError('Failed to delete task')
    }
  }

  const startEditingTask = (task: Task) => {
    setEditingTask(task)
    setEditTitle(task.title)
  }

  const cancelEditing = () => {
    setEditingTask(null)
    setEditTitle('')
  }

  const getFilteredAndSortedTasks = () => {
    if (!board) return []

    let tasks = [...board.tasks]

    // Filter by status
    if (statusFilter !== 'all') {
      tasks = tasks.filter(task => task.status === statusFilter)
    }

    // Sort tasks
    tasks.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1, null: 0 }
          comparison = (priorityOrder[a.priority ?? 'null'] ?? 0) - (priorityOrder[b.priority ?? 'null'] ?? 0)
          break
        }
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return tasks
  }

  const getTasksByStatus = (status: 'todo' | 'in_progress' | 'done') => {
    return getFilteredAndSortedTasks().filter(task => task.status === status)
  }

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Loading board...</div>
      </div>
    )
  }

  if (error && !board) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!board) return null

  const filteredTasks = getFilteredAndSortedTasks()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-4 inline-block"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {board.name}
          </h1>
          {board.description && (
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              {board.description}
            </p>
          )}
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
            {error}
            <button onClick={() => setError(null)} className="ml-4 underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Filter by status */}
            <div>
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Sort by */}
            <div>
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                Sort by
              </label>
              <div className="flex gap-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
                <button
                  onClick={toggleSortDirection}
                  className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-600"
                  title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Create task button */}
          {!showTaskForm && (
            <button
              onClick={() => setShowTaskForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Task
            </button>
          )}
        </div>

        {/* Create task form */}
        {showTaskForm && (
          <form
            onSubmit={handleCreateTask}
            className="mb-6 bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700"
          >
            <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
              Create New Task
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter task title"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Enter task description"
                  rows={2}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Priority (optional)
                </label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as typeof newTaskPriority)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating || !newTaskTitle.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskForm(false)
                    setNewTaskTitle('')
                    setNewTaskDescription('')
                    setNewTaskPriority('')
                  }}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Task count summary */}
        <div className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Showing {filteredTasks.length} of {board.tasks.length} tasks
        </div>

        {/* Kanban-style columns */}
        {statusFilter === 'all' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['todo', 'in_progress', 'done'] as const).map((status) => (
              <div key={status} className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-4">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${statusColors[status]}`}>
                    {statusLabels[status]}
                  </span>
                  <span className="text-zinc-500 text-sm">
                    ({getTasksByStatus(status).length})
                  </span>
                </h2>
                <div className="space-y-3">
                  {getTasksByStatus(status).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      editingTask={editingTask}
                      editTitle={editTitle}
                      onEditTitle={setEditTitle}
                      onStartEdit={startEditingTask}
                      onCancelEdit={cancelEditing}
                      onSaveTitle={handleUpdateTitle}
                      onUpdateStatus={handleUpdateStatus}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                  {getTasksByStatus(status).length === 0 && (
                    <p className="text-zinc-500 dark:text-zinc-500 text-sm text-center py-4">
                      No tasks
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Filtered view - single column
          <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-4">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs ${statusColors[statusFilter]}`}>
                {statusLabels[statusFilter]}
              </span>
              <span className="text-zinc-500 text-sm">
                ({filteredTasks.length})
              </span>
            </h2>
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  editingTask={editingTask}
                  editTitle={editTitle}
                  onEditTitle={setEditTitle}
                  onStartEdit={startEditingTask}
                  onCancelEdit={cancelEditing}
                  onSaveTitle={handleUpdateTitle}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDeleteTask}
                />
              ))}
              {filteredTasks.length === 0 && (
                <p className="text-zinc-500 dark:text-zinc-500 text-sm text-center py-4">
                  No tasks match the filter
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Task Card Component
function TaskCard({
  task,
  editingTask,
  editTitle,
  onEditTitle,
  onStartEdit,
  onCancelEdit,
  onSaveTitle,
  onUpdateStatus,
  onDelete
}: {
  task: Task
  editingTask: Task | null
  editTitle: string
  onEditTitle: (title: string) => void
  onStartEdit: (task: Task) => void
  onCancelEdit: () => void
  onSaveTitle: (taskId: string) => void
  onUpdateStatus: (taskId: string, status: 'todo' | 'in_progress' | 'done') => void
  onDelete: (taskId: string) => void
}) {
  const isEditing = editingTask?.id === task.id

  return (
    <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
      {/* Title */}
      {isEditing ? (
        <div className="mb-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => onEditTitle(e.target.value)}
            className="w-full px-2 py-1 border border-blue-500 rounded bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveTitle(task.id)
              if (e.key === 'Escape') onCancelEdit()
            }}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onSaveTitle(task.id)}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={onCancelEdit}
              className="text-xs px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <h3
          className="font-medium text-zinc-900 dark:text-zinc-100 mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
          onClick={() => onStartEdit(task)}
          title="Click to edit"
        >
          {task.title}
        </h3>
      )}

      {/* Description */}
      {task.description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
          {task.description}
        </p>
      )}

      {/* Priority badge */}
      {task.priority && (
        <span className={`text-xs px-2 py-1 rounded ${priorityColors[task.priority]} mr-2`}>
          {priorityLabels[task.priority]}
        </span>
      )}

      {/* Status selector */}
      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700">
        <label className="block text-xs text-zinc-500 dark:text-zinc-500 mb-1">
          Status
        </label>
        <select
          value={task.status}
          onChange={(e) => onUpdateStatus(task.id, e.target.value as 'todo' | 'in_progress' | 'done')}
          className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Delete button */}
      <div className="mt-3 flex justify-end">
        <button
          onClick={() => onDelete(task.id)}
          className="text-xs text-red-600 dark:text-red-400 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
