import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../infrastructure/services/user.service';
import { MongoUserRepository } from '../../infrastructure/repositories/user.repository';

const userRepository = new MongoUserRepository();
const authService = new UserService(userRepository);

/**
 * Handles user registration
 *
 * @param req - Express request object containing username, email, and password in the body
 * @param res - Express response object
 * @param next - Express next function
 * @returns Promise<void>
 *
 * @description
 * Creates a new user account with the provided credentials.
 * Returns a JWT token and user information upon successful registration.
 *
 * @response 201 - User successfully created with token
 * @response 400 - Missing required fields or user already exists
 */
export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const result = await authService.signup({ username, email, password });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Handles user authentication
 *
 * @param req - Express request object containing email and password in the body
 * @param res - Express response object
 * @param next - Express next function
 * @returns Promise<void>
 *
 * @description
 * Authenticates a user with the provided credentials.
 * Returns a JWT token upon successful authentication.
 *
 * @response 200 - User successfully authenticated with token
 * @response 400 - Missing required fields
 * @response 401 - Invalid credentials
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const result = await authService.login({ email, password });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};