import { Vehicle } from '../../domain/entities/Vehicle';
import VehicleModel, { VehicleDocument } from '../models/vehicle.model';

export interface VehicleRepository {
    create(vehicle: Vehicle): Promise<Vehicle>;
    findAll(): Promise<Vehicle[]>;
    findById(id: string): Promise<Vehicle | null>;
    findByLicensePlate(licensePlate: string): Promise<Vehicle | null>;
    findByOwner(ownerId: string): Promise<Vehicle[]>;
    update(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle | null>;
    delete(id: string): Promise<boolean>;
}

export class MongoVehicleRepository implements VehicleRepository {
    async create(vehicle: Vehicle): Promise<Vehicle> {
        const newVehicle = await VehicleModel.create(vehicle);
        return this.documentToEntity(newVehicle);
    }

    async findAll(): Promise<Vehicle[]> {
        const vehicles = await VehicleModel.find();
        return vehicles.map(this.documentToEntity);
    }

    async findById(id: string): Promise<Vehicle | null> {
        const vehicle = await VehicleModel.findById(id);
        return vehicle ? this.documentToEntity(vehicle) : null;
    }

    async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
        const vehicle = await VehicleModel.findOne({ license_plate: licensePlate });
        return vehicle ? this.documentToEntity(vehicle) : null;
    }

    async findByOwner(ownerId: string): Promise<Vehicle[]> {
        const vehicles = await VehicleModel.find({ ownerId });
        return vehicles.map(this.documentToEntity);
    }

    async update(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle | null> {
        const updatedVehicle = await VehicleModel.findByIdAndUpdate(id, vehicle, { new: true });
        return updatedVehicle ? this.documentToEntity(updatedVehicle) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await VehicleModel.findByIdAndDelete(id);
        return !!result;
    }

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