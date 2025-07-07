const express = require('express')
const legController = require('./../controllers/legController')
const router = express.Router()

router
    .route('/')
    .get(legController.getAllLegs)
    .post(legController.createLeg)

    router
    .route('/:id')
    .get(legController.getLeg)
    .patch(legController.updateLeg)
    .delete(legController.deleteLeg)

module.exports = router