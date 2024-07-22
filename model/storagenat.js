const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storagenatSchema = new Schema({
    storageid: {
        type: String
    },
    html: {
        type: String
    }
});

module.exports = mongoose.model('storagenat', storagenatSchema);