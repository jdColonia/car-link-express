import { User } from '../../domain/entities/User';
import UserModel, { UserDocument } from '../models/user.model';

/**
 * Interface defining the contract for user data operations
 */
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(user: User): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}

/**
 * MongoDB implementation of the UserRepository interface
 * Handles all user-related database operations
 */
export class MongoUserRepository implements UserRepository {
  /**
   * Finds a user by their unique identifier
   * @param id - The user ID to search for
   * @returns The user if found, null otherwise
   */
  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    return user ? this.documentToEntity(user) : null;
  }

  /**
   * Finds a user by their email address
   * @param email - The email to search for
   * @returns The user if found, null otherwise
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user ? this.documentToEntity(user) : null;
  }

  /**
   * Finds a user by their username
   * @param username - The username to search for
   * @returns The user if found, null otherwise
   */
  async findByUsername(username: string): Promise<User | null> {
    const user = await UserModel.findOne({ username });
    return user ? this.documentToEntity(user) : null;
  }

  /**
   * Retrieves all users from the database (excluding passwords)
   * @returns Array of all user entities
   */
  async findAll(): Promise<User[]> {
    const users = await UserModel.find().select('-password');
    return users.map(this.documentToEntity);
  }

  /**
   * Creates a new user in the database
   * @param user - The user entity to create
   * @returns The created user with generated ID
   */
  async create(user: User): Promise<User> {
    const newUser = await UserModel.create(user);
    return this.documentToEntity(newUser);
  }

  /**
   * Updates an existing user record
   * @param id - The ID of the user to update
   * @param user - Partial user object with fields to update
   * @returns The updated user or null if not found
   */
  async update(id: string, user: Partial<User>): Promise<User | null> {
    const updatedUser = await UserModel.findByIdAndUpdate(id, user, { new: true });
    return updatedUser ? this.documentToEntity(updatedUser) : null;
  }

  /**
   * Deletes a user from the database
   * @param id - The ID of the user to delete
   * @returns Boolean indicating success or failure
   */
  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Converts a MongoDB document to a domain entity
   * @param document - The MongoDB document to convert
   * @returns A clean domain entity
   * @private
   */
  private documentToEntity(document: UserDocument): User {
    return {
      id: document._id?.toString() || '',
      username: document.username,
      email: document.email,
      password: document.password,
      roles: document.roles,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
} 