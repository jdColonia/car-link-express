import {
    CreateVehicleRequestDto,
    GetVehicleResponseDto,
    UpdateVehicleRequestDto,
    VehicleListResponseDto
} from '../../../src/domain/dtos/vehicle.dto';

describe('Vehicle DTOs', () => {
    describe('CreateVehicleRequestDto', () => {
        it('should validate required properties', () => {
            const dto: CreateVehicleRequestDto = {
                vehicleModel: 'Model S',
                make: 'Tesla',
                color: 'Red',
                year: 2022,
                license_plate: 'ABC123',
                url_photos: ['photo1.jpg'],
                daily_price: 100,
                rental_conditions: 'No smoking'
            };

            expect(dto).toMatchObject({
                vehicleModel: expect.any(String),
                make: expect.any(String),
                color: expect.any(String),
                year: expect.any(Number),
                license_plate: expect.any(String),
                url_photos: expect.any(Array),
                daily_price: expect.any(Number),
                rental_conditions: expect.any(String)
            });
        });

        it('should validate optional API properties', () => {
            const dto: CreateVehicleRequestDto = {
                vehicleModel: 'Model S',
                make: 'Tesla',
                color: 'Red',
                year: 2022,
                license_plate: 'ABC123',
                url_photos: ['photo1.jpg'],
                daily_price: 100,
                rental_conditions: 'No smoking',
                class: 'Luxury',
                drive: 'AWD',
                fuel_type: 'Electric',
                transmission: 'Automatic',
                combination_mpg: 120,
                displacement: 2.0
            };

            expect(dto).toHaveProperty('class', 'Luxury');
            expect(dto).toHaveProperty('drive', 'AWD');
            expect(dto).toHaveProperty('fuel_type', 'Electric');
        });

        it('should fail with missing required properties', () => {
            const invalidDto = {
                vehicleModel: 'Model S',
                color: 'Red',
                year: 2022,
                // Missing: make, license_plate, url_photos, daily_price, rental_conditions
            } as unknown as CreateVehicleRequestDto;

            expect(invalidDto).toBeDefined();
            expect(invalidDto).not.toHaveProperty('make');
            expect(invalidDto).not.toHaveProperty('license_plate');
        });
    });

    describe('GetVehicleResponseDto', () => {
        const mockDate = new Date();

        it('should contain all vehicle properties', () => {
            const dto: GetVehicleResponseDto = {
                id: '123',
                ownerId: 'owner123',
                vehicleModel: 'Model S',
                make: 'Tesla',
                color: 'Red',
                year: 2022,
                license_plate: 'ABC123',
                url_photos: ['photo1.jpg'],
                daily_price: 100,
                rental_conditions: 'No smoking',
                createdAt: mockDate,
                updatedAt: mockDate,
                class: 'Luxury',
                transmission: 'Automatic'
            };

            expect(dto).toEqual(expect.objectContaining({
                id: expect.any(String),
                ownerId: expect.any(String),
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
                ...(dto.class && { class: expect.any(String) }),
                ...(dto.transmission && { transmission: expect.any(String) })
            }));
        });

        it('should validate timestamp properties', () => {
            const dto: GetVehicleResponseDto = {
                id: '123',
                ownerId: 'owner123',
                vehicleModel: 'Model S',
                make: 'Tesla',
                color: 'Red',
                year: 2022,
                license_plate: 'ABC123',
                url_photos: ['photo1.jpg'],
                daily_price: 100,
                rental_conditions: 'No smoking',
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-01-02')
            };

            expect(dto.createdAt).toBeInstanceOf(Date);
            expect(dto.updatedAt).toBeInstanceOf(Date);
        });
    });

    describe('UpdateVehicleRequestDto', () => {
        it('should validate partial updates with at least one property', () => {
            const dto: UpdateVehicleRequestDto = {
                color: 'Blue',
                daily_price: 150
            };

            expect(dto).toEqual(expect.objectContaining({
                color: expect.any(String),
                daily_price: expect.any(Number)
            }));
        });

        it('should allow single property updates', () => {
            const dto: UpdateVehicleRequestDto = {
                rental_conditions: 'Updated conditions'
            };

            expect(dto).toHaveProperty('rental_conditions', 'Updated conditions');
            expect(Object.keys(dto)).toHaveLength(1);
        });

        it('should validate all optional properties', () => {
            const fullUpdate: UpdateVehicleRequestDto = {
                vehicleModel: 'New Model',
                make: 'New Make',
                color: 'Black',
                year: 2024,
                license_plate: 'NEW123',
                url_photos: ['new-photo.jpg'],
                daily_price: 200,
                rental_conditions: 'New conditions',
                class: 'New Class',
                drive: '4WD',
                fuel_type: 'Diesel',
                transmission: 'Manual',
                combination_mpg: 150,
                displacement: 3.0
            };

            expect(fullUpdate).toMatchObject({
                vehicleModel: expect.any(String),
                make: expect.any(String),
                color: expect.any(String),
                year: expect.any(Number),
                license_plate: expect.any(String),
                url_photos: expect.any(Array),
                daily_price: expect.any(Number),
                rental_conditions: expect.any(String),
                class: expect.any(String),
                drive: expect.any(String),
                fuel_type: expect.any(String),
                transmission: expect.any(String),
                combination_mpg: expect.any(Number),
                displacement: expect.any(Number)
            });
        });
    });

    describe('VehicleListResponseDto', () => {
        it('should validate array structure', () => {
            const mockVehicle: GetVehicleResponseDto = {
                id: '123',
                ownerId: 'owner123',
                vehicleModel: 'Model S',
                make: 'Tesla',
                color: 'Red',
                year: 2022,
                license_plate: 'ABC123',
                url_photos: ['photo1.jpg'],
                daily_price: 100,
                rental_conditions: 'No smoking'
            };

            const dto: VehicleListResponseDto = [mockVehicle, mockVehicle];

            expect(dto).toBeInstanceOf(Array);
            expect(dto).toHaveLength(2);
            dto.forEach(vehicle => {
                expect(vehicle).toHaveProperty('id');
                expect(vehicle).toHaveProperty('license_plate');
            });
        });

        it('should handle empty array', () => {
            const dto: VehicleListResponseDto = [];

            expect(dto).toBeInstanceOf(Array);
            expect(dto).toHaveLength(0);
        });
    });
});