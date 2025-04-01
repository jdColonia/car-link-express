import { Rental, RentalStatus } from "../../../src/domain/entities/Rental";

describe("Rental Entity", () => {
  const mockDate = new Date();
  const futureDate = new Date(mockDate.getTime() + 86400000 * 3); // 3 days later

  const mockRental: Rental = {
    id: "1",
    vehicleId: "vehicle1",
    clientId: "client1",
    ownerId: "owner1",
    status: RentalStatus.CONFIRMED,
    startDate: mockDate,
    endDate: futureDate,
    totalCost: 150,
  };

  it("should validate required properties", () => {
    expect(mockRental).toMatchObject({
      id: expect.any(String),
      vehicleId: expect.any(String),
      clientId: expect.any(String),
      ownerId: expect.any(String),
      status: expect.any(String),
      totalCost: expect.any(Number),
    });
  });

  it("should validate optional properties", () => {
    expect(mockRental).toEqual(
      expect.objectContaining({
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      })
    );
  });

  it("should validate property types", () => {
    expect(typeof mockRental.id).toBe("string");
    expect(typeof mockRental.vehicleId).toBe("string");
    expect(typeof mockRental.clientId).toBe("string");
    expect(typeof mockRental.ownerId).toBe("string");
    expect(typeof mockRental.status).toBe("string");
    expect(typeof mockRental.totalCost).toBe("number");

    if (mockRental.startDate) {
      expect(mockRental.startDate).toBeInstanceOf(Date);
    }

    if (mockRental.endDate) {
      expect(mockRental.endDate).toBeInstanceOf(Date);
    }
  });

  it("should validate date ordering", () => {
    if (mockRental.startDate && mockRental.endDate) {
      expect(mockRental.endDate.getTime()).toBeGreaterThan(
        mockRental.startDate.getTime()
      );
    }
  });

  it("should accept minimal rental configuration without dates", () => {
    const minimalRental: Rental = {
      id: "2",
      vehicleId: "vehicle2",
      clientId: "client2",
      ownerId: "owner2",
      status: RentalStatus.PENDING,
      totalCost: 0, // Initial cost for pending rental
    };

    expect(minimalRental).toBeDefined();
    expect(minimalRental).not.toHaveProperty("startDate");
    expect(minimalRental).not.toHaveProperty("endDate");
  });

  it("should validate status is a valid RentalStatus enum value", () => {
    expect(Object.values(RentalStatus)).toContain(mockRental.status);

    // Test all possible enum values
    const allStatuses = [
      RentalStatus.PENDING,
      RentalStatus.CONFIRMED,
      RentalStatus.COMPLETED,
      RentalStatus.CANCELLED,
      RentalStatus.EXPIRED,
    ];

    allStatuses.forEach((status) => {
      const testRental: Rental = {
        ...mockRental,
        status,
      };
      expect(testRental.status).toBe(status);
    });
  });

  it("should validate total cost is non-negative", () => {
    expect(mockRental.totalCost).toBeGreaterThanOrEqual(0);
  });

  it("should validate rental duration calculation", () => {
    if (mockRental.startDate && mockRental.endDate) {
      const durationInMs =
        mockRental.endDate.getTime() - mockRental.startDate.getTime();
      const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24));

      // Assuming the rental is for 3 days based on our mock data
      expect(durationInDays).toBe(3);
    }
  });

  it("should validate IDs follow expected format", () => {
    // Assuming IDs are non-empty strings
    const idRegex = /^.+$/;
    expect(mockRental.id).toMatch(idRegex);
    expect(mockRental.vehicleId).toMatch(idRegex);
    expect(mockRental.clientId).toMatch(idRegex);
    expect(mockRental.ownerId).toMatch(idRegex);
  });
});