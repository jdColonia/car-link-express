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
    });

    test('should find a user by ID', async () => {
        const createdUser = await repository.create(testUser);
        const foundUser = await repository.findById(createdUser.id);
        expect(foundUser).not.toBeNull();
        expect(foundUser?.id).toBe(createdUser.id);
    });

    describe('findByEmail', () => {
        it('should find a user by email', async () => {
            await UserModel.create(testUser);
            const foundUser = await repository.findByEmail(testUser.email);
            expect(foundUser).not.toBeNull();
            expect(foundUser?.email).toBe(testUser.email);
        });
    });

    test('should find all users', async () => {
        await repository.create(testUser);
        const users = await repository.findAll();
        expect(users.length).toBeGreaterThan(0);
    });

    test('should update a user', async () => {
        const createdUser = await repository.create(testUser);
        const updatedUser = await repository.update(createdUser.id, { username: 'updateduser' });
        expect(updatedUser).not.toBeNull();
        expect(updatedUser?.username).toBe('updateduser');
    });

    describe('findByUsername', () => {
        it('should find a user by username', async () => {
            await UserModel.create(testUser);
            const foundUser = await repository.findByUsername(testUser.username);
            expect(foundUser).not.toBeNull();
            expect(foundUser?.username).toBe(testUser.username);
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
    });
});
