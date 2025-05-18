const mongoose = require ('mongoose')

const roleSchema = new mongoose.Schema ({
    name:{
        type:String,
        required:[true,'Please enter your role name']
    },
})

const Role = mongoose.model('Role', roleSchema)
module.exports = Role