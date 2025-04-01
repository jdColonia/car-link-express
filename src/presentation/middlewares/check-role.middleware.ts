import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Middleware to check if the user has the required role or permission
export const checkRole = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract token from the Authorization header
      const token = req.headers.authorization?.split(' ')[1];

      // If no token is provided, respond with 401 Unauthorized
      if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
      }

      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

      // Check if the user has the required permission by verifying their roles
      const hasPermission = decoded.roles.some((role: any) =>
        role.includes(requiredPermission)
      );

      // If the user doesn't have the required permission, respond with 403 Forbidden
      if (!hasPermission) {
        res.status(403).json({ message: 'Insufficient permissions' });
        return;
      }

      // Proceed to the next middleware
      next();
    } catch (error) {
      // If the token is invalid, respond with 401 Unauthorized
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
  };
};
