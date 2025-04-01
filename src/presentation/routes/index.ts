import authRoutes from "./auth.routes";
import usersRoutes from "./users.routes";
import vehiclesRoutes from "./vehicle.routes";
import rentalRoutes from "./rental.routes";

/**
 * Main router for the application.
 * Combines all route modules.
 */
const express = require("express");

const router = express.Router();

/**
 * Routes for authentication.
 */
router.use("/auth", authRoutes);

/**
 * Routes for user management.
 */
router.use("/users", usersRoutes);

/**
 * Routes for vehicle management.
 */
router.use("/vehicles", vehiclesRoutes);

/**
 * Routes for rental management.
 */
router.use("/rentals", rentalRoutes);

module.exports = router;
