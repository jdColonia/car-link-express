import jwt from 'jsonwebtoken';
import { User, UserRole } from '../../domain/entities/User';
import { SignupRequestDto, LoginRequestDto, SignUpResponseDto, LoginResponseDto } from '../../domain/dtos/auth.dto';
import { UserRepository } from '../repositories/user.repository';
import userModel from '../models/user.model';
import bcrypt from 'bcrypt';
import { EditUserDto, GetProfileResponseDto, GetUsersResponseDto } from '../../domain/dtos/users.dto';

/**
 * Service class responsible for handling user-related business logic
 * Manages user authentication, profile operations, and role management
 */
export class UserService {
  /**
   * Creates a new UserService instance
   * @param userRepository - Repository for user data operations
   */
  constructor(private userRepository: UserRepository) { }

  /**
   * Registers a new user in the system
   * @param signupDto - User registration data
   * @returns Token and user information
   * @throws Error if user with email or username already exists
   */
  async signup(signupDto: SignupRequestDto): Promise<SignUpResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(signupDto.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const existingUsername = await this.userRepository.findByUsername(signupDto.username);
    if (existingUsername) {
      throw new Error('Username is already taken');
    }

    const newUser = await this.userRepository.create({
      ...signupDto,
      roles: [UserRole.TENANT],
      id: ''
    });

    // Generate JWT token
    const token = this.generateToken(newUser);

    return {
      token,
      user: {
        id: newUser.id!,
        username: newUser.username,
        email: newUser.email,
        roles: newUser.roles,
      },
    } as SignUpResponseDto;
  }

  /**
   * Authenticates a user and generates an access token
   * @param loginDto - User login credentials
   * @returns Authentication token
   * @throws Error if credentials are invalid
   */
  async login(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    try {

      const user = await this.userRepository.findByEmail(loginDto.email);

      if (!user) {
        throw new Error('Invalid email');
      }

      const isValidPassword = await bcrypt.compare(loginDto.password, user.password);
      if (!isValidPassword) throw new Error('Invalid email or password');

      const token = this.generateToken(user);

      return {
        token: token 
      } as LoginResponseDto;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Creates a new user (admin operation)
   * @param signupDto - User creation data
   * @returns Created user profile information
   * @throws Error if user with email or username already exists
   */
  async createUser(signupDto: SignupRequestDto): Promise<GetProfileResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(signupDto.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const existingUsername = await this.userRepository.findByUsername(signupDto.username);
    if (existingUsername) {
      throw new Error('Username is already taken');
    }

    const newUser = await this.userRepository.create({
      ...signupDto,
      roles: [UserRole.TENANT],
      id: ''
    });


    return {
        id: newUser.id!,
        username: newUser.username,
        email: newUser.email,
        roles: newUser.roles,
    } as GetProfileResponseDto;
  }

  /**
   * Retrieves a user's profile information
   * @param userId - The user ID to retrieve
   * @returns User profile information
   * @throws Error if the user doesn't exist
   */
  async getProfile(userId: string): Promise<GetProfileResponseDto>{
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    } as GetProfileResponseDto;
  }

  /**
   * Updates a user's profile information
   * @param userId - The ID of the user to update
   * @param editUserDto - The updated user data
   * @returns Updated user profile information
   * @throws Error if the user doesn't exist or update fails
   */
  async editUser(userId: string, editUserDto: EditUserDto): Promise<GetProfileResponseDto>{
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await this.userRepository.update(userId, editUserDto);
    if (!updatedUser) {
      throw new Error('User update failed');
    }

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      roles: updatedUser.roles,
    } as GetProfileResponseDto;
  }

  /**
   * Deletes a user from the system
   * @param userId - The ID of the user to delete
   * @returns Boolean indicating success
   * @throws Error if the user doesn't exist or deletion fails
   */
  async deleteUser(userId: string): Promise<Boolean>{
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const deletedUser = await this.userRepository.delete(userId);
    
    if (!deletedUser) {
      throw new Error('User deletion failed');
    }
    return true;
  }

  /**
   * Retrieves all users in the system
   * @returns List of all users
   * @throws Error if no users are found
   */
  async getUsers(): Promise<GetUsersResponseDto> {
    const users = await this.userRepository.findAll()
    if (!users) {
      throw new Error("No users found")
    }
    return users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    })) as GetUsersResponseDto;
  }

  /**
   * Adds a role to a user
   * @param userId - The ID of the user
   * @param newRole - The role to add
   * @returns Updated token and user information
   * @throws Error if the user doesn't exist, role is invalid, or update fails
   */
  async addUserRole(userId: string, newRole: UserRole): Promise<SignUpResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!Object.values(UserRole).includes(newRole)) {
      throw new Error('Invalid Role. Permitted roles are: tenant, user, admin');
    }

    user.roles = [...new Set([...user.roles, newRole])];

    const updateResult = await this.userRepository.update(userId, { roles: user.roles });

    if (!updateResult) {
      throw new Error('User update failed');
    }

    const updatedUser = await this.userRepository.findById(userId);

    if (!updatedUser) {
      throw new Error('User not found after update');
    }

    const token = this.generateToken(updatedUser);

    return {
      token: token,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        roles: updatedUser.roles,
      }
    } as SignUpResponseDto;


  }

  /**
   * Generates a JWT token for a user
   * @param user - The user to generate a token for
   * @returns JWT token string
   * @throws Error if JWT_SECRET environment variable is not defined
   * @private
   */
  private generateToken(user: User): string {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }
}