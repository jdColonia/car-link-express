import { RentalStatus } from "../../domain/entities/Rental";
import { errorHandler } from "../../domain/exceptions/exceptions";
import { MongoRentalRepository } from "../../infrastructure/repositories/rental.repository";
import { MongoVehicleUnavailabilityRepository } from "../../infrastructure/repositories/vehicle-unavailability.repository";
import { MongoVehicleRepository } from "../../infrastructure/repositories/vehicle.repository";
import { RentalService } from "../../infrastructure/services/rental.service";
import { Request, Response } from "express";

const rentalRepository = new MongoRentalRepository();
const vehicleRepository = new MongoVehicleRepository();
const vehicleUnavailabilityRepository =
  new MongoVehicleUnavailabilityRepository();
const rentalService = new RentalService(
  rentalRepository,
  vehicleRepository,
  vehicleUnavailabilityRepository
);

export const createRental = async (req: any, res: any): Promise<void> => {
  try {
    const rental = await rentalService.createRental(req.body);
    res.status(201).json(rental);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const deleteRental = async (req: any, res: any): Promise<void> => {
  try {
    await rentalService.deleteRental(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const getRentalById = async (req: any, res: any): Promise<void> => {
  try {
    const rental = await rentalService.getRentalById(req.params.id);
    if (!rental) {
      res.status(404).json({ message: "Rental not found" });
      return;
    }
    res.status(200).json(rental);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const getOwnerRents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }
    const rentals = await rentalService.getRentalByOwnerId(req.user.id);
    res.status(200).json(rentals);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const getClientRents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }
    const rentals = await rentalService.getRentalByClientId(req.user.id);
    res.status(200).json(rentals);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const getAllRentals = async (req: any, res: any): Promise<void> => {
  try {
    const rentals = await rentalService.getAllRentals();
    res.status(200).json(rentals);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const updateRental = async (req: any, res: any): Promise<void> => {
  try {
    const rental = await rentalService.updateRental(req.params.id, req.body);
    res.status(200).json(rental);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const confirmRental = async (req: any, res: any): Promise<void> => {
  try {
    const rental = await rentalService.updateRental(req.params.id, {
      status: RentalStatus.CONFIRMED,
    });
    res.status(200).json(rental);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const cancelRental = async (req: any, res: any): Promise<void> => {
  try {
    const rental = await rentalService.updateRental(req.params.id, {
      status: RentalStatus.CANCELLED,
    });
    res.status(200).json(rental);
  } catch (error: any) {
    errorHandler(error, res);
  }
};
