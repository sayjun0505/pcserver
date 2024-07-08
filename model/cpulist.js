const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cpulistSchema = new Schema({
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
        type:Number
    }
})

module.exports = mongoose.model('cpulist', cpulistSchema)