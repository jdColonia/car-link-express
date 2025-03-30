import { User } from '../../domain/entities/User';
import UserModel, { UserDocument } from '../models/user.model';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(user: User): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}

export class MongoUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    return user ? this.documentToEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user ? this.documentToEntity(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await UserModel.findOne({ username });
    return user ? this.documentToEntity(user) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await UserModel.find().select('-password');
    return users.map(this.documentToEntity);
  }

  async create(user: User): Promise<User> {
    const newUser = await UserModel.create(user);
    return this.documentToEntity(newUser);
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    const updatedUser = await UserModel.findByIdAndUpdate(id, user, { new: true });
    return updatedUser ? this.documentToEntity(updatedUser) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  private documentToEntity(document: UserDocument): User {
    return {
      id: document._id?.toString() || '',
      username: document.username,
      email: document.email,
      password: document.password,
      roles: document.roles,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
} 