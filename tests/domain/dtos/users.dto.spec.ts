import {
    GetProfileResponseDto,
    EditUserDto,
    GetUsersResponseDto
} from '../../../src/domain/dtos/users.dto';
import { UserRole } from '../../../src/domain/entities/User';

describe('Users DTOs', () => {
    describe('GetProfileResponseDto', () => {
        it('should contain user profile data', () => {
            const dto: GetProfileResponseDto = {
                id: '123',
                username: 'testuser',
                email: 'test@example.com',
                roles: [UserRole.ADMIN]
            };

            expect(dto).toEqual({
                id: expect.any(String),
                username: expect.any(String),
                email: expect.any(String),
                roles: expect.arrayContaining([UserRole.ADMIN])
            });
        });
    });

    describe('EditUserDto', () => {
        it('should allow partial updates', () => {
            const dto: EditUserDto = {
                username: 'newusername'
            };

            expect(dto).toMatchObject({
                username: 'newusername'
            });

            const dto2: EditUserDto = {
                email: 'new@example.com'
            };

            expect(dto2).toMatchObject({
                email: 'new@example.com'
            });
        });
    });

    describe('GetUsersResponseDto', () => {
        it('should be an array of user profiles', () => {
            const mockUsers: GetUsersResponseDto = [
                {
                    id: '123',
                    username: 'user1',
                    email: 'user1@example.com',
                    roles: [UserRole.ADMIN]
                },
                {
                    id: '456',
                    username: 'user2',
                    email: 'user2@example.com',
                    roles: [UserRole.ADMIN]
                }
            ];

            expect(mockUsers).toBeInstanceOf(Array);
            expect(mockUsers.length).toBe(2);
            mockUsers.forEach(user => {
                expect(user).toHaveProperty('id');
                expect(user).toHaveProperty('username');
                expect(user).toHaveProperty('email');
                expect(user).toHaveProperty('roles');
            });
        });
    });
});