const mongoose = require ('mongoose')

const routeSchema = new mongoose.Schema ({
    sector:{
        type:String,
        required:[true,'Please enter the sector']
    },
    duration: {
        type:String,
        required: [true, 'Please enter the duration'],
    },
    summerWeight:{
        type: String,
        required: [true, 'Please provide the summer weight']
    },
    winterWeight:{
        type: String,
        required: [true, 'Please provide the winter weight']
    },
    status:{
        type:String,
        default:"Enabled"
    },
    charter:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Charter',
        required: true
    }
})

const Route = mongoose.model('Route', routeSchema)
module.exports = Route