import { verifyToken } from '../utils/jwt';

export default function authenticate(handler) {
  return async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      return handler(req, res);
    } catch (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
  };
}
