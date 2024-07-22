const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storagelistSchema = new Schema({
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

module.exports = mongoose.model('storagelist', storagelistSchema)