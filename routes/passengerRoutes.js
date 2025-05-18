const express = require('express')
const passengerController = require('./../controllers/passengerController')
const router = express.Router()

router
    .route('/')
    .get(passengerController.getAllPassengers)
    .post(passengerController.createPassenger)

    router
    .route('/:id')
    .get(passengerController.getPassenger)
    .patch(passengerController.updatePassenger)
    .delete(passengerController.deletePassenger)

    router
    .route('/all/:bookingID')
    .get(passengerController.getPassengersByBookingID)

module.exports = router