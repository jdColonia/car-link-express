import { UserRole } from "../entities/User";

/**
 * DTO for user profile response.
 */
export interface GetProfileResponseDto {
    id: string; // User ID
    username: string; // Username
    email: string; // Email address
    roles: UserRole[]; // User roles
}

/**
 * DTO for user edit request.
 */
export interface EditUserDto {
    username?: string; // New username (optional)
    email?: string; // New email address (optional)
}

/**
 * DTO for users list response.
 */
export interface GetUsersResponseDto extends Array<GetProfileResponseDto> { }