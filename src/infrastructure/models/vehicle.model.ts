import mongoose, { Schema, Document } from 'mongoose';
import { Vehicle } from '../../domain/entities/Vehicle';

export interface VehicleDocument extends Omit<Vehicle, 'id'>, Document { }

const VehicleSchema: Schema = new Schema(
    {
        ownerId: {
            type: String,
            required: true,
        },
        vehicleModel: {
            type: String,
            required: true,
            trim: true,
        },
        make: {
            type: String,
            required: true,
            trim: true,
        },
        color: {
            type: String,
            required: true,
            trim: true,
        },
        year: {
            type: Number,
            required: true,
        },
        license_plate: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        url_photos: {
            type: [String],
            required: true,
        },
        daily_price: {
            type: Number,
            required: true,
        },
        rental_conditions: {
            type: String,
            required: true,
        },
        class: {
            type: String,
        },
        drive: {
            type: String,
        },
        fuel_type: {
            type: String,
        },
        transmission: {
            type: String,
        },
        combination_mpg: {
            type: Number,
        },
        displacement: {
            type: Number,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<VehicleDocument>('Vehicle', VehicleSchema);
