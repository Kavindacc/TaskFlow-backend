import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Create new card in a list
export const createCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { listId } = req.params;
    const { title, description, labels, dueDate } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Validation
    if (!title || title.trim() === '') {
      res.status(400).json({ message: 'Card title is required' });
      return;
    }

    // Get list with board info to verify access
    const list = await prisma.list.findUnique({
      where: { id: listId },
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

    // Auto-calculate order (find max order + 1)
    const maxOrderCard = await prisma.card.findFirst({
      where: { listId },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const order = maxOrderCard ? maxOrderCard.order + 1 : 0;

    // Create card
    const card = await prisma.card.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        order,
        listId,
        labels: labels || [],
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });

    res.status(201).json({
      message: 'Card created successfully',
      card
    });
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single card
export const getCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Get card with list and board info
    const card = await prisma.card.findUnique({
      where: { id },
      include: {
        list: {
          include: {
            board: {
              include: {
                members: {
                  select: { userId: true }
                }
              }
            }
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!card) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }

    // Check if user has access to board
    const hasAccess = card.list.board.ownerId === userId || 
                     card.list.board.members.some((member: { userId: string }) => member.userId === userId);

    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied. You are not a member of this board.' });
      return;
    }

    res.json(card);
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update card
export const updateCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { title, description, labels, dueDate } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Get card with board info
    const card = await prisma.card.findUnique({
      where: { id },
      include: {
        list: {
          include: {
            board: {
              include: {
                members: {
                  select: { userId: true }
                }
              }
            }
          }
        }
      }
    });

    if (!card) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }

    // Check if user has access to board
    const hasAccess = card.list.board.ownerId === userId || 
                     card.list.board.members.some((member: { userId: string }) => member.userId === userId);

    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied. You are not a member of this board.' });
      return;
    }

    // Build update data object
    const updateData: {
      title?: string;
      description?: string | null;
      labels?: string[];
      dueDate?: Date | null;
    } = {};

    if (title !== undefined) {
      if (title.trim() === '') {
        res.status(400).json({ message: 'Card title cannot be empty' });
        return;
      }
      updateData.title = title.trim();
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }
    if (labels !== undefined) {
      updateData.labels = labels;
    }
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }

    // Update card
    const updatedCard = await prisma.card.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Card updated successfully',
      card: updatedCard
    });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete card
export const deleteCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Get card with board info
    const card = await prisma.card.findUnique({
      where: { id },
      include: {
        list: {
          include: {
            board: {
              include: {
                members: {
                  select: { userId: true }
                }
              }
            }
          }
        }
      }
    });

    if (!card) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }

    // Check if user has access to board
    const hasAccess = card.list.board.ownerId === userId || 
                     card.list.board.members.some((member: { userId: string }) => member.userId === userId);

    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied. You are not a member of this board.' });
      return;
    }

    // Delete card
    await prisma.card.delete({
      where: { id }
    });

    res.json({
      message: 'Card deleted successfully',
      deletedCard: {
        id,
        title: card.title
      }
    });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Move card to different list and/or reorder
export const moveCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { listId, order } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Validation
    if (!listId || typeof order !== 'number') {
      res.status(400).json({ message: 'listId and order are required' });
      return;
    }

    // Get card with source board info
    const card = await prisma.card.findUnique({
      where: { id },
      include: {
        list: {
          include: {
            board: {
              include: {
                members: {
                  select: { userId: true }
                }
              }
            }
          }
        }
      }
    });

    if (!card) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }

    // Check if user has access to source board
    const hasSourceAccess = card.list.board.ownerId === userId || 
                           card.list.board.members.some((member: { userId: string }) => member.userId === userId);

    if (!hasSourceAccess) {
      res.status(403).json({ message: 'Access denied. You are not a member of this board.' });
      return;
    }

    // Get target list with board info
    const targetList = await prisma.list.findUnique({
      where: { id: listId },
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

    if (!targetList) {
      res.status(404).json({ message: 'Target list not found' });
      return;
    }

    // Check if user has access to target board
    const hasTargetAccess = targetList.board.ownerId === userId || 
                           targetList.board.members.some((member: { userId: string }) => member.userId === userId);

    if (!hasTargetAccess) {
      res.status(403).json({ message: 'Access denied. You are not a member of the target board.' });
      return;
    }

    // Move card
    const movedCard = await prisma.card.update({
      where: { id },
      data: {
        listId,
        order
      }
    });

    res.json({
      message: 'Card moved successfully',
      card: movedCard
    });
  } catch (error) {
    console.error('Move card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
