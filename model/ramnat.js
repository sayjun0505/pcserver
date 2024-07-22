const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ramnatSchema = new Schema({
    ramid: {
        type: String
    },
    html: {
        type: String
    }
});

module.exports = mongoose.model('ramnat', ramnatSchema);