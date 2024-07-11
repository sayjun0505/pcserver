const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mboardnatSchema = new Schema({
    mboardid: {
        type: String
    },
    html: {
        type: String
    }
});

module.exports = mongoose.model('mboardnat', mboardnatSchema);