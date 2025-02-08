// Importing express and controllers
import express from 'express';
import {
    addAlternatePhone,
    getMyProfile,
    getUserById,
    login,
    logout,
    startWorking,
    verifyOtp,
} from '../controllers/User.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);

router.post('/verifyOtp', verifyOtp);

router.route("/logout").get(logout);

router.route("/me").get(isAuthenticated, getMyProfile);

router.route("/addAlternatePhone").put(addAlternatePhone);

router.route("/getUserById/:id").get(getUserById);

router.route("/startWorking/:userId/:constructionId").put(startWorking);

export default router;
