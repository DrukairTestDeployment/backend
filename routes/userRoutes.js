const express = require('express')
const userController = require('./../controllers/userController')
const authController = require('./../controllers/authController')
const router = express.Router()

router.post('/register', authController.signupLimiter, authController.signup)
router.post('/signin', authController.loginLimiter, authController.login)
router.get('/logout', authController.logout)
router.patch('/updatepassword/:id', authController.updatePassword)

router
    .route('/')
    .get(authController.protect, userController.getAllUsers)
    .post(userController.createUser)

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

router
    .post('/send-otp', authController.sendOtp);

router
    .post('/reset-password', authController.forgotPasswordLimiter, authController.forgotPassword);

router
    .get('/email/:email', userController.getUserByEmail);

router
    .post('/verifyOtp', authController.verifyOtp);

module.exports = router