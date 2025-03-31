import mongoose, { Schema, Document } from "mongoose";
import { Rental, RentalStatus } from "../../domain/entities/Rental";

export interface RentalDocument extends Omit<Rental, "id">, Document {}

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
      enum: Object.values(RentalStatus),
      default: RentalStatus.PENDING,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: Date.now,
    },
    totalCost: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<RentalDocument>("Rental", RentalSchema);
