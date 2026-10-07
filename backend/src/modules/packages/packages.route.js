import express from 'express';
import { packageController } from './packages.controller.js';
import { optionalAuthenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();
router.use(optionalAuthenticate);
router.get('/', packageController.listPackages);
router.get('/:id', packageController.getPackage);

export default router;