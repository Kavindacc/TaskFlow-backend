import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Find the existing user (your account) ─────────────────────────────────
  // We seed data UNDER your existing account — change this email to yours.
  const existingUser = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  if (!existingUser) {
    throw new Error('No users found. Please register an account first, then run the seed.');
  }

  console.log(`✅ Found user: ${existingUser.email}`);

  const userId = existingUser.id;
  const now = new Date();
  const day = 86400000; // ms in a day

  // ── BOARD 1: Product Roadmap ───────────────────────────────────────────────
  console.log('📋 Creating Board 1: Product Roadmap...');
  const board1 = await prisma.board.create({
    data: {
      title: 'Product Roadmap Q2 2025',
      ownerId: userId,
      members: { create: { userId, role: 'owner' } },
      lists: {
        create: [
          {
            title: 'Backlog',
            order: 1,
            priority: 'medium',
            cards: {
              create: [
                {
                  title: 'Define user personas',
                  description: 'Research and document the 3 core user personas for the platform.',
                  order: 1,
                  labels: ['Research', 'UX'],
                  dueDate: new Date(now.getTime() + 5 * day),
                  isComplete: false,
                },
                {
                  title: 'Competitor analysis report',
                  description: 'Analyse top 5 competitors and summarise findings in a shared doc.',
                  order: 2,
                  labels: ['Research'],
                  dueDate: new Date(now.getTime() + 8 * day),
                  isComplete: false,
                },
                {
                  title: 'SEO keyword strategy',
                  description: 'Identify 50 target keywords and map them to pages.',
                  order: 3,
                  labels: ['Marketing', 'SEO'],
                  dueDate: new Date(now.getTime() + 12 * day),
                  isComplete: false,
                },
              ],
            },
          },
          {
            title: 'In Progress',
            order: 2,
            priority: 'high',
            cards: {
              create: [
                {
                  title: 'Redesign onboarding flow',
                  description: 'Simplify the 5-step onboarding to 3 steps with inline validation.',
                  order: 1,
                  labels: ['Design', 'UX'],
                  dueDate: new Date(now.getTime() + 2 * day),
                  isComplete: false,
                },
                {
                  title: 'Build notification system',
                  description: 'Email + in-app notifications for task assignments and due dates.',
                  order: 2,
                  labels: ['Backend', 'High Priority'],
                  dueDate: new Date(now.getTime() - 1 * day), // overdue
                  isComplete: false,
                },
                {
                  title: 'API rate limiting',
                  description: 'Implement Redis-based rate limiting on all public endpoints.',
                  order: 3,
                  labels: ['Backend', 'Security'],
                  dueDate: new Date(now.getTime() + 3 * day),
                  isComplete: false,
                },
              ],
            },
          },
          {
            title: 'In Review',
            order: 3,
            priority: 'medium',
            cards: {
              create: [
                {
                  title: 'Mobile responsive layout',
                  description: 'Ensure all pages are fully responsive from 320px to 1440px.',
                  order: 1,
                  labels: ['Frontend', 'Design'],
                  dueDate: new Date(now.getTime() + 1 * day),
                  isComplete: false,
                },
                {
                  title: 'Dark mode support',
                  description: 'Implement CSS variables-based dark mode toggle.',
                  order: 2,
                  labels: ['Frontend'],
                  dueDate: new Date(now.getTime() + 4 * day),
                  isComplete: false,
                },
              ],
            },
          },
          {
            title: 'Done',
            order: 4,
            isComplete: true,
            cards: {
              create: [
                {
                  title: 'Set up CI/CD pipeline',
                  description: 'GitHub Actions with automated tests and staging deployment.',
                  order: 1,
                  labels: ['DevOps'],
                  isComplete: true,
                  updatedAt: new Date(now.getTime() - 1 * day),
                },
                {
                  title: 'Database schema design',
                  description: 'Final ERD approved with all relations and indexes.',
                  order: 2,
                  labels: ['Backend'],
                  isComplete: true,
                  updatedAt: new Date(now.getTime() - 2 * day),
                },
                {
                  title: 'Authentication system',
                  description: 'JWT-based auth with refresh tokens and password hashing.',
                  order: 3,
                  labels: ['Backend', 'Security'],
                  isComplete: true,
                  updatedAt: new Date(now.getTime() - 3 * day),
                },
              ],
            },
          },
        ],
      },
    },
  });

  // ── BOARD 2: Marketing Sprint ──────────────────────────────────────────────
  console.log('📋 Creating Board 2: Marketing Sprint...');
  const board2 = await prisma.board.create({
    data: {
      title: 'Marketing Sprint — May 2025',
      ownerId: userId,
      members: { create: { userId, role: 'owner' } },
      lists: {
        create: [
          {
            title: 'To Do',
            order: 1,
            priority: 'medium',
            cards: {
              create: [
                {
                  title: 'Write launch blog post',
                  description: 'Draft a 1,200-word announcement post for the v2.0 launch.',
                  order: 1,
                  labels: ['Content', 'Marketing'],
                  dueDate: new Date(now.getTime() + 6 * day),
                  isComplete: false,
                },
                {
                  title: 'Create social media graphics',
                  description: '8 social media banners for LinkedIn, Twitter, and Instagram.',
                  order: 2,
                  labels: ['Design', 'Marketing'],
                  dueDate: new Date(now.getTime() + 7 * day),
                  isComplete: false,
                },
                {
                  title: 'Set up email drip campaign',
                  description: 'Configure 5-email onboarding drip in Mailchimp.',
                  order: 3,
                  labels: ['Marketing', 'Email'],
                  dueDate: new Date(now.getTime() + 10 * day),
                  isComplete: false,
                },
                {
                  title: 'Record product demo video',
                  description: '3-minute walkthrough video for the landing page.',
                  order: 4,
                  labels: ['Content'],
                  dueDate: new Date(now.getTime() + 9 * day),
                  isComplete: false,
                },
              ],
            },
          },
          {
            title: 'Doing',
            order: 2,
            priority: 'high',
            cards: {
              create: [
                {
                  title: 'A/B test landing page headlines',
                  description: 'Run 2-week A/B test with 3 headline variants using Google Optimize.',
                  order: 1,
                  labels: ['Marketing', 'Analytics'],
                  dueDate: new Date(now.getTime() + 14 * day),
                  isComplete: false,
                },
                {
                  title: 'Outreach to 20 tech influencers',
                  description: 'Cold email personalised pitches to 20 micro-influencers.',
                  order: 2,
                  labels: ['Marketing'],
                  dueDate: new Date(now.getTime() - 2 * day), // overdue
                  isComplete: false,
                },
              ],
            },
          },
          {
            title: 'Completed',
            order: 3,
            isComplete: true,
            cards: {
              create: [
                {
                  title: 'Define launch messaging framework',
                  order: 1,
                  labels: ['Marketing'],
                  isComplete: true,
                  updatedAt: new Date(now.getTime() - 4 * day),
                },
                {
                  title: 'Update website copy for v2',
                  order: 2,
                  labels: ['Content', 'Design'],
                  isComplete: true,
                  updatedAt: new Date(now.getTime() - 2 * day),
                },
                {
                  title: 'Configure Google Analytics 4',
                  order: 3,
                  labels: ['Analytics'],
                  isComplete: true,
                  updatedAt: new Date(now.getTime() - 1 * day),
                },
              ],
            },
          },
        ],
      },
    },
  });

  // ── BOARD 3: Engineering Backlog ───────────────────────────────────────────
  console.log('📋 Creating Board 3: Engineering Backlog...');
  const board3 = await prisma.board.create({
    data: {
      title: 'Engineering — Bug Tracker',
      ownerId: userId,
      members: { create: { userId, role: 'owner' } },
      lists: {
        create: [
          {
            title: 'Open Bugs',
            order: 1,
            priority: 'high',
            cards: {
              create: [
                {
                  title: 'Fix memory leak in WebSocket handler',
                  description: 'Socket connections are not cleaned up on disconnect. Memory grows ~50MB/hr.',
                  order: 1,
                  labels: ['Bug', 'Critical', 'Backend'],
                  dueDate: new Date(now.getTime() - 3 * day), // overdue
                  isComplete: false,
                },
                {
                  title: 'Card drag-and-drop broken on Safari',
                  description: 'DnD library uses Pointer Events API which is not supported on Safari < 16.',
                  order: 2,
                  labels: ['Bug', 'Frontend'],
                  dueDate: new Date(now.getTime() + 2 * day),
                  isComplete: false,
                },
                {
                  title: 'Prisma N+1 query on board fetch',
                  description: 'Board detail endpoint makes N+1 queries for card assignees.',
                  order: 3,
                  labels: ['Bug', 'Performance', 'Backend'],
                  dueDate: new Date(now.getTime() + 5 * day),
                  isComplete: false,
                },
                {
                  title: 'JWT token not refreshed on expiry',
                  description: 'Users are logged out abruptly instead of silently refreshing the token.',
                  order: 4,
                  labels: ['Bug', 'Security'],
                  dueDate: new Date(now.getTime() + 1 * day),
                  isComplete: false,
                },
              ],
            },
          },
          {
            title: 'In Progress',
            order: 2,
            priority: 'high',
            cards: {
              create: [
                {
                  title: 'Fix hydration mismatch on dashboard',
                  description: 'React SSR hydration error due to Date.now() used during render.',
                  order: 1,
                  labels: ['Bug', 'Frontend'],
                  dueDate: new Date(now.getTime() + 1 * day),
                  isComplete: false,
                },
                {
                  title: 'Fix list rename sending plain string',
                  description: 'api.lists.update was passing title as bare string instead of { title }.',
                  order: 2,
                  labels: ['Bug', 'Backend'],
                  dueDate: new Date(now.getTime()),
                  isComplete: false,
                },
              ],
            },
          },
          {
            title: 'Fixed',
            order: 3,
            isComplete: true,
            cards: {
              create: [
                {
                  title: 'Fix 400 on list title update',
                  description: 'Body was sent as plain string — fixed to JSON object.',
                  order: 1,
                  labels: ['Bug', 'Backend'],
                  isComplete: true,
                  updatedAt: new Date(now.getTime() - 1 * day),
                },
                {
                  title: 'isComplete column missing migration',
                  description: 'Prisma schema had isComplete but DB migration was not run.',
                  order: 2,
                  labels: ['Bug', 'DevOps'],
                  isComplete: true,
                  updatedAt: new Date(now.getTime() - 3 * day),
                },
                {
                  title: 'Dashboard stats showing 0 for all cards',
                  description: 'getAll returned stub data without nested lists/cards.',
                  order: 3,
                  labels: ['Bug', 'Frontend'],
                  isComplete: true,
                  updatedAt: new Date(now.getTime() - 2 * day),
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('\n✅ Seed complete!');
  console.log(`   Board 1: ${board1.title} (id: ${board1.id})`);
  console.log(`   Board 2: ${board2.title} (id: ${board2.id})`);
  console.log(`   Board 3: ${board3.title} (id: ${board3.id})`);
  console.log('\n🎉 Visit http://localhost:3000/boards to see your data!');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
