import { UserService } from '../../../src/infrastructure/services/user.service';
import { UserRepository } from '../../../src/infrastructure/repositories/user.repository';
import { User, UserRole } from '../../../src/domain/entities/User';
import { SignupRequestDto, LoginRequestDto } from '../../../src/domain/dtos/auth.dto';
import { EditUserDto, GetProfileResponseDto, GetUsersResponseDto } from '../../../src/domain/dtos/users.dto';
import bcrypt from 'bcrypt';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked_jwt_token'),
}));

describe('UserService', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  const mockUser: User = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashed_password',
    roles: [UserRole.TENANT],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSignUpDto: SignupRequestDto = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashed_password',
  };

  const mockLoginDto: LoginRequestDto = {
    email: 'test@example.com',
    password: 'hashed_password',
  };

  const mockEditUserDto: EditUserDto = {
    email: 'newemail@example.com',
  };

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
    };

    userService = new UserService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error if user already exists during signup', async () => {
    mockRepository.findByEmail.mockResolvedValue(mockUser);

    await expect(userService.signup(mockSignUpDto)).rejects.toThrow(
      'User with this email already exists'
    );

    expect(mockRepository.create).not.toHaveBeenCalled();
  });


  it('should throw error if username is already taken during signup', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.findByUsername.mockResolvedValue(mockUser);

    await expect(userService.signup(mockSignUpDto)).rejects.toThrow(
      'Username is already taken'
    );

    expect(mockRepository.create).not.toHaveBeenCalled();
  });
;

  it('should throw error if user is not found during login', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);

    await expect(userService.login(mockLoginDto)).rejects.toThrow('Invalid email');
  });


  it('should throw error if user is not found during profile retrieval', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(userService.getProfile(mockUser.id)).rejects.toThrow('User not found');
  });

  it('should successfully retrieve user profile', async () => {
    mockRepository.findById.mockResolvedValue(mockUser);

    const response = await userService.getProfile(mockUser.id);

    expect(response.id).toBe(mockUser.id);
    expect(response.username).toBe(mockUser.username);
    expect(response.email).toBe(mockUser.email);
  });

  it('should throw error if user is not found during edit', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(
      userService.editUser(mockUser.id, mockEditUserDto)
    ).rejects.toThrow('User not found');
  });

  it('should throw error if user is not found during deletion', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(userService.deleteUser(mockUser.id)).rejects.toThrow('User not found');
  });

  it('should successfully delete a user', async () => {
    mockRepository.findById.mockResolvedValue(mockUser);
    mockRepository.delete.mockResolvedValue(true);

    const response = await userService.deleteUser(mockUser.id);

    expect(response).toBe(true);
  });

  it('should successfully return all users', async () => {
    const mockUsers = [mockUser, { ...mockUser, id: '124', username: 'testuser2' }];
    mockRepository.findAll.mockResolvedValue(mockUsers);

    const response = await userService.getUsers();

    expect(response.length).toBe(2);
    expect(response[0].id).toBe(mockUser.id);
  });

  it('should throw error if user not found during addUserRole', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(
      userService.addUserRole(mockUser.id, UserRole.ADMIN)
    ).rejects.toThrow('User not found');
  });

  it('should throw error if invalid role is provided during addUserRole', async () => {
    mockRepository.findById.mockResolvedValue(mockUser);

    await expect(
      userService.addUserRole(mockUser.id, 'invalid_role' as UserRole)
    ).rejects.toThrow('Invalid Role. Permitted roles are: tenant, user, admin');
  });

});
