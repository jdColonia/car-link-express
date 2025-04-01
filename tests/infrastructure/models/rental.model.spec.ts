import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import RentalModel, {
  RentalDocument,
} from "../../../src/infrastructure/models/rental.model";
import { RentalStatus } from "../../../src/domain/entities/Rental";
import {
  describe,
  beforeAll,
  afterAll,
  beforeEach,
  it,
  expect,
} from "@jest/globals";

interface MongooseError extends Error {
  errors?: { [key: string]: mongoose.Error.ValidatorError };
  code?: number;
}

describe("Rental Model", () => {
  let mongoServer: MongoMemoryServer;
  const mockRentalData = {
    vehicleId: "507f1f77bcf86cd799439011",
    clientId: "507f1f77bcf86cd799439022",
    ownerId: "507f1f77bcf86cd799439033",
    status: RentalStatus.PENDING,
    startDate: new Date("2023-01-01"),
    endDate: new Date("2023-01-05"),
    totalCost: 500,
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await RentalModel.deleteMany({});
  });

  describe("Create Operations", () => {
    it("should create a rental with valid data", async () => {
      const rental = new RentalModel(mockRentalData);
      const savedRental = await rental.save();

      expect(savedRental._id).toBeDefined();
      expect(savedRental.vehicleId).toBe(mockRentalData.vehicleId);
      expect(savedRental.clientId).toBe(mockRentalData.clientId);
      expect(savedRental.ownerId).toBe(mockRentalData.ownerId);
      expect(savedRental.status).toBe(mockRentalData.status);
      expect(savedRental.totalCost).toBe(mockRentalData.totalCost);
    });

    it("should fail when required fields are missing", async () => {
      const rental = new RentalModel({
        // Missing vehicleId, clientId, ownerId, totalCost
        status: RentalStatus.PENDING,
        startDate: new Date(),
        endDate: new Date(),
      });

      try {
        await rental.save();
        // Using expect().toThrow() pattern instead of fail()
        expect("This should not be reached").toBe("Error should be thrown");
      } catch (error) {
        const mongooseError = error as MongooseError;
        expect(mongooseError.errors).toBeDefined();
        expect(mongooseError.errors?.vehicleId).toBeDefined();
        expect(mongooseError.errors?.clientId).toBeDefined();
        expect(mongooseError.errors?.ownerId).toBeDefined();
        expect(mongooseError.errors?.totalCost).toBeDefined();
      }
    });
  });

  describe("Default Values", () => {
    it("should set default status to PENDING", async () => {
      const rental = new RentalModel({
        ...mockRentalData,
        status: undefined,
      });

      const savedRental = await rental.save();
      expect(savedRental.status).toBe(RentalStatus.PENDING);
    });

    it("should set default dates if not provided", async () => {
      const rental = new RentalModel({
        ...mockRentalData,
        startDate: undefined,
        endDate: undefined,
      });

      const savedRental = await rental.save();
      expect(savedRental.startDate).toBeInstanceOf(Date);
      expect(savedRental.endDate).toBeInstanceOf(Date);
    });
  });

  describe("Enum Validation", () => {
    it("should accept all valid status values", async () => {
      for (const status of Object.values(RentalStatus)) {
        const rental = new RentalModel({
          ...mockRentalData,
          status,
        });

        const savedRental = await rental.save();
        expect(savedRental.status).toBe(status);
      }
    });

    it("should reject invalid status values", async () => {
      const rental = new RentalModel({
        ...mockRentalData,
        status: "INVALID_STATUS",
      });

      try {
        await rental.save();
        // Using expect().toThrow() pattern instead of fail()
        expect("This should not be reached").toBe("Error should be thrown");
      } catch (error) {
        const mongooseError = error as MongooseError;
        expect(mongooseError.errors?.status).toBeDefined();
      }
    });
  });

  describe("Update Operations", () => {
    it("should update rental status successfully", async () => {
      const rental = await new RentalModel(mockRentalData).save();
      const updatedData = { status: RentalStatus.CONFIRMED };

      const updatedRental = await RentalModel.findByIdAndUpdate(
        rental._id,
        updatedData,
        { new: true }
      );

      expect(updatedRental?.status).toBe(RentalStatus.CONFIRMED);
    });

    it("should update dates and total cost", async () => {
      const rental = await new RentalModel(mockRentalData).save();
      const newEndDate = new Date("2023-01-10");
      const updatedData = {
        endDate: newEndDate,
        totalCost: 1000,
      };

      const updatedRental = await RentalModel.findByIdAndUpdate(
        rental._id,
        updatedData,
        { new: true }
      );

      expect(updatedRental?.endDate?.toISOString()).toBe(
        newEndDate.toISOString()
      );
      expect(updatedRental?.totalCost).toBe(1000);
    });
  });

  describe("Query Operations", () => {
    beforeEach(async () => {
      // Create multiple rentals for testing queries
      await RentalModel.create([
        mockRentalData,
        {
          ...mockRentalData,
          status: RentalStatus.CONFIRMED,
          clientId: "507f1f77bcf86cd799439044",
        },
        {
          ...mockRentalData,
          status: RentalStatus.COMPLETED,
          vehicleId: "507f1f77bcf86cd799439055",
        },
      ]);
    });

    it("should find rentals by vehicle ID", async () => {
      const rentals = await RentalModel.find({
        vehicleId: mockRentalData.vehicleId,
      });
      expect(rentals).toHaveLength(2);
    });

    it("should find rentals by client ID", async () => {
      const rentals = await RentalModel.find({
        clientId: mockRentalData.clientId,
      });
      expect(rentals).toHaveLength(2);
    });

    it("should find rentals by owner ID", async () => {
      const rentals = await RentalModel.find({
        ownerId: mockRentalData.ownerId,
      });
      expect(rentals).toHaveLength(3);
    });

    it("should find rentals by status", async () => {
      const pendingRentals = await RentalModel.find({
        status: RentalStatus.PENDING,
      });
      const confirmedRentals = await RentalModel.find({
        status: RentalStatus.CONFIRMED,
      });
      const completedRentals = await RentalModel.find({
        status: RentalStatus.COMPLETED,
      });

      expect(pendingRentals).toHaveLength(1);
      expect(confirmedRentals).toHaveLength(1);
      expect(completedRentals).toHaveLength(1);
    });

    it("should find rentals within a date range", async () => {
      const startDate = new Date("2022-12-31");
      const endDate = new Date("2023-01-06");

      const rentals = await RentalModel.find({
        startDate: { $gte: startDate },
        endDate: { $lte: endDate },
      });

      expect(rentals).toHaveLength(3);
    });

    it("should return empty array for non-existent data", async () => {
      const rentals = await RentalModel.find({ vehicleId: "nonExistentId" });
      expect(rentals).toHaveLength(0);
    });
  });
});

// Log output to show test structure
console.log("Rental Model Tests structure:");
console.log("- Create Operations");
console.log("- Default Values");
console.log("- Enum Validation");
console.log("- Update Operations");
console.log("- Query Operations");
