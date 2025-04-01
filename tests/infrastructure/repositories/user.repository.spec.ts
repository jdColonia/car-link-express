import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoUserRepository } from '../../../src/infrastructure/repositories/user.repository';
import { User, UserRole } from '../../../src/domain/entities/User';
import UserModel from '../../../src/infrastructure/models/user.model';
import bcrypt from 'bcrypt';

describe('MongoUserRepository', () => {
    let mongoServer: MongoMemoryServer;
    let repository: MongoUserRepository;
    let testUser: User;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        repository = new MongoUserRepository();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await UserModel.deleteMany({});
        testUser = {
            id: '',
            username: 'testuser',
            email: 'test@example.com',
            password: await bcrypt.hash('password123', 10),
            roles: [UserRole.TENANT]
        };
    });

    describe('create', () => {
        it('should create a new user', async () => {
            const createdUser = await repository.create(testUser);
            expect(createdUser).toHaveProperty('id');
            expect(createdUser.username).toBe(testUser.username);
            expect(createdUser.email).toBe(testUser.email);
        });

        it('should not create a user with missing fields', async () => {
            await expect(repository.create({ username: 'invalidUser' } as User))
                .rejects.toThrow();
        });
    });

    describe('findById', () => {
        it('should find a user by ID', async () => {
            const createdUser = await repository.create(testUser);
            const foundUser = await repository.findById(createdUser.id);
            expect(foundUser).not.toBeNull();
            expect(foundUser?.id).toBe(createdUser.id);
        });

        it('should return null for a non-existing ID', async () => {
            const foundUser = await repository.findById(new mongoose.Types.ObjectId().toString());
            expect(foundUser).toBeNull();
        });

        it('should return null for an invalid ID format', async () => {
            await expect(repository.findById('invalid-id'))
                .rejects.toThrow();
        });
    });

    describe('findByEmail', () => {
        it('should find a user by email', async () => {
            await UserModel.create(testUser);
            const foundUser = await repository.findByEmail(testUser.email);
            expect(foundUser).not.toBeNull();
            expect(foundUser?.email).toBe(testUser.email);
        });

        it('should return null for a non-existing email', async () => {
            const foundUser = await repository.findByEmail('nonexistent@example.com');
            expect(foundUser).toBeNull();
        });
    });

    describe('findByUsername', () => {
        it('should find a user by username', async () => {
            await UserModel.create(testUser);
            const foundUser = await repository.findByUsername(testUser.username);
            expect(foundUser).not.toBeNull();
            expect(foundUser?.username).toBe(testUser.username);
        });

        it('should return null for a non-existing username', async () => {
            const foundUser = await repository.findByUsername('nonexistentuser');
            expect(foundUser).toBeNull();
        });
    });

    describe('findAll', () => {
        it('should find all users', async () => {
            await repository.create(testUser);
            const users = await repository.findAll();
            expect(users.length).toBeGreaterThan(0);
        });
    });

    describe('update', () => {
        it('should update a user', async () => {
            const createdUser = await repository.create(testUser);
            const updatedUser = await repository.update(createdUser.id, { username: 'updateduser' });
            expect(updatedUser).not.toBeNull();
            expect(updatedUser?.username).toBe('updateduser');
        });

        it('should return null when updating a non-existing user', async () => {
            const updatedUser = await repository.update(new mongoose.Types.ObjectId().toString(), { username: 'newUser' });
            expect(updatedUser).toBeNull();
        });
    });

    describe('delete', () => {
        it('should delete a user successfully', async () => {
            const user = await UserModel.create(testUser);
            const result = await repository.delete(user.id.toString());
            expect(result).toBe(true);
            const foundUser = await UserModel.findById(user._id);
            expect(foundUser).toBeNull();
        });

        it('should return false for a non-existing user', async () => {
            const result = await repository.delete(new mongoose.Types.ObjectId().toString());
            expect(result).toBe(false);
        });

        it('should return false for an invalid ID format', async () => {
            await expect(repository.delete('invalid-id'))
                .rejects.toThrow();
        });
    });
});