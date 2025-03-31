import authRoutes from "./auth.routes";
import usersRoutes from "./users.routes";
import vehiclesRoutes from "./vehicle.routes";

const express = require('express');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/vehicles', vehiclesRoutes);

module.exports = router;