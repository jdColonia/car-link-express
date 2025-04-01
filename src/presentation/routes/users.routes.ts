import { Router } from "express";
import {
  getUsers,
  getProfile,
  addOwnerRole,
  addAdminRole,
  editUser,
  deleteUser,
  createUser,
} from "../controllers/users.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { checkRole } from "../middlewares/check-role.middleware";
import { UserRole } from "../../domain/entities/User";

/**
 * Router for user-related operations.
 */
const router = Router();

/**
 * Get all users.
 * Accessible only to authenticated users with the ADMIN role.
 */
router.get("/", authenticate, checkRole(UserRole.ADMIN), getUsers);

/**
 * Get the profile of a specific user by their ID.
 * Accessible only to authenticated users.
 */
router.get("/:userId", authenticate, getProfile);

/**
 * Add the OWNER role to a user by their ID.
 * Accessible only to authenticated users with the TENANT role.
 */
router.post(
  "/:userId/addOwnerRole",
  authenticate,
  checkRole(UserRole.TENANT),
  addOwnerRole
);

/**
 * Add the ADMIN role to a user by their ID.
 * Accessible only to authenticated users with the ADMIN role.
 */
router.post(
  "/:userId/addAdminRole",
  authenticate,
  checkRole(UserRole.ADMIN),
  addAdminRole
);

/**
 * Edit a user's information by their ID.
 * Accessible only to authenticated users with the ADMIN role.
 */
router.put("/:userId", authenticate, checkRole(UserRole.ADMIN), editUser);

/**
 * Delete a user by their ID.
 * Accessible only to authenticated users with the ADMIN role.
 */
router.delete("/:userId", authenticate, checkRole(UserRole.ADMIN), deleteUser);

/**
 * Create a new user.
 * Accessible only to authenticated users with the ADMIN role.
 */
router.post("/", authenticate, checkRole(UserRole.ADMIN), createUser);

export default router;
