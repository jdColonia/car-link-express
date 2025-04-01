import mongoose, { Schema, Document } from "mongoose";
import { Vehicle, VehicleUnavailability } from "../../domain/entities/Vehicle";

// VehicleDocument interface extends Vehicle, omitting the "id" field and including Document for Mongoose document methods
export interface VehicleDocument extends Omit<Vehicle, "id">, Document {}

// Mongoose Schema for Vehicle Unavailability
const VehicleUnavailabilitySchema: Schema = new Schema(
  {
    vehicle_id: {
      type: String,
      required: true,
    },
    unavailable_from: {
      type: Date,
      required: true,
    },
    unavailable_to: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // Do not create an _id field for unavailability entries
  }
);

// Mongoose Schema for Vehicle
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
      unique: true, // License plate must be unique
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
    availability: {
      type: [VehicleUnavailabilitySchema],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Export the Vehicle model using VehicleDocument schema
export default mongoose.model<VehicleDocument>("Vehicle", VehicleSchema);
