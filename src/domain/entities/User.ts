/**
 * Represents a user in the system with roles and permissions.
 */
export interface User {
  id: string; // Unique identifier for the user
  username: string; // Username of the user
  email: string; // Email address of the user
  password: string; // Password of the user
  roles: UserRole[]; // List of roles assigned to the user
  createdAt?: Date; // Date when the user was created (optional)
  updatedAt?: Date; // Date when the user was last updated (optional)
}

/**
 * Enum to define the possible roles of a user in the system.
 */
export enum UserRole {
  ADMIN = 'admin', // Administrator role with full privileges
  OWNER = 'owner', // Vehicle owner role
  TENANT = 'tenant', // Tenant/Client role
}

/**
 * Represents a permission assigned to a user.
 */
export interface UserPermission {
  id?: string; // Unique identifier for the permission (optional)
  name: string; // Name of the permission
  description: string; // Description of the permission
}

/**
 * Represents a role with associated permissions.
 */
export interface Role {
  id?: string; // Unique identifier for the role (optional)
  name: string; // Name of the role
  permissions: string[] | UserPermission[]; // List of permissions assigned to the role
  description?: string; // Description of the role (optional)
}