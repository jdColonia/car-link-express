/**
 * DTO for rental creation request.
 */
export interface CreateRentalRequestDto {
  vehicleId: string; // ID of the vehicle to rent
  clientId: string; // ID of the client renting the vehicle
  startDate: Date; // Rental start date
  endDate: Date; // Rental end date
  totalCost: number; // Total cost of the rental
}

/**
 * DTO for rental retrieval response.
 */
export interface GetRentalResponseDto {
  id: string; // Rental ID
  vehicleId: string; // ID of the rented vehicle
  clientId: string; // ID of the client who rented
  ownerId: string; // ID of the vehicle owner
  status: string; // Status of the rental
  startDate?: Date; // Rental start date (optional)
  endDate?: Date; // Rental end date (optional)
  totalCost: number; // Total cost of the rental
}

/**
 * DTO for rental update request.
 */
export interface UpdateRentalRequestDto {
  vehicleId?: string; // ID of the vehicle (optional)
  clientId?: string; // ID of the client (optional)
  startDate?: Date; // Start date (optional)
  endDate?: Date; // End date (optional)
  status?: string; // Status of the rental (optional)
}

/**
 * DTO for rental list response.
 */
export interface RentalListResponseDto extends Array<GetRentalResponseDto> { }