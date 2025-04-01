import { UserService } from '../../../src/infrastructure/services/user.service';
import { UserRepository } from '../../../src/infrastructure/repositories/user.repository';
import { User, UserRole } from '../../../src/domain/entities/User';
import { SignupRequestDto, LoginRequestDto } from '../../../src/domain/dtos/auth.dto';
import { EditUserDto, GetProfileResponseDto, GetUsersResponseDto } from '../../../src/domain/dtos/users.dto';
import bcrypt from 'bcrypt';

// Mock environment variable
process.env.JWT_SECRET = 'test_secret';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked_jwt_token'),
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
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
    password: 'password123',
  };

  const mockLoginDto: LoginRequestDto = {
    email: 'test@example.com',
    password: 'password123',
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

  describe('signup', () => {
    it('should throw error if user already exists during signup', async () => {
      mockRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(userService.signup(mockSignUpDto)).rejects.toThrow(
        'User with this email already exists'
      );

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if username is already taken during signup', async () => {
      mockRepository.findByEmail.mockResolvedValue(null as unknown as User);
      mockRepository.findByUsername.mockResolvedValue(mockUser);

      await expect(userService.signup(mockSignUpDto)).rejects.toThrow(
        'Username is already taken'
      );

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should successfully register a new user', async () => {
      // Setup mocks
      mockRepository.findByEmail.mockResolvedValue(null as unknown as User);
      mockRepository.findByUsername.mockResolvedValue(null as unknown as User);
      mockRepository.create.mockResolvedValue({
        ...mockUser,
        password: 'hashed_password' // Simulating hashed password
      });

      // Execute
      const result = await userService.signup(mockSignUpDto);

      // Verify
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...mockSignUpDto,
        roles: [UserRole.TENANT],
        id: ''
      });
      expect(result).toEqual({
        token: 'mocked_jwt_token',
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          roles: mockUser.roles
        }
      });
    });
  });

  describe('login', () => {
    it('should throw error if user is not found during login', async () => {
      mockRepository.findByEmail.mockResolvedValue(null as unknown as User);

      await expect(userService.login(mockLoginDto)).rejects.toThrow('Invalid email');
    });

    it('should throw error if password is incorrect', async () => {
      mockRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(userService.login(mockLoginDto)).rejects.toThrow('Invalid email or password');
    });

    it('should successfully login a user with valid credentials', async () => {
      // Setup mocks
      mockRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Execute
      const result = await userService.login(mockLoginDto);

      // Verify
      expect(bcrypt.compare).toHaveBeenCalledWith(mockLoginDto.password, mockUser.password);
      expect(result).toEqual({
        token: 'mocked_jwt_token'
      });
    });
  });

  describe('createUser', () => {
    it('should throw error if user already exists during createUser', async () => {
      mockRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(userService.createUser(mockSignUpDto)).rejects.toThrow(
        'User with this email already exists'
      );

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if username is already taken during createUser', async () => {
      mockRepository.findByEmail.mockResolvedValue(null as unknown as User);
      mockRepository.findByUsername.mockResolvedValue(mockUser);

      await expect(userService.createUser(mockSignUpDto)).rejects.toThrow(
        'Username is already taken'
      );

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should successfully create a new user', async () => {
      // Setup mocks
      mockRepository.findByEmail.mockResolvedValue(null as unknown as User);
      mockRepository.findByUsername.mockResolvedValue(null as unknown as User);
      mockRepository.create.mockResolvedValue({
        ...mockUser,
        password: 'hashed_password' // Simulating hashed password
      });

      // Execute
      const result = await userService.createUser(mockSignUpDto);

      // Verify
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...mockSignUpDto,
        roles: [UserRole.TENANT],
        id: ''
      });
      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        roles: mockUser.roles
      });
    });
  });

  describe('getProfile', () => {
    it('should throw error if user is not found during profile retrieval', async () => {
      mockRepository.findById.mockResolvedValue(null as unknown as User);

      await expect(userService.getProfile(mockUser.id)).rejects.toThrow('User not found');
    });

    it('should successfully retrieve user profile', async () => {
      mockRepository.findById.mockResolvedValue(mockUser);

      const response = await userService.getProfile(mockUser.id);

      expect(response.id).toBe(mockUser.id);
      expect(response.username).toBe(mockUser.username);
      expect(response.email).toBe(mockUser.email);
    });
  });

  describe('editUser', () => {
    it('should throw error if user is not found during edit', async () => {
      mockRepository.findById.mockResolvedValue(null as unknown as User);

      await expect(
        userService.editUser(mockUser.id, mockEditUserDto)
      ).rejects.toThrow('User not found');
    });

    it('should throw error if update fails', async () => {
      mockRepository.findById.mockResolvedValue(mockUser);
      mockRepository.update.mockResolvedValue(null as unknown as User);

      await expect(
        userService.editUser(mockUser.id, mockEditUserDto)
      ).rejects.toThrow('User update failed');
    });

    it('should successfully update user profile', async () => {
      // Setup mocks
      mockRepository.findById.mockResolvedValue(mockUser);
      const updatedUser = {
        ...mockUser,
        email: mockEditUserDto.email || 'default@example.com'
      };
      mockRepository.update.mockResolvedValue(updatedUser);

      // Execute
      const result = await userService.editUser(mockUser.id, mockEditUserDto);

      // Verify
      expect(mockRepository.update).toHaveBeenCalledWith(mockUser.id, mockEditUserDto);
      expect(result).toEqual({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        roles: updatedUser.roles
      });
    });
  });

  describe('deleteUser', () => {
    it('should throw error if user is not found during deletion', async () => {
      mockRepository.findById.mockResolvedValue(null as unknown as User);

      await expect(userService.deleteUser(mockUser.id)).rejects.toThrow('User not found');
    });

    it('should throw error if deletion fails', async () => {
      mockRepository.findById.mockResolvedValue(mockUser);
      mockRepository.delete.mockResolvedValue(false);

      await expect(userService.deleteUser(mockUser.id)).rejects.toThrow('User deletion failed');
    });

    it('should successfully delete a user', async () => {
      mockRepository.findById.mockResolvedValue(mockUser);
      mockRepository.delete.mockResolvedValue(true);

      const response = await userService.deleteUser(mockUser.id);

      expect(response).toBe(true);
    });
  });

  describe('getUsers', () => {
    it('should throw error if no users are found', async () => {
      mockRepository.findAll.mockResolvedValue([] as User[]);

      const result = await userService.getUsers();

      expect(result).toEqual([]);
    });

    it('should successfully return all users', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: '124', username: 'testuser2' }];
      mockRepository.findAll.mockResolvedValue(mockUsers);

      const response = await userService.getUsers();

      expect(response.length).toBe(2);
      expect(response[0].id).toBe(mockUser.id);
    });
  });

  describe('addUserRole', () => {
    it('should throw error if user not found during addUserRole', async () => {
      mockRepository.findById.mockResolvedValue(null as unknown as User);

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

    it('should throw error if user update fails during addUserRole', async () => {
      mockRepository.findById.mockResolvedValue(mockUser);
      mockRepository.update.mockResolvedValue(null as unknown as User);

      await expect(
        userService.addUserRole(mockUser.id, UserRole.ADMIN)
      ).rejects.toThrow('User update failed');
    });

    it('should throw error if user not found after update', async () => {
      mockRepository.findById.mockResolvedValueOnce(mockUser); // First call
      mockRepository.update.mockResolvedValue(mockUser);
      mockRepository.findById.mockResolvedValueOnce(null as unknown as User); // Second call

      await expect(
        userService.addUserRole(mockUser.id, UserRole.ADMIN)
      ).rejects.toThrow('User not found after update');
    });

    it('should successfully add a role to a user', async () => {
      // Setup mocks
      mockRepository.findById.mockResolvedValueOnce(mockUser); // First call
      mockRepository.update.mockResolvedValue(mockUser);

      const updatedUser = {
        ...mockUser,
        roles: [...mockUser.roles, UserRole.ADMIN]
      };
      mockRepository.findById.mockResolvedValueOnce(updatedUser); // Second call

      // Execute
      const result = await userService.addUserRole(mockUser.id, UserRole.ADMIN);

      // Verify
      expect(mockRepository.update).toHaveBeenCalledWith(mockUser.id, {
        roles: expect.arrayContaining([UserRole.TENANT, UserRole.ADMIN])
      });
      expect(result).toEqual({
        token: 'mocked_jwt_token',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          roles: updatedUser.roles
        }
      });
    });

    it('should not add duplicate roles', async () => {
      // Setup mocks
      mockRepository.findById.mockResolvedValueOnce({
        ...mockUser,
        roles: [UserRole.TENANT, UserRole.ADMIN]
      }); // First call

      mockRepository.update.mockResolvedValue(mockUser);
      mockRepository.findById.mockResolvedValueOnce({
        ...mockUser,
        roles: [UserRole.TENANT, UserRole.ADMIN]
      }); // Second call

      // Execute
      await userService.addUserRole(mockUser.id, UserRole.ADMIN);

      // Verify - roles array should have no duplicates
      expect(mockRepository.update).toHaveBeenCalledWith(mockUser.id, {
        roles: [UserRole.TENANT, UserRole.ADMIN]
      });
    });
  });

  describe('generateToken', () => {
    it('should throw error if JWT_SECRET is not defined', async () => {
      // Temporarily remove JWT_SECRET
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      mockRepository.findByEmail.mockResolvedValue(null as unknown as User);
      mockRepository.findByUsername.mockResolvedValue(null as unknown as User);
      mockRepository.create.mockResolvedValue(mockUser);

      await expect(userService.signup(mockSignUpDto)).rejects.toThrow(
        'JWT_SECRET is not defined in environment variables'
      );

      // Restore JWT_SECRET
      process.env.JWT_SECRET = originalSecret;
    });
  });
});

console.log('User service tests completed successfully!');