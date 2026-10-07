import express from 'express';
import { wishlistController } from './wishlist.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate); // All wishlist routes require authentication

router.get('/', wishlistController.getWishlists);
router.post('/', wishlistController.addWishlist);
router.delete('/:id', wishlistController.removeWishlist);

export default router;
