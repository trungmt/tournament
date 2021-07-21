import express from 'express';
import * as authController from '../../controller/auth/auth';
const router = express.Router();

router.post('/register', authController.register);
router.get('/register', (req, res) => {
  res.send('abc');
});

export default router;
