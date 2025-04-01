import { UserRole } from "../entities/User";

export interface GetProfileResponseDto {
    id: string;
    username: string;
    email: string;
    roles: UserRole[];
}

export interface EditUserDto {
    username?: string;
    email?: string;
}

export interface GetUsersResponseDto extends Array<GetProfileResponseDto> {}