const mongoose = require ('mongoose')

const legSchema = new mongoose.Schema ({
    name:{
        type:String,
        required:[true,'Please enter the charter name']
    },
    booking_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
    }
})

const Leg = mongoose.model('Leg', legSchema)
module.exports = Leg
