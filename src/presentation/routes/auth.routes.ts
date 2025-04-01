import { Router } from "express";
import { signup, login } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { checkRole } from "../middlewares/check-role.middleware";
import { UserRole } from "../../domain/entities/User";

/**
 * Router for authentication-related operations.
 */
const router = Router();

/**
 * Register a new user.
 */
router.post("/signup", signup);

/**
 * Log in an existing user.
 */
router.post("/login", login);

/**
 * Test route for ADMIN role.
 * Accessible only to authenticated users with the ADMIN role.
 */
router.get(
  "/test/admin",
  authenticate,
  checkRole(UserRole.ADMIN),
  (req, res): void => {
    res.json({ message: "Hello Admin!" });
  }
);

/**
 * Test route for TENANT role.
 * Accessible only to authenticated users with the TENANT role.
 */
router.get(
  "/test/tenant",
  authenticate,
  checkRole(UserRole.TENANT),
  (req, res): void => {
    res.json({ message: "Hello Tenant!" });
  }
);

/**
 * Test route for OWNER role.
 * Accessible only to authenticated users with the OWNER role.
 */
router.get(
  "/test/owner",
  authenticate,
  checkRole(UserRole.OWNER),
  (req, res): void => {
    res.json({ message: "Hello Owner!" });
  }
);

export default router;
