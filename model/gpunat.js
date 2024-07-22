const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gpunatSchema = new Schema({
    gpuid: {
        type: String
    },
    html: {
        type: String
    }
});

module.exports = mongoose.model('gpunat', gpunatSchema);