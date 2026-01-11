import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { TaskStatus, Priority } from '@/generated/prisma/enums'

type RouteParams = { params: Promise<{ id: string }> }

// GET a single task
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const task = await db.task.findUnique({
      where: { id },
      include: {
        board: {
          select: { id: true, name: true }
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(task, { status: 200 })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

// PATCH update a task
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    const existingTask = await db.task.findUnique({
      where: { id }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    const updateData: {
      title?: string
      description?: string | null
      status?: TaskStatus
      priority?: Priority | null
      assignedTo?: string | null
      dueDate?: Date | null
    } = {}

    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.trim() === '') {
        return NextResponse.json(
          { error: 'Task title cannot be empty' },
          { status: 400 }
        )
      }
      updateData.title = body.title.trim()
    }

    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null
    }

    if (body.status !== undefined) {
      if (!Object.values(TaskStatus).includes(body.status)) {
        return NextResponse.json(
          { error: 'Invalid task status. Must be: todo, in_progress, or done' },
          { status: 400 }
        )
      }
      updateData.status = body.status
    }

    if (body.priority !== undefined) {
      if (body.priority !== null && !Object.values(Priority).includes(body.priority)) {
        return NextResponse.json(
          { error: 'Invalid priority. Must be: low, medium, high, or null' },
          { status: 400 }
        )
      }
      updateData.priority = body.priority
    }

    if (body.assignedTo !== undefined) {
      updateData.assignedTo = body.assignedTo?.trim() || null
    }

    if (body.dueDate !== undefined) {
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null
    }

    const task = await db.task.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(task, { status: 200 })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

// DELETE a task
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const existingTask = await db.task.findUnique({
      where: { id }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    await db.task.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
