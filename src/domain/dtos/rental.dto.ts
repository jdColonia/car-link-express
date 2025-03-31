export interface CreateRentalRequestDto {
  vehicleId: string;
  clientId: string;
  startDate: Date;
  endDate: Date;
  totalCost: number;
}

export interface GetRentalResponseDto {
  id: string;
  vehicleId: string;
  clientId: string;
  ownerId: string;
  status: String;
  startDate?: Date;
  endDate?: Date;
  totalCost: number;
}

export interface UpdateRentalRequestDto {
  vehicleId?: string;
  clientId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

export interface RentalListResponseDto extends Array<GetRentalResponseDto> {}
