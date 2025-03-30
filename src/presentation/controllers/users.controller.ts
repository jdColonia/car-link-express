import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../infrastructure/services/user.service';
import { MongoUserRepository } from '../../infrastructure/repositories/user.repository';
import { GetProfileResponseDto, GetUsersResponseDto } from '../../domain/dtos/users.dto';
import { UserRole } from '../../domain/entities/User';

const userRepository = new MongoUserRepository();
const userService = new UserService(userRepository);

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