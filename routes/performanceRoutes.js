const express = require('express')
const performanceController = require('./../controllers/performanceController')
const router = express.Router()

router
    .route('/')
    .get(performanceController.getAllPerfomances)
    .post(performanceController.createPerformance)

    router
    .route('/:id')
    .get(performanceController.getPerformance)
    .patch(performanceController.updatePerformance)
    .delete(performanceController.deletePerformance)

module.exports = router