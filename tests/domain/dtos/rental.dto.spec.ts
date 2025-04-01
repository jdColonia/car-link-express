import {
  CreateRentalRequestDto,
  GetRentalResponseDto,
  UpdateRentalRequestDto,
  RentalListResponseDto,
} from "../../../src/domain/dtos/rental.dto";

describe("Rental DTOs", () => {
  describe("CreateRentalRequestDto", () => {
    it("should validate required properties", () => {
      const mockDate = new Date();
      const dto: CreateRentalRequestDto = {
        vehicleId: "vehicle123",
        clientId: "client123",
        startDate: mockDate,
        endDate: new Date(mockDate.getTime() + 86400000), // +1 day
        totalCost: 150,
      };

      expect(dto).toMatchObject({
        vehicleId: expect.any(String),
        clientId: expect.any(String),
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        totalCost: expect.any(Number),
      });
    });

    it("should fail with missing required properties", () => {
      const invalidDto = {
        vehicleId: "vehicle123",
        clientId: "client123",
        // Missing: startDate, endDate, totalCost
      } as unknown as CreateRentalRequestDto;

      expect(invalidDto).toBeDefined();
      expect(invalidDto).not.toHaveProperty("startDate");
      expect(invalidDto).not.toHaveProperty("endDate");
      expect(invalidDto).not.toHaveProperty("totalCost");
    });

    it("should validate date properties are actual Date objects", () => {
      const mockDate = new Date();
      const dto: CreateRentalRequestDto = {
        vehicleId: "vehicle123",
        clientId: "client123",
        startDate: mockDate,
        endDate: new Date(mockDate.getTime() + 86400000), // +1 day
        totalCost: 150,
      };

      expect(dto.startDate).toBeInstanceOf(Date);
      expect(dto.endDate).toBeInstanceOf(Date);
    });
  });

  describe("GetRentalResponseDto", () => {
    const mockDate = new Date();

    it("should contain all rental properties", () => {
      const dto: GetRentalResponseDto = {
        id: "rental123",
        vehicleId: "vehicle123",
        clientId: "client123",
        ownerId: "owner123",
        status: "confirmed",
        startDate: mockDate,
        endDate: new Date(mockDate.getTime() + 86400000), // +1 day
        totalCost: 150,
      };

      expect(dto).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          vehicleId: expect.any(String),
          clientId: expect.any(String),
          ownerId: expect.any(String),
          status: expect.any(String),
          totalCost: expect.any(Number),
        })
      );
    });

    it("should validate optional date properties", () => {
      const dto: GetRentalResponseDto = {
        id: "rental123",
        vehicleId: "vehicle123",
        clientId: "client123",
        ownerId: "owner123",
        status: "pending",
        // startDate and endDate are optional
        totalCost: 150,
      };

      expect(dto).toHaveProperty("id");
      expect(dto).toHaveProperty("status");
      expect(dto).not.toHaveProperty("startDate");
      expect(dto).not.toHaveProperty("endDate");
    });

    it("should validate date properties when present", () => {
      const mockDate = new Date();
      const dto: GetRentalResponseDto = {
        id: "rental123",
        vehicleId: "vehicle123",
        clientId: "client123",
        ownerId: "owner123",
        status: "confirmed",
        startDate: mockDate,
        endDate: new Date(mockDate.getTime() + 86400000), // +1 day
        totalCost: 150,
      };

      expect(dto.startDate).toBeInstanceOf(Date);
      expect(dto.endDate).toBeInstanceOf(Date);
    });
  });

  describe("UpdateRentalRequestDto", () => {
    it("should validate partial updates with at least one property", () => {
      const mockDate = new Date();
      const dto: UpdateRentalRequestDto = {
        vehicleId: "newVehicle123",
        status: "completed",
      };

      expect(dto).toEqual(
        expect.objectContaining({
          vehicleId: expect.any(String),
          status: expect.any(String),
        })
      );
    });

    it("should allow single property updates", () => {
      const dto: UpdateRentalRequestDto = {
        status: "cancelled",
      };

      expect(dto).toHaveProperty("status", "cancelled");
      expect(Object.keys(dto)).toHaveLength(1);
    });

    it("should validate all optional properties", () => {
      const mockDate = new Date();
      const fullUpdate: UpdateRentalRequestDto = {
        vehicleId: "newVehicle123",
        clientId: "newClient123",
        startDate: mockDate,
        endDate: new Date(mockDate.getTime() + 172800000), // +2 days
        status: "extended",
      };

      expect(fullUpdate).toMatchObject({
        vehicleId: expect.any(String),
        clientId: expect.any(String),
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        status: expect.any(String),
      });
    });

    it("should validate date properties are actual Date objects when present", () => {
      const mockDate = new Date();
      const dto: UpdateRentalRequestDto = {
        startDate: mockDate,
        endDate: new Date(mockDate.getTime() + 86400000), // +1 day
      };

      expect(dto.startDate).toBeInstanceOf(Date);
      expect(dto.endDate).toBeInstanceOf(Date);
    });
  });

  describe("RentalListResponseDto", () => {
    it("should validate array structure", () => {
      const mockRental: GetRentalResponseDto = {
        id: "rental123",
        vehicleId: "vehicle123",
        clientId: "client123",
        ownerId: "owner123",
        status: "confirmed",
        totalCost: 150,
      };

      const dto: RentalListResponseDto = [mockRental, mockRental];

      expect(dto).toBeInstanceOf(Array);
      expect(dto).toHaveLength(2);
      dto.forEach((rental) => {
        expect(rental).toHaveProperty("id");
        expect(rental).toHaveProperty("status");
        expect(rental).toHaveProperty("totalCost");
      });
    });

    it("should handle empty array", () => {
      const dto: RentalListResponseDto = [];

      expect(dto).toBeInstanceOf(Array);
      expect(dto).toHaveLength(0);
    });
  });
});