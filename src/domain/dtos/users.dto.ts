import { UserRole } from "../entities/User";

export interface GetProfileResponseDto {
    id: string;
    username: string;
    email: string;
    roles: UserRole[];
}

export interface GetUsersResponseDto extends Array<GetProfileResponseDto> {}