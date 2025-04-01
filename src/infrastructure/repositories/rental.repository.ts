import { Rental } from "../../domain/entities/Rental";
import rentalModel, { RentalDocument } from "../models/rental.model";

/**
 * Interface defining the contract for rental data operations
 */
export interface RentalRepository {
  findById(id: string): Promise<Rental | null>;
  findAll(): Promise<Rental[]>;
  create(rental: Rental): Promise<Rental>;
  update(id: string, rental: Partial<Rental>): Promise<Rental | null>;
  delete(id: string): Promise<boolean>;
  findByOwner(ownerId: string): Promise<Rental[]>;
  findByClient(clientId: string): Promise<Rental[]>;
}

/**
 * MongoDB implementation of the RentalRepository interface
 * Handles all rental-related database operations
 */
export class MongoRentalRepository implements RentalRepository {
  /**
   * Creates a new rental record in the database
   * @param rental - The rental entity to create
   * @returns The created rental with generated ID
   */
  async create(rental: Rental): Promise<Rental> {
    const newRental = await rentalModel.create(rental);
    return this.documentToEntity(newRental);
  }

  /**
   * Finds a rental by its unique identifier
   * @param id - The rental ID to search for
   * @returns The rental if found, null otherwise
   */
  async findById(id: string): Promise<Rental | null> {
    const rental = await rentalModel.findById(id);
    return rental ? this.documentToEntity(rental) : null;
  }

  /**
   * Retrieves all rentals associated with a specific owner
   * @param ownerId - The ID of the owner
   * @returns Array of rentals belonging to the owner
   */
  async findByOwner(ownerId: string): Promise<Rental[]> {
    const rentals = await rentalModel.find({ ownerId });
    return rentals.map(this.documentToEntity);
  }

  /**
   * Retrieves all rentals associated with a specific client
   * @param clientId - The ID of the client
   * @returns Array of rentals belonging to the client
   */
  async findByClient(clientId: string): Promise<Rental[]> {
    const rentals = await rentalModel.find({ clientId });
    return rentals.map(this.documentToEntity);
  }

  /**
   * Retrieves all rental records from the database
   * @returns Array of all rental entities
   */
  async findAll(): Promise<Rental[]> {
    const rentals = await rentalModel.find();
    return rentals.map(this.documentToEntity);
  }

  /**
   * Updates an existing rental record
   * @param id - The ID of the rental to update
   * @param rental - Partial rental object with fields to update
   * @returns The updated rental or null if not found
   */
  async update(id: string, rental: Partial<Rental>): Promise<Rental | null> {
    const updatedRental = await rentalModel.findByIdAndUpdate(id, rental, {
      new: true,
    });
    return updatedRental ? this.documentToEntity(updatedRental) : null;
  }

  /**
   * Deletes a rental record from the database
   * @param id - The ID of the rental to delete
   * @returns Boolean indicating success or failure
   */
  async delete(id: string): Promise<boolean> {
    const result = await rentalModel.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Converts a MongoDB document to a domain entity
   * @param document - The MongoDB document to convert
   * @returns A clean domain entity
   * @private
   */
  private documentToEntity(document: RentalDocument): Rental {
    return {
      id: document._id?.toString() || "",
      vehicleId: document.vehicleId,
      clientId: document.clientId,
      ownerId: document.ownerId,
      totalCost: document.totalCost,
      startDate: document.startDate,
      endDate: document.endDate,
      status: document.status,
    };
  }
}