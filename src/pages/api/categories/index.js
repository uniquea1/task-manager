import prisma from '../../../lib/prisma';
import { verifyToken } from '../../../utils/jwt';

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  if (req.method === 'GET') {
    // Fetch all categories for the logged-in user
    const categories = await prisma.category.findMany({
      where: { userId: user.id }
    });

    return res.json(categories);
  }

  if (req.method === 'POST') {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const newCategory = await prisma.category.create({
      data: {
        name,
        userId: user.id
      }
    });

    return res.json(newCategory);
  }

  res.status(405).end(); // For methods other than GET and POST
}
