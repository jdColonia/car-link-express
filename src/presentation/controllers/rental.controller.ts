import { RentalStatus } from "../../domain/entities/Rental";
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
    res.status(500).json({ message: error.message });
  }
};

export const deleteRental = async (req: any, res: any): Promise<void> => {
  try {
    const deleted = await rentalService.deleteRental(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Rental not found" });
      return;
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

export const getOwnerRents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.params) {
      res.status(400).json({ message: "Request param is missing" });
      return;
    }
    const rentals = await rentalService.getRentalByOwnerId(req.params.ownerId);
    res.status(200).json(rentals);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getClientRents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.params) {
      res.status(400).json({ message: "Request param is missing" });
      return;
    }
    const rentals = await rentalService.getRentalByClientId(
      req.params.clientId
    );
    res.status(200).json(rentals);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllRentals = async (req: any, res: any): Promise<void> => {
  try {
    const rentals = await rentalService.getAllRentals();
    res.status(200).json(rentals);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRental = async (req: any, res: any): Promise<void> => {
  try {
    const rental = await rentalService.updateRental(req.params.id, req.body);
    if (!rental) {
      res.status(404).json({ message: "Rental not found" });
      return;
    }
    res.status(200).json(rental);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const confirmRental = async (req: any, res: any): Promise<void> => {
  try {
    const rental = await rentalService.updateRental(req.params.id, {
      status: RentalStatus.CONFIRMED,
    });
    if (!rental) {
      res.status(404).json({ message: "Rental not found" });
      return;
    }
    res.status(200).json(rental);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelRental = async (req: any, res: any): Promise<void> => {
  try {
    const rental = await rentalService.updateRental(req.params.id, {
      status: RentalStatus.CANCELLED,
    });
    if (!rental) {
      res.status(404).json({ message: "Rental not found" });
      return;
    }
    res.status(200).json(rental);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
