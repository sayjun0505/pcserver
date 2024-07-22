const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const caselistSchema = new Schema({
    imgurl:{
        type:String
    },
    name:{
        type:String
    },
    productid:{
        type:String
    },
    detail:{
        type:String
    },
    link:{
        type:String
    },
    price:{
        type:String
    }
})

module.exports = mongoose.model('caselist', caselistSchema)