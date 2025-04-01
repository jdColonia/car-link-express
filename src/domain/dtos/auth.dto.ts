import { GetProfileResponseDto } from "./users.dto";

/**
 * DTO for user signup request.
 */
export interface SignupRequestDto {
  username: string; // Username
  email: string; // Email address
  password: string; // Password
}

/**
 * DTO for login request.
 */
export interface LoginRequestDto {
  email: string; // Email address
  password: string; // Password
}

/**
 * DTO for login response.
 */
export interface LoginResponseDto {
  token: string; // Authentication token
}

/**
 * DTO for signup response.
 */
export interface SignUpResponseDto {
  token: string; // Authentication token
  user: GetProfileResponseDto; // Registered user data
}