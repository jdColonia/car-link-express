export interface Rental {
  id: string;
  vehicleId: string;
  clientId: string;
  ownerId: string;
  status: RentalStatus;
  startDate?: Date;
  endDate?: Date;
  totalCost: number;
}

export enum RentalStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}
