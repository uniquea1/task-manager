// import prisma from '../../../lib/prisma';
// import { verifyToken } from '../../../utils/jwt';

// export default async function handler(req, res) {
//   const { id } = req.query;

//   if (req.method === 'PUT') {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) return res.status(401).json({ error: 'Unauthorized' });

//     const decoded = verifyToken(token);
//     if (!decoded) return res.status(401).json({ error: 'Invalid token' });

//     const { title, description, status, categoryId } = req.body;

//     try {
//       const updatedTask = await prisma.task.update({
//         where: {
//           id: parseInt(id) // make sure it's a number
//         },
//         data: {
//           ...(title && { title }),
//           ...(description && { description }),
//           ...(status && { status }),
//           ...(categoryId && { categoryId: parseInt(categoryId) })
//         }
//       });

//       return res.json(updatedTask);
//     } catch (error) {
//       return res.status(400).json({ error: error.message });
//     }
//   }

//   res.status(405).end();
// }


import prisma from '../../../lib/prisma';
import { verifyToken } from '../../../utils/jwt';

export default async function handler(req, res) {
  const { id } = req.query;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  if (req.method === 'PUT') {
    try {
      const { title, description, status, categoryId } = req.body;

      const updatedTask = await prisma.task.update({
        where: { id: parseInt(id) },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(status && { status }),
          ...(categoryId && { categoryId: parseInt(categoryId) })
        },
        include: {
          category: {
            select: { name: true }
          }
        }
      });

      return res.json(updatedTask);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.task.delete({
        where: { id: parseInt(id) }
      });

      return res.json({ message: 'Task deleted' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).end(); // Method Not Allowed
}
