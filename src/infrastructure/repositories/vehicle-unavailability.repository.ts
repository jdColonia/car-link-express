import vehicleModel from "../models/vehicle.model";
import { VehicleUnavailability } from "../../domain/entities/Vehicle";

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

export class MongoVehicleUnavailabilityRepository
  implements VehicleUnavailabilityRepository
{
  async findByVehicleId(vehicleId: string): Promise<VehicleUnavailability[]> {
    const vehicle = await vehicleModel
      .findById(vehicleId)
      .select("Availability");
    return vehicle?.Availability || [];
  }

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
    return vehicle?.Availability || [];
  }

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
    return vehicle?.Availability || [];
  }
}
