const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cpuvendorSchema = new Schema({
    cpuid:{
        type:String
    },
    vendorname:{
        type:String
    },
    price:{
        type:String
    },
    date:{
        type:String
    },    
    prev:{
        type:String
    },
})

module.exports = mongoose.model('cpuvendor', cpuvendorSchema)