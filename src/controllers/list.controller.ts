import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Create new list in a board
export const createList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { boardId } = req.params;
    const { title } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Validation
    if (!title || title.trim() === '') {
      res.status(400).json({ message: 'List title is required' });
      return;
    }

    // Verify board exists and user has access
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: {
          select: { userId: true }
        }
      }
    });

    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }

    // Check if user has access (is owner or member)
    const hasAccess = board.ownerId === userId || 
                     board.members.some((member: { userId: string }) => member.userId === userId);

    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied. You are not a member of this board.' });
      return;
    }

    // Auto-calculate order (find max order + 1)
    const maxOrderList = await prisma.list.findFirst({
      where: { boardId },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const order = maxOrderList ? maxOrderList.order + 1 : 0;

    // Create list
    const list = await prisma.list.create({
      data: {
        title: title.trim(),
        order,
        boardId
      },
      include: {
        cards: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.status(201).json({
      message: 'List created successfully',
      list
    });
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update list title
export const updateList = async (req: AuthRequest, res: Response): Promise<void> => {
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
      res.status(400).json({ message: 'List title is required' });
      return;
    }

    // Get list with board info
    const list = await prisma.list.findUnique({
      where: { id },
      include: {
        board: {
          include: {
            members: {
              select: { userId: true }
            }
          }
        }
      }
    });

    if (!list) {
      res.status(404).json({ message: 'List not found' });
      return;
    }

    // Check if user has access to board
    const hasAccess = list.board.ownerId === userId || 
                     list.board.members.some((member: { userId: string }) => member.userId === userId);

    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied. You are not a member of this board.' });
      return;
    }

    // Update list
    const updatedList = await prisma.list.update({
      where: { id },
      data: { title: title.trim() },
      include: {
        cards: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.json({
      message: 'List updated successfully',
      list: updatedList
    });
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete list
export const deleteList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Get list with board info
    const list = await prisma.list.findUnique({
      where: { id },
      include: {
        board: {
          include: {
            members: {
              select: { userId: true }
            }
          }
        }
      }
    });

    if (!list) {
      res.status(404).json({ message: 'List not found' });
      return;
    }

    // Check if user has access to board
    const hasAccess = list.board.ownerId === userId || 
                     list.board.members.some((member: { userId: string }) => member.userId === userId);

    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied. You are not a member of this board.' });
      return;
    }

    // Delete list (cascade will delete cards)
    await prisma.list.delete({
      where: { id }
    });

    res.json({
      message: 'List deleted successfully',
      deletedList: {
        id,
        title: list.title
      }
    });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reorder multiple lists
export const reorderLists = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { lists } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Validation
    if (!lists || !Array.isArray(lists) || lists.length === 0) {
      res.status(400).json({ message: 'Lists array is required' });
      return;
    }

    // Validate each list has id and order
    for (const list of lists) {
      if (!list.id || typeof list.order !== 'number') {
        res.status(400).json({ message: 'Each list must have id and order' });
        return;
      }
    }

    // Get first list to verify board access
    const firstList = await prisma.list.findUnique({
      where: { id: lists[0].id },
      include: {
        board: {
          include: {
            members: {
              select: { userId: true }
            }
          }
        }
      }
    });

    if (!firstList) {
      res.status(404).json({ message: 'List not found' });
      return;
    }

    // Check if user has access to board
    const hasAccess = firstList.board.ownerId === userId || 
                     firstList.board.members.some((member: { userId: string }) => member.userId === userId);

    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied. You are not a member of this board.' });
      return;
    }

    // Update all lists in a transaction
    await prisma.$transaction(
      lists.map(({ id, order }: { id: string; order: number }) =>
        prisma.list.update({
          where: { id },
          data: { order }
        })
      )
    );

    res.json({
      message: 'Lists reordered successfully'
    });
  } catch (error) {
    console.error('Reorder lists error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
