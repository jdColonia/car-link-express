import { Vehicle, VehicleUnavailability } from '../../../src/domain/entities/Vehicle';

describe('Vehicle Entity', () => {
    it('should create a valid vehicle', () => {
        const vehicle: Vehicle = {
            id: '1',
            ownerId: 'owner1',
            vehicleModel: 'Civic',
            make: 'Honda',
            color: 'Silver',
            year: 2020,
            license_plate: 'XYZ789',
            url_photos: ['photo.jpg'],
            daily_price: 50,
            rental_conditions: 'Standard'
        };

        expect(vehicle).toBeDefined();
        expect(vehicle.id).toBe('1');
        expect(vehicle.vehicleModel).toBe('Civic');
    });
});

describe('VehicleUnavailability Entity', () => {
    it('should create a valid unavailability period', () => {
        const from = new Date();
        const to = new Date(from.getTime() + 86400000);

        const unavailability: VehicleUnavailability = {
            id: '1',
            vehicle_id: 'vehicle1',
            unavailable_from: from,
            unavailable_to: to
        };

        expect(unavailability).toBeDefined();
        expect(unavailability.vehicle_id).toBe('vehicle1');
        expect(unavailability.unavailable_from).toBeInstanceOf(Date);
    });
});