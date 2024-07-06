const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cpuvendorSchema = new Schema({
    cpuid: {
        type: String
    },
    vendorname: {
        type: String
    },
    price: {
        type: Number
    },
    date: {
        type: String
    },
    prev: {
        type: Number 
    }
});

module.exports = mongoose.model('cpuvendor', cpuvendorSchema);