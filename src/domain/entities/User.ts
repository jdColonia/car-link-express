export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  roles: UserRole[];
  createdAt?: Date;
  updatedAt?: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  OWNER = 'owner',
  TENANT = 'tenant',
}

export interface UserPermission {
  id?: string;
  name: string;
  description: string;
}

export interface Role {
  id?: string;
  name: string;
  permissions: string[] | UserPermission[];
  description?: string;
} 