import {
  CreateRentalRequestDto,
  GetRentalResponseDto,
  RentalListResponseDto,
} from "../../domain/dtos/rental.dto";
import { Rental, RentalStatus } from "../../domain/entities/Rental";
import { RentalRepository } from "../repositories/rental.repository";
export class RentalService {
  constructor(private rentalRepository: RentalRepository) {}

  async createRental(
    rental: CreateRentalRequestDto
  ): Promise<GetRentalResponseDto> {
    const ownerId = "1";
    const newRental = await this.rentalRepository.create({
      id: "",
      status: RentalStatus.PENDING,
      ownerId: ownerId,
      ...rental,
    });
    return this.mapToResponse(newRental);
  }

  async getRentalById(id: string): Promise<GetRentalResponseDto | null> {
    const rental = await this.rentalRepository.findById(id);
    if (!rental) {
      throw new Error("Rental not found");
    }

    return this.mapToResponse(rental);
  }

  async getAllRentals(): Promise<RentalListResponseDto> {
    const rentals = await this.rentalRepository.findAll();
    if (!rentals || rentals.length === 0) {
      throw new Error("No rentals found");
    }
    return rentals.map(this.mapToResponse);
  }

  async updateRental(
    id: string,
    rental: Partial<Rental>
  ): Promise<GetRentalResponseDto | null> {
    const existingRental = await this.rentalRepository.findById(id);
    if (!existingRental) {
      throw new Error("Rental not found");
    }
    const updatedRental = await this.rentalRepository.update(id, rental);
    if (!updatedRental) {
      throw new Error("Rental update failed");
    }
    return this.mapToResponse(updatedRental);
  }

  async deleteRental(id: string): Promise<boolean> {
    const rental = await this.rentalRepository.findById(id);
    if (!rental) {
      throw new Error("Rental not found");
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
