const express = require('express')
const routeController = require('./../controllers/routeController')
const router = express.Router()

router
    .route('/')
    .get(routeController.getAllRoutes)
    .post(routeController.createRoute)

    router
    .route('/:id')
    .get(routeController.getRoute)
    .patch(routeController.updateRoute)
    .delete(routeController.deleteRoute)

module.exports = router