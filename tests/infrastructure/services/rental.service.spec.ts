import { RentalService } from "../../../src/infrastructure/services/rental.service";
import { RentalRepository } from "../../../src/infrastructure/repositories/rental.repository";
import { VehicleRepository } from "../../../src/infrastructure/repositories/vehicle.repository";
import { VehicleUnavailabilityRepository } from "../../../src/infrastructure/repositories/vehicle-unavailability.repository";
import { Rental, RentalStatus } from "../../../src/domain/entities/Rental";
import { CreateRentalRequestDto } from "../../../src/domain/dtos/rental.dto";
import { Vehicle } from "../../../src/domain/entities/Vehicle";
import { VehicleUnavailability } from "../../../src/domain/entities/Vehicle";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";

describe("RentalService", () => {
  let rentalService: RentalService;
  let mockRentalRepository: jest.Mocked<RentalRepository>;
  let mockVehicleRepository: jest.Mocked<VehicleRepository>;
  let mockVehicleUnavailabilityRepository: jest.Mocked<VehicleUnavailabilityRepository>;

  const mockStartDate = new Date("2023-01-01");
  const mockEndDate = new Date("2023-01-05");

  const mockVehicle: Vehicle = {
    id: "vehicle123",
    ownerId: "owner123",
    vehicleModel: "Camry",
    make: "Toyota",
    color: "Blue",
    year: 2020,
    license_plate: "ABC123",
    url_photos: ["http://example.com/photo1.jpg"],
    daily_price: 50,
    rental_conditions: "No smoking",
  };

  const mockRental: Rental = {
    id: "rental123",
    vehicleId: "vehicle123",
    clientId: "client123",
    ownerId: "owner123",
    status: RentalStatus.PENDING,
    startDate: mockStartDate,
    endDate: mockEndDate,
    totalCost: 200,
  };

  const mockCreateRentalDto: CreateRentalRequestDto = {
    vehicleId: "vehicle123",
    clientId: "client123",
    startDate: mockStartDate,
    endDate: mockEndDate,
    totalCost: 200,
  };

  const mockUnavailability: VehicleUnavailability = {
    id: "unavail123",
    vehicle_id: "vehicle123",
    unavailable_from: new Date("2023-01-10"),
    unavailable_to: new Date("2023-01-15"),
  };

  beforeEach(() => {
    // Create mock repositories
    mockRentalRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByOwner: jest.fn(),
      findByClient: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockVehicleRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByLicensePlate: jest.fn(),
      findByOwner: jest.fn(),
    };

    mockVehicleUnavailabilityRepository = {
      findByVehicleId: jest.fn(),
      addUnavailability: jest.fn(),
      removeUnavailability: jest.fn(),
    };

    rentalService = new RentalService(
      mockRentalRepository,
      mockVehicleRepository,
      mockVehicleUnavailabilityRepository
    );
  });

  describe("createRental", () => {
    it("should create a rental successfully", async () => {
      mockVehicleRepository.findById.mockResolvedValue(mockVehicle);
      mockVehicleUnavailabilityRepository.findByVehicleId.mockResolvedValue([]); // Returns an empty array
      mockRentalRepository.create.mockResolvedValue(mockRental);
      mockVehicleUnavailabilityRepository.addUnavailability.mockResolvedValue([
        mockUnavailability,
      ]); // Wrap in an array

      const result = await rentalService.createRental(mockCreateRentalDto);

      expect(mockVehicleRepository.findById).toHaveBeenCalledWith("vehicle123");
      expect(
        mockVehicleUnavailabilityRepository.findByVehicleId
      ).toHaveBeenCalledWith("vehicle123");
      expect(mockRentalRepository.create).toHaveBeenCalledWith({
        id: "",
        vehicleId: "vehicle123",
        clientId: "client123",
        ownerId: "owner123",
        status: RentalStatus.PENDING,
        startDate: mockStartDate,
        endDate: mockEndDate,
        totalCost: 200,
      });
      expect(
        mockVehicleUnavailabilityRepository.addUnavailability
      ).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          id: "rental123",
          vehicleId: "vehicle123",
          clientId: "client123",
          ownerId: "owner123",
          status: RentalStatus.PENDING,
        })
      );
    });

    it("should throw error if vehicle not found", async () => {
      mockVehicleRepository.findById.mockResolvedValue(null);

      await expect(
        rentalService.createRental(mockCreateRentalDto)
      ).rejects.toThrow("Vehicle not found");

      expect(mockRentalRepository.create).not.toHaveBeenCalled();
      expect(
        mockVehicleUnavailabilityRepository.addUnavailability
      ).not.toHaveBeenCalled();
    });

    it("should throw error if vehicle is unavailable for the requested dates", async () => {
      mockVehicleRepository.findById.mockResolvedValue(mockVehicle);
      mockVehicleUnavailabilityRepository.findByVehicleId.mockResolvedValue([
        {
          id: "unavail123",
          vehicle_id: "vehicle123",
          unavailable_from: new Date("2022-12-30"),
          unavailable_to: new Date("2023-01-03"),
        },
      ]);

      await expect(
        rentalService.createRental(mockCreateRentalDto)
      ).rejects.toThrow("Vehicle is not available for the requested dates");

      expect(mockRentalRepository.create).not.toHaveBeenCalled();
      expect(
        mockVehicleUnavailabilityRepository.addUnavailability
      ).not.toHaveBeenCalled();
    });
  });

  describe("getRentalById", () => {
    it("should return rental by id", async () => {
      mockRentalRepository.findById.mockResolvedValue(mockRental);

      const result = await rentalService.getRentalById("rental123");

      expect(mockRentalRepository.findById).toHaveBeenCalledWith("rental123");
      expect(result).toEqual(
        expect.objectContaining({
          id: "rental123",
          vehicleId: "vehicle123",
          clientId: "client123",
        })
      );
    });

    it("should throw error if rental not found", async () => {
      mockRentalRepository.findById.mockResolvedValue(null);

      await expect(rentalService.getRentalById("rental123")).rejects.toThrow(
        "Rental not found"
      );
    });
  });

  describe("getRentalByOwnerId", () => {
    it("should return rentals by owner id", async () => {
      mockRentalRepository.findByOwner.mockResolvedValue([mockRental]);

      const result = await rentalService.getRentalByOwnerId("owner123");

      expect(mockRentalRepository.findByOwner).toHaveBeenCalledWith("owner123");
      expect(result).toHaveLength(1);
      expect(result[0].ownerId).toBe("owner123");
    });

    it("should throw error if no rentals found for owner", async () => {
      mockRentalRepository.findByOwner.mockResolvedValue([]);

      await expect(
        rentalService.getRentalByOwnerId("owner123")
      ).rejects.toThrow("No rentals found for this owner");
    });
  });

  describe("getRentalByClientId", () => {
    it("should return rentals by client id", async () => {
      mockRentalRepository.findByClient.mockResolvedValue([mockRental]);

      const result = await rentalService.getRentalByClientId("client123");

      expect(mockRentalRepository.findByClient).toHaveBeenCalledWith(
        "client123"
      );
      expect(result).toHaveLength(1);
      expect(result[0].clientId).toBe("client123");
    });

    it("should throw error if no rentals found for client", async () => {
      mockRentalRepository.findByClient.mockResolvedValue([]);

      await expect(
        rentalService.getRentalByClientId("client123")
      ).rejects.toThrow("No rentals found for this client");
    });
  });

  describe("getAllRentals", () => {
    it("should return all rentals", async () => {
      mockRentalRepository.findAll.mockResolvedValue([
        mockRental,
        { ...mockRental, id: "rental456" },
      ]);

      const result = await rentalService.getAllRentals();

      expect(mockRentalRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it("should throw error if no rentals found", async () => {
      mockRentalRepository.findAll.mockResolvedValue([]);

      await expect(rentalService.getAllRentals()).rejects.toThrow(
        "No rentals found"
      );
    });
  });

  describe("updateRental", () => {
    it("should update rental successfully", async () => {
      mockRentalRepository.findById.mockResolvedValue(mockRental);
      mockRentalRepository.update.mockResolvedValue({
        ...mockRental,
        status: RentalStatus.CONFIRMED,
        totalCost: 250,
      });

      const result = await rentalService.updateRental("rental123", {
        status: RentalStatus.CONFIRMED,
        totalCost: 250,
      });

      expect(mockRentalRepository.findById).toHaveBeenCalledWith("rental123");
      expect(mockRentalRepository.update).toHaveBeenCalledWith("rental123", {
        status: RentalStatus.CONFIRMED,
        totalCost: 250,
      });
      expect(result?.status).toBe(RentalStatus.CONFIRMED);
      expect(result?.totalCost).toBe(250);
    });

    it("should throw error if rental not found", async () => {
      mockRentalRepository.findById.mockResolvedValue(null);

      await expect(
        rentalService.updateRental("rental123", {
          status: RentalStatus.CONFIRMED,
        })
      ).rejects.toThrow("Rental not found");

      expect(mockRentalRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error if update fails", async () => {
      mockRentalRepository.findById.mockResolvedValue(mockRental);
      mockRentalRepository.update.mockResolvedValue(null);

      await expect(
        rentalService.updateRental("rental123", {
          status: RentalStatus.CONFIRMED,
        })
      ).rejects.toThrow("Rental update failed");
    });
  });

  describe("deleteRental", () => {
    it("should delete rental successfully", async () => {
      mockRentalRepository.findById.mockResolvedValue(mockRental);
      mockRentalRepository.delete.mockResolvedValue(true);

      const result = await rentalService.deleteRental("rental123");

      expect(mockRentalRepository.findById).toHaveBeenCalledWith("rental123");
      expect(mockRentalRepository.delete).toHaveBeenCalledWith("rental123");
      expect(result).toBe(true);
    });

    it("should throw error if rental not found", async () => {
      mockRentalRepository.findById.mockResolvedValue(null);

      await expect(rentalService.deleteRental("rental123")).rejects.toThrow(
        "Rental not found"
      );

      expect(mockRentalRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("mapToResponse", () => {
    it("should correctly map rental entity to response DTO", async () => {
      mockRentalRepository.findById.mockResolvedValue(mockRental);

      const result = await rentalService.getRentalById("rental123");

      expect(result).toEqual({
        id: "rental123",
        vehicleId: "vehicle123",
        clientId: "client123",
        ownerId: "owner123",
        status: RentalStatus.PENDING,
        startDate: mockStartDate,
        endDate: mockEndDate,
        totalCost: 200,
      });
    });
  });
});

// Log output to show test structure
console.log("Rental Service Tests structure:");
console.log("- createRental");
console.log("- getRentalById");
console.log("- getRentalByOwnerId");
console.log("- getRentalByClientId");
console.log("- getAllRentals");
console.log("- updateRental");
console.log("- deleteRental");
console.log("- mapToResponse");
