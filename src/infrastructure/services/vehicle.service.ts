import { VehicleRepository } from '../repositories/vehicle.repository';
import { Vehicle } from '../../domain/entities/Vehicle';
import {
    CreateVehicleRequestDto,
    GetVehicleResponseDto,
    UpdateVehicleRequestDto,
    VehicleListResponseDto,
} from '../../domain/dtos/vehicle.dto';
import {
    NotFoundError,
    ForbiddenError,
    BadRequestError,
} from '../../domain/exceptions/exceptions';
import axios from 'axios';

const API_URL = 'https://api.api-ninjas.com/v1/cars';

/**
 * Service class responsible for handling vehicle business logic
 * Manages vehicle operations and integrates with external vehicle data API
 */
export class VehicleService {
    /**
     * Creates a new VehicleService instance
     * @param vehicleRepository - Repository for vehicle data operations
     */
    constructor(private vehicleRepository: VehicleRepository) { }

    /**
     * Creates a new vehicle with data from both user input and external API
     * @param ownerId - ID of the vehicle owner
     * @param createDto - Vehicle creation data
     * @returns The created vehicle information
     * @throws BadRequestError if a vehicle with the same license plate already exists
     */
    async createVehicle(
        ownerId: string,
        createDto: CreateVehicleRequestDto
    ): Promise<GetVehicleResponseDto> {
        // Check if the vehicle already exists by license plate
        const existingVehicle = await this.vehicleRepository.findByLicensePlate(
            createDto.license_plate
        );
        if (existingVehicle) {
            throw new BadRequestError('Vehicle with this license plate already exists');
        }

        // Call the external API to get the additional data
        const apiData = await this.fetchVehicleDataFromAPI(createDto.make, createDto.vehicleModel, createDto.year);

        const newVehicle = await this.vehicleRepository.create({
            id: '',
            ...createDto,
            ownerId,
            ...apiData
        });

        return this.mapToResponseDto(newVehicle);
    }

    /**
     * Retrieves all vehicles in the system
     * @returns List of all vehicles
     * @throws NotFoundError if no vehicles are found
     */
    async getAllVehicles(): Promise<VehicleListResponseDto> {
        const vehicles = await this.vehicleRepository.findAll();
        if (!vehicles.length) {
            throw new NotFoundError('Vehicles not found');
        }
        return vehicles.map(this.mapToResponseDto);
    }

    /**
     * Retrieves a vehicle by its ID
     * @param id - The vehicle ID to retrieve
     * @returns The vehicle information
     * @throws NotFoundError if the vehicle doesn't exist
     */
    async getVehicleById(id: string): Promise<GetVehicleResponseDto> {
        const vehicle = await this.vehicleRepository.findById(id);
        if (!vehicle) {
            throw new NotFoundError('Vehicle not found');
        }
        return this.mapToResponseDto(vehicle);
    }

    /**
     * Retrieves a vehicle by its license plate
     * @param licensePlate - The license plate to search for
     * @returns The vehicle information
     * @throws NotFoundError if the vehicle doesn't exist
     */
    async getVehicleByLicensePlate(licensePlate: string): Promise<GetVehicleResponseDto> {
        const vehicle = await this.vehicleRepository.findByLicensePlate(licensePlate);
        if (!vehicle) {
            throw new NotFoundError('Vehicle not found');
        }
        return this.mapToResponseDto(vehicle);
    }

    /**
     * Retrieves all vehicles owned by a specific user
     * @param ownerId - The owner ID to search for
     * @returns List of vehicles belonging to the owner
     * @throws NotFoundError if no vehicles are found for the owner
     */
    async getVehiclesByOwner(ownerId: string): Promise<VehicleListResponseDto> {
        const vehicles = await this.vehicleRepository.findByOwner(ownerId);
        if (!vehicles.length) {
            throw new NotFoundError('Vehicles not found');
        }
        return vehicles.map(this.mapToResponseDto);
    }

