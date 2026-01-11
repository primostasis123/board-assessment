import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { TaskStatus, Priority } from '@/generated/prisma/enums'

// GET tasks (optionally filtered by boardId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const boardId = searchParams.get('boardId')

    const where = boardId ? { boardId } : {}

    const tasks = await db.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        board: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json(tasks, { status: 200 })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json(
        { error: 'Task title is required' },
        { status: 400 }
      )
    }

    if (!body.boardId || typeof body.boardId !== 'string') {
      return NextResponse.json(
        { error: 'Board ID is required' },
        { status: 400 }
      )
    }

    // Check if board exists
    const board = await db.board.findUnique({
      where: { id: body.boardId }
    })

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      )
    }

    // Validate status if provided
    if (body.status && !Object.values(TaskStatus).includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid task status. Must be: todo, in_progress, or done' },
        { status: 400 }
      )
    }

    // Validate priority if provided
    if (body.priority && !Object.values(Priority).includes(body.priority)) {
      return NextResponse.json(
        { error: 'Invalid priority. Must be: low, medium, or high' },
        { status: 400 }
      )
    }

    const task = await db.task.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        status: body.status || TaskStatus.todo,
        priority: body.priority || null,
        assignedTo: body.assignedTo?.trim() || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        boardId: body.boardId
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
