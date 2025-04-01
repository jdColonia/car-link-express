/**
 * Represents a vehicle owned by a user available for rental.
 */
export interface Vehicle {
  id: string; // Unique identifier for the vehicle
  ownerId: string; // ID of the vehicle's owner
  vehicleModel: string; // Model of the vehicle
  make: string; // Make/Brand of the vehicle
  color: string; // Color of the vehicle
  year: number; // Manufacturing year of the vehicle
  license_plate: string; // License plate of the vehicle
  url_photos: string[]; // List of URLs of photos for the vehicle
  daily_price: number; // Daily rental price for the vehicle
  rental_conditions: string; // Rental conditions for the vehicle

  // External API data (optional)
  class?: string; // Class/type of the vehicle (optional)
  drive?: string; // Drive type (e.g., 4WD, FWD) (optional)
  fuel_type?: string; // Fuel type used by the vehicle (optional)
  transmission?: string; // Transmission type (e.g., manual, automatic) (optional)
  combination_mpg?: number; // Combined miles per gallon (fuel efficiency) (optional)
  displacement?: number; // Engine displacement (optional)

  createdAt?: Date; // Date when the vehicle was created (optional)
  updatedAt?: Date; // Date when the vehicle was last updated (optional)
  Availability?: VehicleUnavailability[]; // List of unavailable periods for the vehicle (optional)
}

/**
 * Represents a period when a vehicle is unavailable for rental.
 */
export interface VehicleUnavailability {
  id: string; // Unique identifier for the unavailability period
  vehicle_id: string; // ID of the vehicle that is unavailable
  unavailable_from: Date; // Start date of the unavailability
  unavailable_to: Date; // End date of the unavailability
}