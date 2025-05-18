const mongoose = require ('mongoose')

const charterSchema = new mongoose.Schema ({
    name:{
        type:String,
        required:[true,'Please enter the charter name']
    },
    status:{
        type:String,
        default:"Enabled"
    },
    description: {
        type:String,
        required: [true, 'Please enter the charter description']
    }
})

const Charter = mongoose.model('Charter', charterSchema)
module.exports = Charter