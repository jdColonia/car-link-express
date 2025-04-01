/**
 * Represents a rental transaction between a vehicle owner and a client.
 */
export interface Rental {
  id: string; // Unique identifier for the rental
  vehicleId: string; // ID of the rented vehicle
  clientId: string; // ID of the client renting the vehicle
  ownerId: string; // ID of the vehicle owner
  status: RentalStatus; // Current status of the rental (e.g., pending, confirmed, completed, etc.)
  startDate?: Date; // Start date of the rental (optional)
  endDate?: Date; // End date of the rental (optional)
  totalCost: number; // Total cost of the rental
}

/**
 * Enum to define the possible statuses of a rental.
 */
export enum RentalStatus {
  PENDING = "pending", // Rental is awaiting confirmation
  CONFIRMED = "confirmed", // Rental has been confirmed
  COMPLETED = "completed", // Rental has been completed
  CANCELLED = "cancelled", // Rental has been canceled
  EXPIRED = "expired", // Rental has expired
  EXTENDED = "extended", // Rental has been extended
}