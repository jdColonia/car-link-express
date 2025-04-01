import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoRentalRepository } from "../../../src/infrastructure/repositories/rental.repository";
import RentalModel from "../../../src/infrastructure/models/rental.model";
import { Rental, RentalStatus } from "../../../src/domain/entities/Rental";
import {
  describe,
  beforeAll,
  afterAll,
  beforeEach,
  it,
  expect,
} from "@jest/globals";

describe("MongoRentalRepository", () => {
  let mongoServer: MongoMemoryServer;
  let repository: MongoRentalRepository;
  let testRental: Rental;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    repository = new MongoRentalRepository();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await RentalModel.deleteMany({});
    testRental = {
      id: "",
      vehicleId: "123456789012345678901234",
      clientId: "234567890123456789012345",
      ownerId: "345678901234567890123456",
      status: RentalStatus.PENDING,
      startDate: new Date("2023-01-01"),
      endDate: new Date("2023-01-05"),
      totalCost: 200,
    };
  });

  describe("create", () => {
    it("should create a new rental", async () => {
      const result = await repository.create(testRental);
      expect(result).toHaveProperty("id");
      expect(result.vehicleId).toBe(testRental.vehicleId);
      expect(result.clientId).toBe(testRental.clientId);
      expect(result.ownerId).toBe(testRental.ownerId);
      expect(result.status).toBe(testRental.status);
      expect(result.totalCost).toBe(testRental.totalCost);
    });
  });

  describe("findAll", () => {
    it("should return all rentals", async () => {
      await repository.create(testRental);
      await repository.create({
        ...testRental,
        clientId: "456789012345678901234567",
        status: RentalStatus.CONFIRMED,
      });

      const results = await repository.findAll();
      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty("id");
      expect(results[1]).toHaveProperty("id");
    });

    it("should return empty array when no rentals exist", async () => {
      const results = await repository.findAll();
      expect(results).toHaveLength(0);
    });
  });

  describe("findById", () => {
    it("should find a rental by id", async () => {
      const created = await repository.create(testRental);
      const found = await repository.findById(created.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.vehicleId).toBe(testRental.vehicleId);
      expect(found?.status).toBe(testRental.status);
    });

    it("should return null if rental not found", async () => {
      const found = await repository.findById("123456789012345678901234");
      expect(found).toBeNull();
    });
  });

  describe("findByOwner", () => {
    it("should find rentals by owner id", async () => {
      await repository.create(testRental);
      await repository.create({
        ...testRental,
        clientId: "456789012345678901234567",
        status: RentalStatus.CONFIRMED,
      });

      const found = await repository.findByOwner(testRental.ownerId);
      expect(found).toHaveLength(2);
    });

    it("should return empty array if no rentals found for owner", async () => {
      const found = await repository.findByOwner("nonexistentowner");
      expect(found).toHaveLength(0);
    });
  });

  describe("findByClient", () => {
    it("should find rentals by client id", async () => {
      await repository.create(testRental);
      await repository.create({
        ...testRental,
        status: RentalStatus.CONFIRMED,
      });

      const found = await repository.findByClient(testRental.clientId);
      expect(found).toHaveLength(2);
    });

    it("should return empty array if no rentals found for client", async () => {
      const found = await repository.findByClient("nonexistentclient");
      expect(found).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("should update a rental", async () => {
      const created = await repository.create(testRental);
      const updated = await repository.update(created.id, {
        status: RentalStatus.CONFIRMED,
        totalCost: 250,
      });

      expect(updated).not.toBeNull();
      expect(updated?.status).toBe(RentalStatus.CONFIRMED);
      expect(updated?.totalCost).toBe(250);
      expect(updated?.id).toBe(created.id);
    });

    it("should return null if rental not found", async () => {
      const updated = await repository.update("123456789012345678901234", {
        status: RentalStatus.CONFIRMED,
      });
      expect(updated).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete a rental", async () => {
      const created = await repository.create(testRental);
      const result = await repository.delete(created.id);
      expect(result).toBe(true);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });

    it("should return false if rental not found", async () => {
      const result = await repository.delete("123456789012345678901234");
      expect(result).toBe(false);
    });
  });

  describe("documentToEntity conversion", () => {
    it("should correctly convert document to entity", async () => {
      const created = await repository.create(testRental);

      // Verify all properties are correctly mapped
      expect(created).toHaveProperty("id");
      expect(created.vehicleId).toBe(testRental.vehicleId);
      expect(created.clientId).toBe(testRental.clientId);
      expect(created.ownerId).toBe(testRental.ownerId);
      expect(created.status).toBe(testRental.status);
      expect(created.totalCost).toBe(testRental.totalCost);

      // Check date conversion
      if (created.startDate && testRental.startDate) {
        expect(created.startDate.toISOString()).toBe(
          testRental.startDate.toISOString()
        );
      }

      if (created.endDate && testRental.endDate) {
        expect(created.endDate.toISOString()).toBe(
          testRental.endDate.toISOString()
        );
      }
    });
  });
});