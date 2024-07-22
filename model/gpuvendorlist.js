const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gpuvendorlistSchema = new Schema({
    gpuid: {
        type: String
    },
    displayname: {
        type: String
    },
    vendorimgurl: {
        type: String
    },
    price: {
        type: String
    },
    payment: {
        type: String
    },
    alink: {
        type: String
    },
    directlink: {
        type: String
    }
});

module.exports = mongoose.model('gpuvendorlist', gpuvendorlistSchema);