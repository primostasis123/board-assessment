import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all boards
export async function GET() {
  try {
    const boards = await db.board.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    })
    return NextResponse.json(boards, { status: 200 })
  } catch (error) {
    console.error('Error fetching boards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch boards' },
      { status: 500 }
    )
  }
}

// POST create a new board
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json(
        { error: 'Board name is required' },
        { status: 400 }
      )
    }

    const board = await db.board.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        color: body.color || null
      }
    })

    return NextResponse.json(board, { status: 201 })
  } catch (error) {
    console.error('Error creating board:', error)
    return NextResponse.json(
      { error: 'Failed to create board' },
      { status: 500 }
    )
  }
}
