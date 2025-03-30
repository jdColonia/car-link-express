import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../infrastructure/services/user.service';
import { MongoUserRepository } from '../../infrastructure/repositories/user.repository';

const userRepository = new MongoUserRepository();
const authService = new UserService(userRepository);

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

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const result = await authService.login({email, password});
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

