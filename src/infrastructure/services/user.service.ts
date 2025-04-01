import jwt from 'jsonwebtoken';
import { User, UserRole } from '../../domain/entities/User';
import { SignupRequestDto, LoginRequestDto, SignUpResponseDto, LoginResponseDto } from '../../domain/dtos/auth.dto';
import { UserRepository } from '../repositories/user.repository';
import userModel from '../models/user.model';
import bcrypt from 'bcrypt';
import { EditUserDto, GetProfileResponseDto, GetUsersResponseDto } from '../../domain/dtos/users.dto';

export class UserService {
  constructor(private userRepository: UserRepository) { }

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
      console.error('Error in login:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

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

  async getUsers(): Promise<GetUsersResponseDto> {
    const users = await this.userRepository.findAll();
    if (!users) {
      throw new Error('No users found');
    }
    return users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    })) as GetUsersResponseDto;
  }

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