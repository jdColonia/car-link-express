import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createRental,
  deleteRental,
  getAllRentals,
  getRentalById,
  updateRental,
} from "../controllers/rental.controller";

const router = Router();

router.post("/", authenticate, createRental);
router.get("/", authenticate, getAllRentals);
router.get("/:id", authenticate, getRentalById);
router.put("/:id", authenticate, updateRental);
router.delete("/:id", authenticate, deleteRental);

export default router;
