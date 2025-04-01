import { Vehicle, VehicleUnavailability } from '../../../src/domain/entities/Vehicle';

describe('Vehicle Entity', () => {
    const mockVehicle: Vehicle = {
        id: '1',
        ownerId: 'owner1',
        vehicleModel: 'Civic',
        make: 'Honda',
        color: 'Silver',
        year: 2020,
        license_plate: 'XYZ789',
        url_photos: ['photo.jpg'],
        daily_price: 50,
        rental_conditions: 'Standard',
        class: 'Compact',
        fuel_type: 'Gasoline',
        createdAt: new Date(),
        updatedAt: new Date()
    };

    it('should validate required properties', () => {
        expect(mockVehicle).toMatchObject({
            id: expect.any(String),
            ownerId: expect.any(String),
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

    it('should validate optional properties', () => {
        expect(mockVehicle).toEqual(expect.objectContaining({
            class: expect.any(String),
            fuel_type: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date)
        }));
    });

    it('should validate property types', () => {
        expect(typeof mockVehicle.id).toBe('string');
        expect(typeof mockVehicle.vehicleModel).toBe('string');
        expect(typeof mockVehicle.year).toBe('number');
        expect(Array.isArray(mockVehicle.url_photos)).toBe(true);
        expect(mockVehicle.url_photos.every(url => typeof url === 'string')).toBe(true);
    });

    it('should validate date ordering', () => {
        if (mockVehicle.createdAt && mockVehicle.updatedAt) {
            expect(mockVehicle.updatedAt.getTime())
                .toBeGreaterThanOrEqual(mockVehicle.createdAt.getTime());
        }
    });

    it('should accept minimal vehicle configuration', () => {
        const minimalVehicle: Vehicle = {
            id: '2',
            ownerId: 'owner2',
            vehicleModel: 'Model 3',
            make: 'Tesla',
            color: 'White',
            year: 2023,
            license_plate: 'TESLA123',
            url_photos: [],
            daily_price: 100,
            rental_conditions: 'Premium'
        };

        expect(minimalVehicle).toBeDefined();
        expect(minimalVehicle).not.toHaveProperty('class');
    });

    it('should validate license plate format', () => {
        const licensePlateRegex = /^[A-Z0-9]{6,8}$/;
        expect(mockVehicle.license_plate).toMatch(licensePlateRegex);
    });
});
