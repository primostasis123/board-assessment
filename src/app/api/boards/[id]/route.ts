import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type RouteParams = { params: Promise<{ id: string }> }

// GET a single board with all its tasks
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const board = await db.board.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(board, { status: 200 })
  } catch (error) {
    console.error('Error fetching board:', error)
    return NextResponse.json(
      { error: 'Failed to fetch board' },
      { status: 500 }
    )
  }
}

// DELETE a board
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const existingBoard = await db.board.findUnique({
      where: { id }
    })

    if (!existingBoard) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      )
    }

    await db.board.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Board deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting board:', error)
    return NextResponse.json(
      { error: 'Failed to delete board' },
      { status: 500 }
    )
  }
}
