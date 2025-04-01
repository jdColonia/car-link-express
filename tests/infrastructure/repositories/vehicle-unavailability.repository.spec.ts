import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoVehicleUnavailabilityRepository } from "../../../src/infrastructure/repositories/vehicle-unavailability.repository";
import vehicleModel from "../../../src/infrastructure/models/vehicle.model";
import { VehicleUnavailability } from "../../../src/domain/entities/Vehicle";
import {
  describe,
  beforeAll,
  afterAll,
  beforeEach,
  it,
  expect,
  jest,
} from "@jest/globals";

describe("MongoVehicleUnavailabilityRepository", () => {
  let mongoServer: MongoMemoryServer;
  let repository: MongoVehicleUnavailabilityRepository;
  let testVehicleId: string;

  const mockUnavailability: VehicleUnavailability = {
    id: "unavail123",
    vehicle_id: "vehicle123",
    unavailable_from: new Date("2023-01-01"),
    unavailable_to: new Date("2023-01-05"),
  };

  const mockUnavailability2: VehicleUnavailability = {
    id: "unavail456",
    vehicle_id: "vehicle123",
    unavailable_from: new Date("2023-02-01"),
    unavailable_to: new Date("2023-02-05"),
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    repository = new MongoVehicleUnavailabilityRepository();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await vehicleModel.deleteMany({});

    // Create a test vehicle with no unavailability periods
    const vehicle = new vehicleModel({
      ownerId: "owner123",
      vehicleModel: "Camry",
      make: "Toyota",
      color: "Blue",
      year: 2020,
      license_plate: "ABC123",
      url_photos: ["http://example.com/photo1.jpg"],
      daily_price: 50,
      rental_conditions: "No smoking",
      availability: [],
    });

    const savedVehicle = (await vehicle.save()) as mongoose.Document & {
      _id: mongoose.Types.ObjectId;
    };
    testVehicleId = savedVehicle._id.toString();
  });

  describe("findByVehicleId", () => {
    it("should return empty array when vehicle has no unavailability periods", async () => {
      const result = await repository.findByVehicleId(testVehicleId);
      expect(result).toEqual([]);
    });

    it("should return all unavailability periods for a vehicle", async () => {
      // Add unavailability periods to the test vehicle
      await vehicleModel.findByIdAndUpdate(
        testVehicleId,
        { $push: { availability: mockUnavailability } },
        { new: true }
      );

      const result = await repository.findByVehicleId(testVehicleId);
      expect(result[0].id).toBe(mockUnavailability.id);
    });

    it("should return empty array when vehicle not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const result = await repository.findByVehicleId(nonExistentId);
      expect(result).toEqual([]);
    });
  });

  describe("addUnavailability", () => {
    it("should add a new unavailability period to a vehicle", async () => {
      const result = await repository.addUnavailability(
        testVehicleId,
        mockUnavailability
      );

      expect(result[0].id).toBe(mockUnavailability.id);

      // Verify the unavailability was actually added to the database
      const vehicle = await vehicleModel.findById(testVehicleId);
      expect(vehicle?.availability).toHaveLength(1);
      expect((vehicle?.availability ?? [])[0]?.id).toBe(mockUnavailability.id);
    });

    it("should add multiple unavailability periods to a vehicle", async () => {
      // Add first unavailability period
      await repository.addUnavailability(testVehicleId, mockUnavailability);

      // Add second unavailability period
      const result = await repository.addUnavailability(
        testVehicleId,
        mockUnavailability2
      );

      // Verify both unavailability periods exist in the database
      const vehicle = await vehicleModel.findById(testVehicleId);
      expect(vehicle?.availability).toHaveLength(2);

      const ids = (vehicle?.availability ?? []).map((a) => a.id);
      expect(ids).toContain(mockUnavailability.id);
      expect(ids).toContain(mockUnavailability2.id);
    });

    it("should return empty array when vehicle not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const result = await repository.addUnavailability(
        nonExistentId,
        mockUnavailability
      );
      expect(result).toEqual([]);
    });
  });

  describe("removeUnavailability", () => {
    it("should remove an unavailability period from a vehicle", async () => {
      // Add two unavailability periods
      await vehicleModel.findByIdAndUpdate(
        testVehicleId,
        {
          $push: {
            availability: { $each: [mockUnavailability, mockUnavailability2] },
          },
        },
        { new: true }
      );

      // Remove one unavailability period
      const result = await repository.removeUnavailability(
        testVehicleId,
        mockUnavailability.id
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockUnavailability2.id);

      // Verify the unavailability was actually removed from the database
      const vehicle = await vehicleModel.findById(testVehicleId);
      expect(vehicle?.availability?.[0]?.id).toBe(mockUnavailability2.id);
    });

    it("should return all unavailability periods when unavailability ID not found", async () => {
      // Add an unavailability period
      await vehicleModel.findByIdAndUpdate(
        testVehicleId,
        { $push: { availability: mockUnavailability } },
        { new: true }
      );

      // Try to remove a non-existent unavailability period
      const result = await repository.removeUnavailability(
        testVehicleId,
        "nonexistent"
      );

      // Should still return the existing unavailability period
      expect(result[0].id).toBe(mockUnavailability.id);
    });

    it("should return empty array when vehicle not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const result = await repository.removeUnavailability(
        nonExistentId,
        mockUnavailability.id
      );
      expect(result).toEqual([]);
    });
  });

  describe("edge cases", () => {
    it("should handle date objects correctly", async () => {
      const unavailabilityWithDates: VehicleUnavailability = {
        id: "unavail789",
        vehicle_id: "vehicle123",
        unavailable_from: new Date("2023-03-01T12:00:00Z"),
        unavailable_to: new Date("2023-03-05T12:00:00Z"),
      };

      await repository.addUnavailability(
        testVehicleId,
        unavailabilityWithDates
      );

      const result = await repository.findByVehicleId(testVehicleId);

      // Check that dates are preserved correctly
      expect(result[0].unavailable_from instanceof Date).toBe(true);
      expect(result[0].unavailable_to instanceof Date).toBe(true);

      expect(result[0].unavailable_from.toISOString()).toBe(
        "2023-03-01T12:00:00.000Z"
      );
      expect(result[0].unavailable_to.toISOString()).toBe(
        "2023-03-05T12:00:00.000Z"
      );
    });

    it("should handle concurrent operations correctly", async () => {
      // Add multiple unavailability periods concurrently
      const promises = [
        repository.addUnavailability(testVehicleId, mockUnavailability),
        repository.addUnavailability(testVehicleId, mockUnavailability2),
      ];

      await Promise.all(promises);

      // Verify both were added
      const result = await repository.findByVehicleId(testVehicleId);
      expect(result).toHaveLength(2);

      const ids = result.map((a) => a.id);
      expect(ids).toContain(mockUnavailability.id);
      expect(ids).toContain(mockUnavailability2.id);
    });
  });
});

// Log output to show test structure
console.log("Vehicle Unavailability Repository Tests structure:");
console.log("- findByVehicleId");
console.log("- addUnavailability");
console.log("- removeUnavailability");
console.log("- edge cases");
