const express = require('express')
const commisionController = require('./../controllers/commisionController')
const router = express.Router()

router
    .route('/')
    .get(commisionController.getAllCommisions)
    .post(commisionController.createCommision)

router
    .route('/:id')
    .get(commisionController.getCommision)
    .patch(commisionController.updateCommision)
    .delete(commisionController.deleteCommision)

module.exports = router