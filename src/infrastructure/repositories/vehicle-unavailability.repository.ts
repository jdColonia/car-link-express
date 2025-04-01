import vehicleModel from "../models/vehicle.model";
import { VehicleUnavailability } from "../../domain/entities/Vehicle";

/**
 * Interface defining the contract for vehicle availability operations
 */
export interface VehicleUnavailabilityRepository {
  findByVehicleId(vehicleId: string): Promise<VehicleUnavailability[]>;
  addUnavailability(
    vehicleId: string,
    unavailability: VehicleUnavailability
  ): Promise<VehicleUnavailability[]>;
  removeUnavailability(
    vehicleId: string,
    unavailabilityId: string
  ): Promise<VehicleUnavailability[]>;
}

/**
 * MongoDB implementation of the VehicleUnavailabilityRepository interface
 * Handles all vehicle availability-related database operations
 */
export class MongoVehicleUnavailabilityRepository
  implements VehicleUnavailabilityRepository
{
  /**
   * Retrieves all unavailability periods for a specific vehicle
   * @param vehicleId - The ID of the vehicle
   * @returns Array of unavailability periods
   */
  async findByVehicleId(vehicleId: string): Promise<VehicleUnavailability[]> {
    const vehicle = await vehicleModel
      .findById(vehicleId)
      .select("Availability");
    return vehicle?.availability || [];
  }

  /**
   * Adds a new unavailability period to a vehicle
   * @param vehicleId - The ID of the vehicle
   * @param unavailability - The unavailability period to add
   * @returns Updated array of all unavailability periods
   */
  async addUnavailability(
    vehicleId: string,
    unavailability: VehicleUnavailability
  ): Promise<VehicleUnavailability[]> {
    const vehicle = await vehicleModel
      .findByIdAndUpdate(
        vehicleId,
        {
          $push: { Availability: unavailability },
        },
        { new: true }
      )
      .select("Availability");
    return vehicle?.availability || [];
  }

  /**
   * Removes an unavailability period from a vehicle
   * @param vehicleId - The ID of the vehicle
   * @param unavailabilityId - The ID of the unavailability period to remove
   * @returns Updated array of all unavailability periods
   */
  async removeUnavailability(
    vehicleId: string,
    unavailabilityId: string
  ): Promise<VehicleUnavailability[]> {
    const vehicle = await vehicleModel
      .findByIdAndUpdate(
        vehicleId,
        {
          $pull: { Availability: { id: unavailabilityId } },
        },
        { new: true }
      )
      .select("Availability");
    return vehicle?.availability || [];
  }
}
