const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const casevendorlistSchema = new Schema({
    caseid: {
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

module.exports = mongoose.model('casevendorlist', casevendorlistSchema);