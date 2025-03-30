import authRoutes from "./auth.routes";
import usersRoutes from "./users.routes";

const express = require('express');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);

module.exports = router;