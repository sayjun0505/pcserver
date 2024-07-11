const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mboardlistSchema = new Schema({
    imgurl:{
        type:String
    },
    name:{
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

module.exports = mongoose.model('mboardlist', mboardlistSchema)