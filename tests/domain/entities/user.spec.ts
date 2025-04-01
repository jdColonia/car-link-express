import { User, UserRole, UserPermission, Role } from '../../../src/domain/entities/User';

describe('User Entities', () => {
    const mockDate = new Date();

    const mockUser: User = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        password: 'securePassword123!',
        roles: [UserRole.ADMIN, UserRole.OWNER],
        createdAt: mockDate,
        updatedAt: mockDate
    };

    const mockPermission: UserPermission = {
        id: 'p1',
        name: 'delete_users',
        description: 'Can delete users'
    };

    const mockRole: Role = {
        id: 'r1',
        name: 'Super Admin',
        permissions: ['create_users', 'delete_users'],
        description: 'Full system access'
    };

    describe('User Entity', () => {
        it('should validate required properties', () => {
            expect(mockUser).toMatchObject({
                id: expect.any(String),
                username: expect.any(String),
                email: expect.any(String),
                password: expect.any(String),
                roles: expect.any(Array)
            });
        });

        it('should validate optional properties', () => {
            expect(mockUser).toEqual(expect.objectContaining({
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date)
            }));
        });

        it('should validate property types', () => {
            expect(typeof mockUser.username).toBe('string');
            expect(typeof mockUser.email).toBe('string');
            expect(Array.isArray(mockUser.roles)).toBe(true);
            expect(mockUser.roles.every(role => Object.values(UserRole).includes(role))).toBe(true);
        });

        it('should validate date ordering', () => {
            if (mockUser.createdAt && mockUser.updatedAt) {
                expect(mockUser.updatedAt.getTime())
                    .toBeGreaterThanOrEqual(mockUser.createdAt.getTime());
            }
        });

        it('should accept minimal user configuration', () => {
            const minimalUser: User = {
                id: '2',
                username: 'minimaluser',
                email: 'minimal@example.com',
                password: 'password',
                roles: [UserRole.TENANT]
            };

            expect(minimalUser).toBeDefined();
            expect(minimalUser).not.toHaveProperty('createdAt');
        });

        it('should validate email format', () => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            expect(mockUser.email).toMatch(emailRegex);
        });

        it('should validate password strength', () => {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;
            expect(mockUser.password).toMatch(passwordRegex);
        });

        it('should validate roles array content', () => {
            const invalidUser = {
                ...mockUser,
                roles: ['invalid_role']
            } as unknown as User;

            expect(invalidUser.roles.some(role => !Object.values(UserRole).includes(role))).toBe(true);
        });
    });

    describe('UserRole Enum', () => {
        it('should have correct role values', () => {
            expect(UserRole.ADMIN).toBe('admin');
            expect(UserRole.OWNER).toBe('owner');
            expect(UserRole.TENANT).toBe('tenant');
        });

        it('should contain all required roles', () => {
            expect(Object.keys(UserRole)).toEqual(['ADMIN', 'OWNER', 'TENANT']);
        });
    });

    describe('UserPermission Interface', () => {
        it('should validate required properties', () => {
            expect(mockPermission).toMatchObject({
                name: expect.any(String),
                description: expect.any(String)
            });
        });

        it('should validate optional id property', () => {
            const permissionWithoutId: UserPermission = {
                name: 'create_users',
                description: 'Can create users'
            };

            expect(permissionWithoutId).toBeDefined();
            expect(permissionWithoutId).not.toHaveProperty('id');
        });

        it('should validate property types', () => {
            expect(typeof mockPermission.name).toBe('string');
            expect(typeof mockPermission.description).toBe('string');
        });
    });

    describe('Role Interface', () => {
        it('should validate required properties', () => {
            expect(mockRole).toMatchObject({
                name: expect.any(String),
                permissions: expect.any(Array)
            });
        });

        it('should validate optional properties', () => {
            const minimalRole: Role = {
                name: 'Basic Role',
                permissions: []
            };

            expect(minimalRole).toBeDefined();
            expect(minimalRole).not.toHaveProperty('description');
        });

        it('should support different permission formats', () => {
            const roleWithObjectPermissions: Role = {
                name: 'Advanced Role',
                permissions: [mockPermission]
            };

            const roleWithStringPermissions: Role = {
                name: 'Basic Role',
                permissions: ['read_only']
            };

            expect(roleWithObjectPermissions.permissions[0]).toHaveProperty('name');
            expect(roleWithStringPermissions.permissions[0]).toBe('read_only');
        });

        it('should validate permissions array types', () => {
            const invalidPermissions = [123, true] as unknown[];
            const role = {
                ...mockRole,
                permissions: invalidPermissions
            } as unknown as Role;

            expect(role.permissions.some(p => typeof p !== 'string' && typeof p !== 'object')).toBe(true);
        });
    });
});