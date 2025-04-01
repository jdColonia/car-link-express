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

export class RentalService {
  constructor(
    private rentalRepository: RentalRepository,
    private vehicleRepository: VehicleRepository,
    private vehicleUnavailabilityRepository: VehicleUnavailabilityRepository
  ) {}

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
    await this.vehicleUnavailabilityRepository.addUnavailability(
      rental.vehicleId,
      {
        id: "",
        vehicle_id: rental.vehicleId,
        unavailable_from: rental.startDate,
        unavailable_to: rental.endDate,
      }
    );

    return this.mapToResponse(newRental);
  }

  async getRentalById(id: string): Promise<GetRentalResponseDto | null> {
    const rental = await this.rentalRepository.findById(id);
    if (!rental) {
      throw new NotFoundError("Rental not found");
    }

    return this.mapToResponse(rental);
  }

  async getRentalByOwnerId(id: string): Promise<RentalListResponseDto> {
    const rentals = await this.rentalRepository.findByOwner(id);
    if (!rentals || rentals.length === 0) {
      throw new NotFoundError("No rentals found for this owner");
    }
    return rentals.map(this.mapToResponse);
  }

  async getRentalByClientId(id: string): Promise<RentalListResponseDto> {
    const rentals = await this.rentalRepository.findByClient(id);
    if (!rentals || rentals.length === 0) {
      throw new NotFoundError("No rentals found for this client");
    }
    return rentals.map(this.mapToResponse);
  }

  async getAllRentals(): Promise<RentalListResponseDto> {
    const rentals = await this.rentalRepository.findAll();
    if (!rentals || rentals.length === 0) {
      throw new NotFoundError("No rentals found");
    }
    return rentals.map(this.mapToResponse);
  }

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

  async deleteRental(id: string): Promise<boolean> {
    const rental = await this.rentalRepository.findById(id);
    if (!rental) {
      throw new NotFoundError("Rental not found");
    }
    return this.rentalRepository.delete(id);
  }

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
