const mongoose = require ('mongoose')

const serviceSchema = new mongoose.Schema ({
    name:{
        type:String,
        required:[true,'Please enter your service name']
    },
    priceInUSD:{
        type:String,
        required:[true, 'Please enter the service price']
    },
    priceInBTN:{
        type:String,
        required:[true, 'Please enter the service price']
    },
    status:{
        type:String,
        required:[true, 'Please enter the service status'],
        default:"Enabled"
    },
    description: {
        type:String,
        required: [true, 'Please enter the service description']
    }
})

const Service = mongoose.model('Service', serviceSchema)
module.exports = Service