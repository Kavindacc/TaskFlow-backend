import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// POST /api/cards/:cardId/comments
export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { cardId } = req.params;
    const { text } = req.body;

    if (!userId) { res.status(401).json({ message: 'Unauthorized' }); return; }
    if (!text || text.trim() === '') { res.status(400).json({ message: 'Comment text is required' }); return; }

    // Verify card exists and user has board access
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { list: { include: { board: { include: { members: { select: { userId: true } } } } } } }
    });

    if (!card) { res.status(404).json({ message: 'Card not found' }); return; }

    const hasAccess = card.list.board.ownerId === userId ||
      card.list.board.members.some((m: { userId: string }) => m.userId === userId);
    if (!hasAccess) { res.status(403).json({ message: 'Access denied' }); return; }

    const comment = await prisma.comment.create({
      data: { text: text.trim(), cardId, authorId: userId },
      include: { author: { select: { id: true, name: true, email: true } } }
    });

    res.status(201).json({ message: 'Comment created', comment });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/comments/:id
export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) { res.status(401).json({ message: 'Unauthorized' }); return; }

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) { res.status(404).json({ message: 'Comment not found' }); return; }
    if (comment.authorId !== userId) { res.status(403).json({ message: 'You can only delete your own comments' }); return; }

    await prisma.comment.delete({ where: { id } });
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
