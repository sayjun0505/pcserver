const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cpunatSchema = new Schema({
    cpuid: {
        type: String
    },
    html: {
        type: String
    }
});

module.exports = mongoose.model('cpunat', cpunatSchema);