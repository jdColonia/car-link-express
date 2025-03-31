import { MongoRentalRepository } from "../../infrastructure/repositories/rental.repository";
import { RentalService } from "../../infrastructure/services/rental.service";

const rentalRepository = new MongoRentalRepository();
const rentalService = new RentalService(rentalRepository);

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
