import { Router } from 'express';
import {
    createVehicle,
    getAllVehicles,
    getVehicleById,
    getVehicleByLicensePlate,
    getMyVehicles,
    updateVehicle,
    deleteVehicle,
} from '../controllers/vehicle.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/check-role.middleware';
import { UserRole } from '../../domain/entities/User';

const router = Router();

router.post('/',
    authenticate,
    checkRole(UserRole.OWNER),
    createVehicle
);

router.get('/',
    authenticate,
    getAllVehicles);

router.get('/myVehicles',
    authenticate,
    checkRole(UserRole.OWNER),
    getMyVehicles
);

router.get('/:id',
    authenticate,
    getVehicleById);

router.get('/license/:licensePlate',
    authenticate,
    getVehicleByLicensePlate);

router.put('/:id',
    authenticate,
    checkRole(UserRole.OWNER),
    updateVehicle
);

router.delete('/:id',
    authenticate,
    checkRole(UserRole.OWNER),
    deleteVehicle
);

export default router;