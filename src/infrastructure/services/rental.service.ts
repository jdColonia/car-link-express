import {
  CreateRentalRequestDto,
  GetRentalResponseDto,
  RentalListResponseDto,
} from "../../domain/dtos/rental.dto";
import { Rental, RentalStatus } from "../../domain/entities/Rental";
import {
  BadRequestError,
  NotFoundError,
} from "../../domain/exceptions/exceptions";
import { RentalRepository } from "../repositories/rental.repository";
import { VehicleUnavailabilityRepository } from "../repositories/vehicle-unavailability.repository";
import { VehicleRepository } from "../repositories/vehicle.repository";

/**
 * Service class responsible for handling rental business logic
 * Coordinates between rental, vehicle, and availability repositories
 */
export class RentalService {
  /**
   * Creates a new RentalService instance
   * @param rentalRepository - Repository for rental data operations
   * @param vehicleRepository - Repository for vehicle data operations
   * @param vehicleUnavailabilityRepository - Repository for vehicle availability operations
   */
  constructor(
    private rentalRepository: RentalRepository,
    private vehicleRepository: VehicleRepository,
    private vehicleUnavailabilityRepository: VehicleUnavailabilityRepository
  ) {}

  /**
   * Creates a new rental and marks the vehicle as unavailable for the rental period
   * @param rental - The rental request data
   * @returns The created rental information
   * @throws NotFoundError if the vehicle doesn't exist
   * @throws BadRequestError if the vehicle is not available for the requested dates
   */
  async createRental(
    rental: CreateRentalRequestDto
  ): Promise<GetRentalResponseDto> {
    // Check if the vehicle exists
    const vehicle = await this.vehicleRepository.findById(rental.vehicleId);

    if (!vehicle) {
      throw new NotFoundError("Vehicle not found");
    }

    const ownerId = vehicle.ownerId;

    // Check if the vehicle is available for the requested dates
    const unavailabilities =
      await this.vehicleUnavailabilityRepository.findByVehicleId(
        rental.vehicleId
      );
    const isUnavailable = unavailabilities.some(
      (unavailability) =>
        (rental.startDate >= unavailability.unavailable_from &&
          rental.startDate <= unavailability.unavailable_to) ||
        (rental.endDate >= unavailability.unavailable_from &&
          rental.endDate <= unavailability.unavailable_to)
    );
    if (isUnavailable) {
      throw new BadRequestError(
        "Vehicle is not available for the requested dates"
      );
    }

    const newRental = await this.rentalRepository.create({
      id: "",
      status: RentalStatus.PENDING,
      ownerId: ownerId,
      ...rental,
    });

    // Add the rental period as unavailable dates for the vehicle
    const availables =
      await this.vehicleUnavailabilityRepository.addUnavailability(
        rental.vehicleId,
        {
          id: "",
          vehicle_id: rental.vehicleId,
          unavailable_from: rental.startDate,
          unavailable_to: rental.endDate,
        }
      );

    if (!availables) {
      throw new BadRequestError("Failed to update vehicle availability");
    }

    return this.mapToResponse(newRental);
  }

  /**
   * Retrieves a rental by its ID
   * @param id - The rental ID to retrieve
   * @returns The rental information
   * @throws NotFoundError if the rental doesn't exist
   */
  async getRentalById(id: string): Promise<GetRentalResponseDto | null> {
    const rental = await this.rentalRepository.findById(id);
    if (!rental) {
      throw new NotFoundError("Rental not found");
    }

    return this.mapToResponse(rental);
  }

  /**
   * Retrieves all rentals associated with a specific owner
   * @param id - The owner ID
   * @returns List of rentals belonging to the owner
   * @throws NotFoundError if no rentals are found for the owner
   */
  async getRentalByOwnerId(id: string): Promise<RentalListResponseDto> {
    const rentals = await this.rentalRepository.findByOwner(id);
    if (!rentals || rentals.length === 0) {
      throw new NotFoundError("No rentals found for this owner");
    }
    return rentals.map(this.mapToResponse);
  }

  /**
   * Retrieves all rentals associated with a specific client
   * @param id - The client ID
   * @returns List of rentals belonging to the client
   * @throws NotFoundError if no rentals are found for the client
   */
  async getRentalByClientId(id: string): Promise<RentalListResponseDto> {
    const rentals = await this.rentalRepository.findByClient(id);
    if (!rentals || rentals.length === 0) {
      throw new NotFoundError("No rentals found for this client");
    }
    return rentals.map(this.mapToResponse);
  }

  /**
   * Retrieves all rentals in the system
   * @returns List of all rentals
   * @throws NotFoundError if no rentals are found
   */
  async getAllRentals(): Promise<RentalListResponseDto> {
    const rentals = await this.rentalRepository.findAll();
    if (!rentals || rentals.length === 0) {
      throw new NotFoundError("No rentals found");
    }
    return rentals.map(this.mapToResponse);
  }

  /**
   * Updates an existing rental
   * @param id - The ID of the rental to update
   * @param rental - The updated rental data
   * @returns The updated rental information
   * @throws NotFoundError if the rental doesn't exist
   * @throws BadRequestError if the update operation fails
   */
  async updateRental(
    id: string,
    rental: Partial<Rental>
  ): Promise<GetRentalResponseDto | null> {
    const existingRental = await this.rentalRepository.findById(id);
    if (!existingRental) {
      throw new NotFoundError("Rental not found");
    }
    const updatedRental = await this.rentalRepository.update(id, rental);
    if (!updatedRental) {
      throw new BadRequestError("Rental update failed");
    }
    return this.mapToResponse(updatedRental);
  }

  /**
   * Deletes a rental by its ID
   * @param id - The ID of the rental to delete
   * @returns Boolean indicating success or failure
   * @throws NotFoundError if the rental doesn't exist
   */
  async deleteRental(id: string): Promise<boolean> {
    const rental = await this.rentalRepository.findById(id);
    if (!rental) {
      throw new NotFoundError("Rental not found");
    }
    return this.rentalRepository.delete(id);
  }

  /**
   * Maps a rental entity to a response DTO
   * @param rental - The rental entity to map
   * @returns The rental response DTO
   * @private
   */
  private mapToResponse(rental: Rental): GetRentalResponseDto {
    return {
      id: rental.id,
      vehicleId: rental.vehicleId,
      clientId: rental.clientId,
      ownerId: rental.ownerId,
      totalCost: rental.totalCost,
      startDate: rental.startDate,
      endDate: rental.endDate,
      status: rental.status,
    };
  }
}
