import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../infrastructure/services/user.service';
import { MongoUserRepository } from '../../infrastructure/repositories/user.repository';
import { GetProfileResponseDto, GetUsersResponseDto } from '../../domain/dtos/users.dto';
import { UserRole } from '../../domain/entities/User';

const userRepository = new MongoUserRepository();
const userService = new UserService(userRepository);

/**
 * Creates a new user (admin operation)
 *
 * @param req - Express request object containing username, email, and password in the body
 * @param res - Express response object
 * @param next - Express next function
 * @returns Promise<void>
 *
 * @description
 * Creates a new user with the provided credentials.
 * Unlike signup, this doesn't return a token and is typically used by administrators.
 *
 * @response 201 - User successfully created
 * @response 400 - Missing required fields or user already exists
 */
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

/**
 * Retrieves a user's profile
 *
 * @param req - Express request object containing user ID in params
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Retrieves detailed profile information for a specific user.
 *
 * @response 200 - User profile details
 * @response 404 - User not found
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await userService.getProfile(req.params.userId);

    res.status(200).json(profile);

  } catch (error: any) {
    res.status(error.message === 'User not found' ? 404 : 500).json({ message: error.message });
  }
};

/**
 * Retrieves all users in the system
 *
 * @param req - Express request object
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Retrieves a list of all users in the system. Typically used by administrators.
 *
 * @response 200 - List of all users
 * @response 500 - Server error
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userService.getUsers();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

/**
 * Updates a user's profile
 *
 * @param req - Express request object containing user ID in params and update data in body
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Updates a user's profile with the provided data.
 *
 * @response 200 - Updated user profile
 * @response 400 - No fields to update
 * @response 404 - User not found
 */
export const editUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email } = req.body;

    if (username === undefined && email === undefined) {
      res.status(400).json({ message: "At least one field (username or email) is required" });
    }

    const updatedUser = await userService.editUser(req.params.userId, { username, email });

    res.status(200).json(updatedUser);

  } catch (error: any) {
    res.status(error.message === 'User not found' ? 404 : 500).json({ message: error.message });
  }
};

/**
 * Deletes a user
 *
 * @param req - Express request object containing user ID in params
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Deletes a user from the system.
 *
 * @response 200 - User successfully deleted
 * @response 404 - User not found
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedUser = await userService.deleteUser(req.params.userId);

    res.status(200).json(deletedUser);

  } catch (error: any) {
    res.status(error.message === 'User not found' ? 404 : 500).json({ message: error.message });
  }
};

/**
 * Adds the OWNER role to a user
 *
 * @param req - Express request object containing user ID in params
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Adds the OWNER role to a user, allowing them to list vehicles for rent.
 *
 * @response 200 - Updated user with new role
 * @response 400 - User not found or invalid role
 */
export const addOwnerRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedUser = await userService.addUserRole(req.params.userId, UserRole.OWNER);

    res.json(updatedUser);
  } catch (error: any) {
    res.status(error.message === 'User not found' || error.message.startsWith('Invalid Role') ? 400 : 500).json({ message: error.message });
  }
};

/**
 * Adds the ADMIN role to a user
 *
 * @param req - Express request object containing user ID in params
 * @param res - Express response object
 * @returns Promise<void>
 *
 * @description
 * Adds the ADMIN role to a user, granting them administrative privileges.
 *
 * @response 200 - Updated user with new role
 * @response 400 - User not found or invalid role
 */
export const addAdminRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedUser = await userService.addUserRole(req.params.userId, UserRole.ADMIN);
    res.json(updatedUser);
  } catch (error: any) {
    res.status(error.message === 'User not found' || error.message.startsWith('Invalid Role') ? 400 : 500).json({ message: error.message });
  }
};