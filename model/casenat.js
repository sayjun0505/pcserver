const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const casenatSchema = new Schema({
    caseid: {
        type: String
    },
    html: {
        type: String
    }
});

module.exports = mongoose.model('casenat', casenatSchema);