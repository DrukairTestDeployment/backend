const express = require('express')
const refundController = require('./../controllers/refundController')
const router = express.Router()

router
    .route('/')
    .get(refundController.getAllRefunds)
    .post(refundController.createRefund)

router
    .route('/:id')
    .get(refundController.getRefund)
    .patch(refundController.updateRefund)
    .delete(refundController.deleteRefund)

module.exports = router