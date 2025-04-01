import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createRental,
  deleteRental,
  getAllRentals,
  getOwnerRents,
  getClientRents,
  getRentalById,
  updateRental,
  confirmRental,
  cancelRental,
} from "../controllers/rental.controller";
import { checkRole } from "../middlewares/check-role.middleware";
import { UserRole } from "../../domain/entities/User";

/**
 * Router for rental-related operations.
 */
const router = Router();

/**
 * Create a new rental.
 * Accessible only to authenticated users.
 */
router.post("/", authenticate, createRental);

/**
 * Get all rentals.
 * Accessible only to authenticated users.
 */
router.get("/", authenticate, getAllRentals);

/**
 * Get a rental by its ID.
 * Accessible only to authenticated users.
 */
router.get("/:id", authenticate, getRentalById);

/**
 * Get rentals owned by the authenticated user.
 * Accessible only to authenticated users with the OWNER role.
 */
router.get("/owner", authenticate, checkRole(UserRole.OWNER), getOwnerRents);

/**
 * Get rentals where the authenticated user is the client.
 * Accessible only to authenticated users with the TENANT role.
 */
router.get("/client", authenticate, checkRole(UserRole.TENANT), getClientRents);

/**
 * Update a rental by its ID.
 * Accessible only to authenticated users.
 */
router.put("/:id", authenticate, updateRental);

/**
 * Confirm a rental by its ID.
 * Accessible only to authenticated users.
 */
router.put("/:id/confirm", authenticate, confirmRental);

/**
 * Cancel a rental by its ID.
 * Accessible only to authenticated users.
 */
router.put("/:id/cancel", authenticate, cancelRental);

/**
 * Delete a rental by its ID.
 * Accessible only to authenticated users.
 */
router.delete("/:id", authenticate, deleteRental);

export default router;
