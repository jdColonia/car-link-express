import { Router } from 'express';
import { signup, login } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/check-role.middleware';
import { UserRole } from '../../domain/entities/User';

const router = Router();

router.post('/signup', signup);

router.post('/login', login);

router.get('/test/admin', 
  authenticate, 
  checkRole(UserRole.ADMIN), 
  (req, res): void => {
    res.json({ message: 'Hello Admin!' });
  }
);

router.get('/test/tenant', 
  authenticate, 
  checkRole(UserRole.TENANT), 
  (req, res): void => {
    res.json({ message: 'Hello Tenant!' });
  }
);

router.get('/test/owner', 
  authenticate, 
  checkRole(UserRole.OWNER), 
  (req, res): void => {
    res.json({ message: 'Hello Owner!' });
  }
);

export default router; 