const express = require('express')
const bookingController = require('./../controllers/bookingController')
const router = express.Router()

router
    .route('/')
    .get(bookingController.getAllBookings)
    .post(bookingController.createBooking)

router
    .route('/image/')
    .post(bookingController.uploadPaymentImage, bookingController.createBooking)

router
    .route('/imageupdate/:id')
    .patch(bookingController.uploadPaymentImage, bookingController.updateBooking)

router
    .route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking)

router
    .route('/approve/:id/:agentcode')
    .post(bookingController.approveBookingAndSendEmail)

router
    .route('/signchecksum')
    .post(bookingController.signChecksum)

router
    .route('/decline/:id')
    .post(bookingController.declineBookingAndSendEmail)

router
    .route('/:bookingID/:cid')
    .get(bookingController.getBookingByBookingCid);

router
    .route('/email/all/:email')
    .get(bookingController.getBookingByEmail);

router
    .route('/image/get/:filename')
    .get(bookingController.getImage);

module.exports = router
