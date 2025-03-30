import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const checkRole = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      
      const hasPermission = decoded.roles.some((role: any) => 
        role.includes(requiredPermission)
      );

      if (!hasPermission) {
        res.status(403).json({ message: 'Insufficient permissions' });
        return;
      }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
  };
}; 