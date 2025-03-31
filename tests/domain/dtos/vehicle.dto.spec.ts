import { CreateVehicleRequestDto, GetVehicleResponseDto, UpdateVehicleRequestDto } from '../../../src/domain/dtos/vehicle.dto';

describe('Vehicle DTOs', () => {
    describe('CreateVehicleRequestDto', () => {
        it('should allow valid data', () => {
            const validData: CreateVehicleRequestDto = {
                vehicleModel: 'Model S',
                make: 'Tesla',
                color: 'Red',
                year: 2022,
                license_plate: 'ABC123',
                url_photos: ['photo1.jpg', 'photo2.jpg'],
                daily_price: 100,
                rental_conditions: 'No smoking',
                class: 'Luxury',
                drive: 'AWD',
                fuel_type: 'Electric',
                transmission: 'Automatic',
                combination_mpg: 120,
                displacement: 0
            };

            expect(validData).toBeDefined();
        });

        it('should allow optional API data', () => {
            const minimalData: CreateVehicleRequestDto = {
                vehicleModel: 'Model S',
                make: 'Tesla',
                color: 'Red',
                year: 2022,
                license_plate: 'ABC123',
                url_photos: ['photo1.jpg'],
                daily_price: 100,
                rental_conditions: 'No smoking'
            };

            expect(minimalData).toBeDefined();
        });
    });

    describe('GetVehicleResponseDto', () => {
        it('should include all vehicle properties', () => {
            const vehicle: GetVehicleResponseDto = {
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
                createdAt: new Date(),
                updatedAt: new Date()
            };

            expect(vehicle).toHaveProperty('id');
            expect(vehicle).toHaveProperty('ownerId');
            expect(vehicle).toHaveProperty('createdAt');
        });
    });

    describe('UpdateVehicleRequestDto', () => {
        it('should allow partial updates', () => {
            const updateData: UpdateVehicleRequestDto = {
                color: 'Blue',
                daily_price: 120
            };

            expect(updateData).toBeDefined();
            expect(updateData.color).toBe('Blue');
        });
    });
});