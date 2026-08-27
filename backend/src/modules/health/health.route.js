import { Router } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';

const router = Router();

router.get('/', (req, res) => {
  sendSuccess(res, 200, 'SmartTrip API is running healthily', {
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
