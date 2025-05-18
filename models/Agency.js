const mongoose = require ('mongoose')

const agencySchema = new mongoose.Schema ({
    name:{
        type:String,
        required:[true,'Please enter the agent name']
    },
    code:{
        type:String,
        required:[true,'Please enter the agent code'],
        unique: [true, 'The agent code should be unique']
    }
})

const Agency = mongoose.model('Agency', agencySchema)
module.exports = Agency