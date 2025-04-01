import mongoose, { Schema, Document } from "mongoose";
import { Rental, RentalStatus } from "../../domain/entities/Rental";

// RentalDocument interface extends Rental, omitting the "id" field and including Document for Mongoose document methods
export interface RentalDocument extends Omit<Rental, "id">, Document { }

// Mongoose Schema for Rental
const RentalSchema: Schema = new Schema(
  {
    vehicleId: {
      type: String,
      required: true,
    },
    clientId: {
      type: String,
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(RentalStatus), // Status is an enum from RentalStatus
      default: RentalStatus.PENDING, // Default value is 'pending'
    },
    startDate: {
      type: Date,
      default: Date.now, // Default is the current date and time
    },
    endDate: {
      type: Date,
      default: Date.now, // Default is the current date and time
    },
    totalCost: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Export the Rental model using RentalDocument schema
export default mongoose.model<RentalDocument>("Rental", RentalSchema);