const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cpuvendorlistSchema = new Schema({
    cpuid: {
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
    directlink: {
        type: String
    }
});

module.exports = mongoose.model('cpuvendorlist', cpuvendorlistSchema);