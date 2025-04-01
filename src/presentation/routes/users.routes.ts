import { Router } from 'express';
import { getUsers, getProfile, addOwnerRole, addAdminRole, editUser, deleteUser } from '../controllers/users.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/check-role.middleware';
import { UserRole } from '../../domain/entities/User';

const router = Router();

router.get('/',
  authenticate,
  getUsers
);

router.get('/:userId',
  authenticate,
  getProfile
);

router.post('/:userId/addOwnerRole',
  authenticate,
  checkRole(UserRole.TENANT),
  addOwnerRole
);

router.post('/:userId/addAdminRole',
  authenticate,
  checkRole(UserRole.ADMIN),
  addAdminRole
);

router.put('/:userId',
  authenticate,
  checkRole(UserRole.ADMIN),
  editUser
);

router.delete('/:userId',
  authenticate,
  checkRole(UserRole.ADMIN),
  deleteUser
);

export default router; 