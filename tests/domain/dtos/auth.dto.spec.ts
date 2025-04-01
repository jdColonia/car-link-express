import {
    SignupRequestDto,
    LoginRequestDto,
    LoginResponseDto,
    SignUpResponseDto
} from '../../../src/domain/dtos/auth.dto';
import { GetProfileResponseDto } from '../../../src/domain/dtos/users.dto';
import { UserRole } from '../../../src/domain//entities/User';

describe('Auth DTOs', () => {
    describe('SignupRequestDto', () => {
        it('should have required properties', () => {
            const dto: SignupRequestDto = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'Password123!'
            };

            expect(dto).toHaveProperty('username', 'testuser');
            expect(dto).toHaveProperty('email', 'test@example.com');
            expect(dto).toHaveProperty('password', 'Password123!');
        });
    });

    describe('LoginRequestDto', () => {
        it('should have required properties', () => {
            const dto: LoginRequestDto = {
                email: 'test@example.com',
                password: 'Password123!'
            };

            expect(dto).toHaveProperty('email', 'test@example.com');
            expect(dto).toHaveProperty('password', 'Password123!');
        });
    });

    describe('LoginResponseDto', () => {
        it('should have token property', () => {
            const dto: LoginResponseDto = {
                token: 'jwt.token.here'
            };

            expect(dto).toHaveProperty('token', 'jwt.token.here');
            expect(typeof dto.token).toBe('string');
        });
    });

    describe('SignUpResponseDto', () => {
        it('should have token and user properties', () => {
            const mockUser: GetProfileResponseDto = {
                id: '123',
                username: 'testuser',
                email: 'test@example.com',
                roles: [UserRole.ADMIN]
            };

            const dto: SignUpResponseDto = {
                token: 'jwt.token.here',
                user: mockUser
            };

            expect(dto).toMatchObject({
                token: expect.any(String),
                user: {
                    id: expect.any(String),
                    username: expect.any(String),
                    email: expect.any(String),
                    roles: expect.any(Array)
                }
            });
        });
    });
});