const mongoose = require ('mongoose')

const refundSchema = new mongoose.Schema ({
    name:{
        type:String,
        required:[true,'Please enter the refund name']
    },
    plan:{
        type:String,
        required:[true, 'Please enter the refund plan'],
        unique: true
    },
    status:{
        type:String,
        default:"Enabled"
    },
    description: {
        type:String,
        required: [true, 'Please enter the refund description']
    }
})

const Refund = mongoose.model('Refund', refundSchema)
module.exports = Refund