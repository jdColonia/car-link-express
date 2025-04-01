import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../../domain/entities/User';

// Interface for decoding the JWT token
interface DecodedToken {
  id: string;       // User ID
  email: string;    // User email
  roles: [string];  // Array of user roles
  iat: number;      // Issued at timestamp
  exp: number;      // Expiration timestamp
}

// Extend the Express Request interface to include a user property for the decoded JWT token
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

// Middleware to authenticate a user based on JWT token
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Extract token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];

    // If no token is provided, respond with 401 Unauthorized
    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Check if JWT_SECRET is defined in environment variables
    if (!process.env.JWT_SECRET) {
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    // Verify the JWT token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
    // Attach the decoded token to the request object
    req.user = decoded;

    // Proceed to the next middleware
    next();
  } catch (error) {
    // If the token is invalid or expired, respond with 401 Unauthorized
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
};