const { type } = require('express/lib/response');
const mongoose = require('mongoose')

const commisionSchema = new mongoose.Schema({
    cType:{
        type:String,
        required:[true,'Please enter commision name']
    },

    commisionValue:{
        type:Number,
        default:0
    }
})

const Commision = mongoose.model('Commision',commisionSchema)
module.exports = Commision