const express = require('express')
const charterController = require('./../controllers/charterController')
const router = express.Router()

router
    .route('/')
    .get(charterController.getAllCharters)
    .post(charterController.createCharter)

    router
    .route('/:id')
    .get(charterController.getCharter)
    .patch(charterController.updateCharter)
    .delete(charterController.deleteCharter)

module.exports = router