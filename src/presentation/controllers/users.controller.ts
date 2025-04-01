import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../infrastructure/services/user.service';
import { MongoUserRepository } from '../../infrastructure/repositories/user.repository';
import { GetProfileResponseDto, GetUsersResponseDto } from '../../domain/dtos/users.dto';
import { UserRole } from '../../domain/entities/User';

const userRepository = new MongoUserRepository();
const userService = new UserService(userRepository);

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const result = await userService.createUser({ username, email, password });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await userService.getProfile(req.params.userId);

    res.status(200).json(profile);

  } catch (error: any) {
    res.status(error.message === 'User not found' ? 404 : 500).json({ message: error.message });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userService.getUsers();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};


export const editUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email } = req.body;

    if (username === undefined && email === undefined) {
      res.status(400).json({ message: "At least one field (username or email) is required" });
    }

    const updatedUser = await userService.editUser(req.params.userId, {username, email});

    res.status(200).json(updatedUser);

  } catch (error: any) {
    res.status(error.message === 'User not found' ? 404 : 500).json({ message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedUser = await userService.deleteUser(req.params.userId);

    res.status(200).json(deletedUser);

  } catch (error: any) {
    res.status(error.message === 'User not found' ? 404 : 500).json({ message: error.message });
  }
};

export const addOwnerRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedUser = await userService.addUserRole(req.params.userId, UserRole.OWNER);
  
    res.json( updatedUser );
  } catch (error: any) {
    res.status(error.message === 'User not found' || error.message.startsWith('Invalid Role') ? 400 : 500).json({ message: error.message });
  }
};

export const addAdminRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedUser = await userService.addUserRole(req.params.userId, UserRole.ADMIN);
    res.json(updatedUser);
  } catch (error: any) {
    res.status(error.message === 'User not found' || error.message.startsWith('Invalid Role') ? 400 : 500).json({ message: error.message });
  }
};
