import { Router } from "express";
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  getVehicleByLicensePlate,
  getMyVehicles,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicle.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { checkRole } from "../middlewares/check-role.middleware";
import { UserRole } from "../../domain/entities/User";

/**
 * Router for vehicle-related operations.
 */
const router = Router();

/**
 * Create a new vehicle.
 * Accessible only to authenticated users with the OWNER role.
 */
router.post("/", authenticate, checkRole(UserRole.OWNER), createVehicle);

/**
 * Get all vehicles.
 * Accessible only to authenticated users.
 */
router.get("/", authenticate, getAllVehicles);

/**
 * Get vehicles owned by the authenticated user.
 * Accessible only to authenticated users with the OWNER role.
 */
router.get(
  "/myVehicles",
  authenticate,
  checkRole(UserRole.OWNER),
  getMyVehicles
);

/**
 * Get a vehicle by its ID.
 * Accessible only to authenticated users.
 */
router.get("/:id", authenticate, getVehicleById);

/**
 * Get a vehicle by its license plate.
 * Accessible only to authenticated users.
 */
router.get("/license/:licensePlate", authenticate, getVehicleByLicensePlate);

/**
 * Update a vehicle by its ID.
 * Accessible only to authenticated users with the OWNER role.
 */
router.put("/:id", authenticate, checkRole(UserRole.OWNER), updateVehicle);

/**
 * Delete a vehicle by its ID.
 * Accessible only to authenticated users with the OWNER role.
 */
router.delete("/:id", authenticate, checkRole(UserRole.OWNER), deleteVehicle);

export default router;
