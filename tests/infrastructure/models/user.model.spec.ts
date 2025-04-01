import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import UserModel, { UserDocument } from '../../..//src/infrastructure/models/user.model';
import { UserRole } from '../../../src/domain/entities/User';
import bcrypt from 'bcryptjs';
import { describe, beforeAll, afterAll, beforeEach, it, expect } from '@jest/globals';

interface MongooseError extends Error {
    errors?: { [key: string]: mongoose.Error.ValidatorError };
    code?: number;
}

describe('User Model', () => {
    let mongoServer: MongoMemoryServer;
    const mockUserData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        roles: [UserRole.TENANT]
    };

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await UserModel.deleteMany({});
    });

    describe('Create Operations', () => {
        it('should create a user with valid data', async () => {
            const user = new UserModel(mockUserData);
            const savedUser = await user.save();

            expect(savedUser._id).toBeDefined();
            expect(savedUser.username).toBe(mockUserData.username);
            expect(savedUser.email).toBe(mockUserData.email);
            // Password should be hashed, not stored as plaintext
            expect(savedUser.password).not.toBe(mockUserData.password);
            expect(savedUser.roles).toEqual(mockUserData.roles);
            expect(savedUser.createdAt).toBeInstanceOf(Date);
            expect(savedUser.updatedAt).toBeInstanceOf(Date);
        });

        it('should auto-trim username and email whitespace', async () => {
            const user = new UserModel({
                ...mockUserData,
                username: '  trimmedUser  ',
                email: '  EMAIL@example.com  '
            });

            const savedUser = await user.save();
            expect(savedUser.username).toBe('trimmedUser');
            expect(savedUser.email).toBe('email@example.com'); // Should be lowercase
        });

        it('should hash the password before saving', async () => {
            const user = new UserModel(mockUserData);
            const savedUser = await user.save();

            // Verify the password is hashed
            const isMatch = await bcrypt.compare(mockUserData.password, savedUser.password);
            expect(isMatch).toBe(true);
        });

        it('should not rehash the password if it was not modified', async () => {
            const user = new UserModel(mockUserData);
            const savedUser = await user.save();
            const originalPassword = savedUser.password;

            // Update a field other than password
            savedUser.username = 'newusername';
            await savedUser.save();

            // Password should remain the same hash
            expect(savedUser.password).toBe(originalPassword);
        });
    });

    describe('Validation', () => {
        it('should require username, email, and password', async () => {
            const user = new UserModel({});

            try {
                await user.validate();
                // If validation passes, fail the test
                expect(true).toBe(false);
            } catch (error) {
                const err = error as MongooseError;
                expect(err.errors).toBeDefined();
                expect(err.errors?.username).toBeDefined();
                expect(err.errors?.email).toBeDefined();
                expect(err.errors?.password).toBeDefined();
            }
        });

        it('should enforce minimum password length', async () => {
            const user = new UserModel({
                ...mockUserData,
                password: '12345' // Too short
            });

            try {
                await user.validate();
                // If validation passes, fail the test
                expect(true).toBe(false);
            } catch (error) {
                const err = error as MongooseError;
                expect(err.errors?.password).toBeDefined();
            }
        });

        it('should enforce unique username and email', async () => {
            // Create first user
            await new UserModel(mockUserData).save();

            // Try to create another user with the same username and email
            const duplicateUser = new UserModel(mockUserData);

            try {
                await duplicateUser.save();
                // If save succeeds, fail the test
                expect(true).toBe(false);
            } catch (error) {
                const err = error as MongooseError;
                expect(err.code).toBe(11000); // MongoDB duplicate key error code
            }
        });
    });

    describe('Password Comparison', () => {
        it('should correctly compare valid password', async () => {
            const user = await new UserModel(mockUserData).save();
            const isMatch = await user.comparePassword(mockUserData.password);
            expect(isMatch).toBe(true);
        });

        it('should correctly reject invalid password', async () => {
            const user = await new UserModel(mockUserData).save();
            const isMatch = await user.comparePassword('wrongpassword');
            expect(isMatch).toBe(false);
        });
    });

    describe('Update Operations', () => {
        it('should update user successfully', async () => {
            const user = await new UserModel(mockUserData).save();
            const updatedData = { username: 'updateduser', email: 'updated@example.com' };

            const updatedUser = await UserModel.findByIdAndUpdate(
                user._id,
                updatedData,
                { new: true }
            );

            expect(updatedUser?.username).toBe('updateduser');
            expect(updatedUser?.email).toBe('updated@example.com');
        });

        it('should hash password when updated', async () => {
            const user = await new UserModel(mockUserData).save();
            const originalPasswordHash = user.password;

            // Update the user's password
            user.password = 'newpassword123';
            await user.save();

            // Password should be hashed and different from original
            expect(user.password).not.toBe(originalPasswordHash);
            expect(user.password).not.toBe('newpassword123');

            // Should be able to verify with new password
            const isMatch = await user.comparePassword('newpassword123');
            expect(isMatch).toBe(true);
        });
    });

    describe('Query Operations', () => {
        it('should find users by role', async () => {
            // Create a tenant user
            await new UserModel(mockUserData).save();

            // Create an owner user
            await new UserModel({
                ...mockUserData,
                username: 'owner',
                email: 'owner@example.com',
                roles: [UserRole.OWNER]
            }).save();

            const tenants = await UserModel.find({ roles: UserRole.TENANT });
            const owners = await UserModel.find({ roles: UserRole.OWNER });

            expect(tenants).toHaveLength(1);
            expect(owners).toHaveLength(1);
            expect(tenants[0].username).toBe('testuser');
            expect(owners[0].username).toBe('owner');
        });

        it('should return empty array for non-existent role', async () => {
            await new UserModel(mockUserData).save();

            // Assuming 'ADMIN' is not a used role in your tests
            const admins = await UserModel.find({ roles: 'ADMIN' });
            expect(admins).toHaveLength(0);
        });
    });
});
