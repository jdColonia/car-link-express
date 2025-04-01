import { Vehicle } from '../../domain/entities/Vehicle';
import VehicleModel, { VehicleDocument } from '../models/vehicle.model';

/**
 * Interface defining the contract for vehicle data operations
 */
export interface VehicleRepository {
    create(vehicle: Vehicle): Promise<Vehicle>;
    findAll(): Promise<Vehicle[]>;
    findById(id: string): Promise<Vehicle | null>;
    findByLicensePlate(licensePlate: string): Promise<Vehicle | null>;
    findByOwner(ownerId: string): Promise<Vehicle[]>;
    update(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle | null>;
    delete(id: string): Promise<boolean>;
}

/**
 * MongoDB implementation of the VehicleRepository interface
 * Handles all vehicle-related database operations
 */
export class MongoVehicleRepository implements VehicleRepository {
    /**
     * Creates a new vehicle record in the database
     * @param vehicle - The vehicle entity to create
     * @returns The created vehicle with generated ID
     */
    async create(vehicle: Vehicle): Promise<Vehicle> {
        const newVehicle = await VehicleModel.create(vehicle);
        return this.documentToEntity(newVehicle);
    }

    /**
     * Retrieves all vehicle records from the database
     * @returns Array of all vehicle entities
     */
    async findAll(): Promise<Vehicle[]> {
        const vehicles = await VehicleModel.find();
        return vehicles.map(this.documentToEntity);
    }

    /**
     * Finds a vehicle by its unique identifier
     * @param id - The vehicle ID to search for
     * @returns The vehicle if found, null otherwise
     */
    async findById(id: string): Promise<Vehicle | null> {
        const vehicle = await VehicleModel.findById(id);
        return vehicle ? this.documentToEntity(vehicle) : null;
    }

    /**
     * Finds a vehicle by its license plate
     * @param licensePlate - The license plate to search for
     * @returns The vehicle if found, null otherwise
     */
    async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
        const vehicle = await VehicleModel.findOne({ license_plate: licensePlate });
        return vehicle ? this.documentToEntity(vehicle) : null;
    }

    /**
     * Retrieves all vehicles associated with a specific owner
     * @param ownerId - The ID of the owner
     * @returns Array of vehicles belonging to the owner
     */
    async findByOwner(ownerId: string): Promise<Vehicle[]> {
        const vehicles = await VehicleModel.find({ ownerId });
        return vehicles.map(this.documentToEntity);
    }

    /**
     * Updates an existing vehicle record
     * @param id - The ID of the vehicle to update
     * @param vehicle - Partial vehicle object with fields to update
     * @returns The updated vehicle or null if not found
     */
    async update(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle | null> {
        const updatedVehicle = await VehicleModel.findByIdAndUpdate(id, vehicle, { new: true });
        return updatedVehicle ? this.documentToEntity(updatedVehicle) : null;
    }

    /**
     * Deletes a vehicle record from the database
     * @param id - The ID of the vehicle to delete
     * @returns Boolean indicating success or failure
     */
    async delete(id: string): Promise<boolean> {
        const result = await VehicleModel.findByIdAndDelete(id);
        return !!result;
    }

    /**
     * Converts a MongoDB document to a domain entity
     * @param document - The MongoDB document to convert
     * @returns A clean domain entity
     * @private
     */
    private documentToEntity(document: VehicleDocument): Vehicle {
        return {
            id: document._id?.toString() || '',
            ownerId: document.ownerId,
            vehicleModel: document.vehicleModel,
            make: document.make,
            color: document.color,
            year: document.year,
            license_plate: document.license_plate,
            url_photos: document.url_photos,
            daily_price: document.daily_price,
            rental_conditions: document.rental_conditions,
            class: document.class,
            drive: document.drive,
            fuel_type: document.fuel_type,
            transmission: document.transmission,
            combination_mpg: document.combination_mpg,
            displacement: document.displacement,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
    }
}