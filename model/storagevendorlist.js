const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storagevendorlistSchema = new Schema({
    storageid: {
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

module.exports = mongoose.model('storagevendorlist', storagevendorlistSchema);