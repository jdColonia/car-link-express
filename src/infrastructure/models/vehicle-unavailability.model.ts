import mongoose, { Schema, Document } from 'mongoose';
import { VehicleUnavailability } from '../../domain/entities/Vehicle';

export interface VehicleUnavailabilityDocument extends Omit<VehicleUnavailability, 'id'>, Document { }

const VehicleUnavailabilitySchema: Schema = new Schema(
    {
        vehicle_id: {
            type: Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: true
        },
        unavailable_from: {
            type: Date,
            required: true
        },
        unavailable_to: {
            type: Date,
            required: true
        },
        reason: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<VehicleUnavailabilityDocument>(
    'VehicleUnavailability',
    VehicleUnavailabilitySchema
);