    /**
     * Updates an existing vehicle
     * @param id - The ID of the vehicle to update
     * @param ownerId - The ID of the owner making the update request
     * @param updateDto - The updated vehicle data
     * @returns The updated vehicle information
     * @throws NotFoundError if the vehicle doesn't exist
     * @throws ForbiddenError if the requester is not the owner
     * @throws BadRequestError if the update operation fails
     */
    async updateVehicle(
        id: string,
        ownerId: string,
        updateDto: UpdateVehicleRequestDto
    ): Promise<GetVehicleResponseDto> {
        // Verify that the vehicle exists and belongs to the owner
        const existingVehicle = await this.vehicleRepository.findById(id);
        if (!existingVehicle) {
            throw new NotFoundError('Vehicle not found');
        }
        if (existingVehicle.ownerId !== ownerId) {
            throw new ForbiddenError('You are not the owner of this vehicle');
        }

        const updatedVehicle = await this.vehicleRepository.update(id, updateDto);
        if (!updatedVehicle) {
            throw new BadRequestError('Failed to update vehicle');
        }

        return this.mapToResponseDto(updatedVehicle);
    }

    /**
     * Deletes a vehicle by its ID
     * @param id - The ID of the vehicle to delete
     * @param ownerId - The ID of the owner making the delete request
     * @returns Boolean indicating success or failure
     * @throws NotFoundError if the vehicle doesn't exist
     * @throws ForbiddenError if the requester is not the owner
     */
    async deleteVehicle(id: string, ownerId: string): Promise<boolean> {
        // Verify that the vehicle exists and belongs to the owner
        const existingVehicle = await this.vehicleRepository.findById(id);
        if (!existingVehicle) {
            throw new NotFoundError('Vehicle not found');
        }
        if (existingVehicle.ownerId !== ownerId) {
            throw new ForbiddenError('You are not the owner of this vehicle');
        }

        return await this.vehicleRepository.delete(id);
    }

    /**
     * Fetches additional vehicle data from an external API
     * @param make - The vehicle make/manufacturer
     * @param vehicleModel - The vehicle model
     * @param year - The vehicle year
     * @returns Additional vehicle specifications
     * @private
     */
    private async fetchVehicleDataFromAPI(make: string, vehicleModel: string, year: number): Promise<Partial<Vehicle>> {
        try {
            const response = await axios.get(API_URL, {
                params: { make, vehicleModel, year },
                headers: { 'X-Api-Key': process.env.API_KEY }
            });

            return {
                class: response.data.class,
                drive: response.data.drive,
                fuel_type: response.data.fuel_type,
                transmission: response.data.transmission,
                combination_mpg: response.data.combination_mpg,
                displacement: response.data.displacement,
            };
        } catch (error) {
            console.error('Error fetching vehicle data from API:', error);
            return {};
        }
    }

    /**
     * Maps a vehicle entity to a response DTO
     * @param vehicle - The vehicle entity to map
     * @returns The vehicle response DTO
     * @private
     */
    private mapToResponseDto(vehicle: Vehicle): GetVehicleResponseDto {
        return {
            id: vehicle.id,
            ownerId: vehicle.ownerId,
            vehicleModel: vehicle.vehicleModel,
            make: vehicle.make,
            color: vehicle.color,
            year: vehicle.year,
            license_plate: vehicle.license_plate,
            url_photos: vehicle.url_photos,
            daily_price: vehicle.daily_price,
            rental_conditions: vehicle.rental_conditions,
            class: vehicle.class,
            drive: vehicle.drive,
            fuel_type: vehicle.fuel_type,
            transmission: vehicle.transmission,
            combination_mpg: vehicle.combination_mpg,
            displacement: vehicle.displacement,
            createdAt: vehicle.createdAt,
            updatedAt: vehicle.updatedAt,
        };
    }
}