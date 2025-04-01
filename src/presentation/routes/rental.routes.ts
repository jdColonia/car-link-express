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

const router = Router();

router.post("/", authenticate, createRental);
router.get("/", authenticate, getAllRentals);
router.get("/:id", authenticate, getRentalById);
router.get(
  "/owner/:ownerId",
  authenticate,
  checkRole(UserRole.OWNER),
  getOwnerRents
);
router.get(
  "/client/:clientId",
  authenticate,
  checkRole(UserRole.TENANT),
  getClientRents
);
router.put("/:id", authenticate, updateRental);
router.put("/:id/confirm", authenticate, confirmRental);
router.put("/:id/cancel", authenticate, cancelRental);
router.delete("/:id", authenticate, deleteRental);

export default router;
