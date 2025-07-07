const mongoose = require ('mongoose')

const passengerSchema = new mongoose.Schema ({
    name:{
        type:String,
        required:[true,'Please enter the refund name']
    },
    weight:{
        type:String,
        required:[true, 'Please enter passenger weight']
    },
    cid: {
        type:String,
    },
    bagWeight:{
        type:String,
        required:[true, 'Please enter baggage weight']
    },
    gender:{
        type:String,
    },
    medIssue:{
        type:String,
    },
    contact:{
        type:String,
    },
    leg_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Leg',
    },
    booking_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
    },
    remarks: {
        type: String,
    }
})

const Passenger = mongoose.model('Passenger', passengerSchema)
module.exports = Passenger