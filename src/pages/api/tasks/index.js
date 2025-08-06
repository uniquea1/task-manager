// import prisma from '../../../lib/prisma';
// import authenticate from '../../../middlewares/auth';

// async function handler(req, res) {
//   const userId = req.user.id;

//   if (req.method === 'GET') {
//     const { status, category } = req.query;
//     const tasks = await prisma.task.findMany({
//       where: {
//         userId,
//         ...(status ? { status } : {}),
//         ...(category ? { category: { name: category } } : {})
//       }
//     });
//     return res.json(tasks);
//   }

//   if (req.method === 'POST') {
//     const { title, description, categoryId } = req.body;
//     if (!title) return res.status(400).json({ error: 'Title is required' });

//     const task = await prisma.task.create({
//       data: { title, description, userId, categoryId: categoryId || null }
//     });
//     return res.status(201).json(task);
//   }

//   return res.status(405).end();
// }

// export default authenticate(handler);
import prisma from '../../../lib/prisma';
import { verifyToken } from '../../../utils/jwt';

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  if (req.method === 'GET') {
    try {
      const { category, status } = req.query;

      const tasks = await prisma.task.findMany({
        where: {
          userId: user.id,
          ...(status ? { status } : {}),
          ...(category ? { category: { name: { equals: category, mode: 'insensitive' } } } : {})
        },
        include: {
          category: {
            select: { name: true }
          }
        }
      });

      return res.json(tasks);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, description, status, categoryId } = req.body;

      if (!title) return res.status(400).json({ error: 'Title is required' });

      const newTask = await prisma.task.create({
        data: {
          title,
          description,
          status: status || 'pending',
          userId: user.id,
          ...(categoryId && { categoryId: parseInt(categoryId) })
        },
        include: {
          category: {
            select: { name: true }
          }
        }
      });

      return res.json(newTask);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).end(); // Method Not Allowed
}
