import { VehicleRepository } from '../repositories/vehicle.repository';
import { Vehicle } from '../../domain/entities/Vehicle';
import {
    CreateVehicleRequestDto,
    GetVehicleResponseDto,
    UpdateVehicleRequestDto,
    VehicleListResponseDto,
} from '../../domain/dtos/vehicle.dto';
import axios from 'axios';

const API_URL = 'https://api.api-ninjas.com/v1/cars';

export class VehicleService {
    constructor(private vehicleRepository: VehicleRepository) { }

    async createVehicle(
        ownerId: string,
        createDto: CreateVehicleRequestDto
    ): Promise<GetVehicleResponseDto> {
        // Verificar si el vehículo ya existe por placa
        const existingVehicle = await this.vehicleRepository.findByLicensePlate(
            createDto.license_plate
        );
        if (existingVehicle) {
            throw new Error('Vehicle with this license plate already exists');
        }

        // Llamada a la API externa para obtener los datos adicionales
        const apiData = await this.fetchVehicleDataFromAPI(createDto.make, createDto.vehicleModel, createDto.year);

        const newVehicle = await this.vehicleRepository.create({
            id: '',
            ...createDto,
            ownerId,
            ...apiData
        });

        return this.mapToResponseDto(newVehicle);
    }

    async getAllVehicles(): Promise<VehicleListResponseDto> {
        const vehicles = await this.vehicleRepository.findAll();
        if (!vehicles) {
            throw new Error('No vehicles found');
        }
        return vehicles.map(this.mapToResponseDto);
    }

    async getVehicleById(id: string): Promise<GetVehicleResponseDto> {
        const vehicle = await this.vehicleRepository.findById(id);
        if (!vehicle) {
            throw new Error('Vehicle not found');
        }
        return this.mapToResponseDto(vehicle);
    }

    async getVehicleByLicensePlate(licensePlate: string): Promise<GetVehicleResponseDto> {
        const vehicle = await this.vehicleRepository.findByLicensePlate(licensePlate);
        if (!vehicle) {
            throw new Error('Vehicle not found');
        }
        return this.mapToResponseDto(vehicle);
    }

    async getVehiclesByOwner(ownerId: string): Promise<VehicleListResponseDto> {
        const vehicles = await this.vehicleRepository.findByOwner(ownerId);
        if (!vehicles) {
            throw new Error('Vehicles not found');
        }
        return vehicles.map(this.mapToResponseDto);
    }

    async updateVehicle(
        id: string,
        ownerId: string,
        updateDto: UpdateVehicleRequestDto
    ): Promise<GetVehicleResponseDto> {
        // Verificar que el vehículo existe y pertenece al propietario
        const existingVehicle = await this.vehicleRepository.findById(id);
        if (!existingVehicle) {
            throw new Error('Vehicle not found');
        }
        if (existingVehicle.ownerId !== ownerId) {
            throw new Error('You are not the owner of this vehicle');
        }

        const updatedVehicle = await this.vehicleRepository.update(id, updateDto);
        if (!updatedVehicle) {
            throw new Error('Failed to update vehicle');
        }

        return this.mapToResponseDto(updatedVehicle);
    }

    async deleteVehicle(id: string, ownerId: string): Promise<boolean> {
        // Verificar que el vehículo existe y pertenece al propietario
        const existingVehicle = await this.vehicleRepository.findById(id);
        if (!existingVehicle) {
            throw new Error('Vehicle not found');
        }
        if (existingVehicle.ownerId !== ownerId) {
            throw new Error('You are not the owner of this vehicle');
        }

        return await this.vehicleRepository.delete(id);
    }

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