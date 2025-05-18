const express = require('express')
const agentController = require('./../controllers/agencyController')
const router = express.Router()

router
    .route('/')
    .get(agentController.getAllAgents)
    .post(agentController.createAgent)

    router
    .route('/:id')
    .get(agentController.getAgent)
    .patch(agentController.updateAgent)
    .delete(agentController.deleteAgent)

module.exports = router