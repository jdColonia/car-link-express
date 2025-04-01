/**
 * DTO for vehicle creation request.
 */
export interface CreateVehicleRequestDto {
    vehicleModel: string; // Vehicle model
    make: string; // Vehicle brand
    color: string; // Vehicle color
    year: number; // Vehicle year
    license_plate: string; // Vehicle license plate
    url_photos: string[]; // URLs of vehicle photos
    daily_price: number; // Daily rental price
    rental_conditions: string; // Rental conditions

    // External API data
    class?: string; // Vehicle class (optional)
    drive?: string; // Drive type (optional)
    fuel_type?: string; // Fuel type (optional)
    transmission?: string; // Transmission type (optional)
    combination_mpg?: number; // Fuel consumption (optional)
    displacement?: number; // Engine displacement (optional)
}

/**
 * DTO for vehicle retrieval response.
 */
export interface GetVehicleResponseDto {
    id: string; // Vehicle ID
    ownerId: string; // Vehicle owner ID
    vehicleModel: string; // Vehicle model
    make: string; // Vehicle brand
    color: string; // Vehicle color
    year: number; // Vehicle year
    license_plate: string; // Vehicle license plate
    url_photos: string[]; // URLs of vehicle photos
    daily_price: number; // Daily rental price
    rental_conditions: string; // Rental conditions

    // External API data
    class?: string; // Vehicle class (optional)
    drive?: string; // Drive type (optional)
    fuel_type?: string; // Fuel type (optional)
    transmission?: string; // Transmission type (optional)
    combination_mpg?: number; // Fuel consumption (optional)
    displacement?: number; // Engine displacement (optional)

    createdAt?: Date; // Vehicle creation date (optional)
    updatedAt?: Date; // Last update date (optional)
}

/**
 * DTO for vehicle update request.
 */
export interface UpdateVehicleRequestDto {
    vehicleModel?: string; // Vehicle model (optional)
    make?: string; // Vehicle brand (optional)
    color?: string; // Vehicle color (optional)
    year?: number; // Vehicle year (optional)
    license_plate?: string; // Vehicle license plate (optional)
    url_photos?: string[]; // URLs of vehicle photos (optional)
    daily_price?: number; // Daily rental price (optional)
    rental_conditions?: string; // Rental conditions (optional)

    // External API data
    class?: string;
    drive?: string;
    fuel_type?: string;
    transmission?: string;
    combination_mpg?: number;
    displacement?: number;
}

/**
 * DTO for vehicle list response.
 */
export interface VehicleListResponseDto extends Array<GetVehicleResponseDto> { }