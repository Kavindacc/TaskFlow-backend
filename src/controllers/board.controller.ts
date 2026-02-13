import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Get all boards where user is owner or member
export const getAllBoards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Get boards where user is owner OR member
    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId: userId } } }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        members: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        _count: {
          select: {
            lists: true,
            members: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(boards);
  } catch (error) {
    console.error('Get all boards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new board
export const createBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { title } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Validation
    if (!title || title.trim() === '') {
      res.status(400).json({ message: 'Board title is required' });
      return;
    }

    // Create board with user as owner and automatically add as member
    const board = await prisma.board.create({
      data: {
        title: title.trim(),
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: 'owner'
          }
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        members: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Board created successfully',
      board
    });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single board with lists and cards
export const getBoardById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Get board with all nested data
    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        members: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        lists: {
          orderBy: {
            order: 'asc'
          },
          include: {
            cards: {
              orderBy: {
                order: 'asc'
              }
            }
          }
        }
      }
    });

    // Check if board exists
    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }

    // Check if user has access (is owner or member)
    const hasAccess = board.ownerId === userId || 
                     board.members.some((member: { user: { id: string } }) => member.user.id === userId);

    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied. You are not a member of this board.' });
      return;
    }

    res.json(board);
  } catch (error) {
    console.error('Get board by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update board
export const updateBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { title } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Validation
    if (!title || title.trim() === '') {
      res.status(400).json({ message: 'Board title is required' });
      return;
    }

    // Check if board exists and user is owner
    const board = await prisma.board.findUnique({
      where: { id },
      select: { ownerId: true }
    });

    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }

    if (board.ownerId !== userId) {
      res.status(403).json({ message: 'Access denied. Only the board owner can update the board.' });
      return;
    }

    // Update board
    const updatedBoard = await prisma.board.update({
      where: { id },
      data: { title: title.trim() },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        members: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Board updated successfully',
      board: updatedBoard
    });
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete board
export const deleteBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Check if board exists and user is owner
    const board = await prisma.board.findUnique({
      where: { id },
      select: { ownerId: true, title: true }
    });

    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }

    if (board.ownerId !== userId) {
      res.status(403).json({ message: 'Access denied. Only the board owner can delete the board.' });
      return;
    }

    // Delete board (cascade will delete lists, cards, comments, and members)
    await prisma.board.delete({
      where: { id }
    });

    res.json({
      message: 'Board deleted successfully',
      deletedBoard: {
        id,
        title: board.title
      }
    });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
