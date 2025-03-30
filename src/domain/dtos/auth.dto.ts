import { GetProfileResponseDto } from "./users.dto";

export interface SignupRequestDto {
    username: string;
    email: string;
    password: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
}

export interface SignUpResponseDto {
  token: string;
  user: GetProfileResponseDto
}