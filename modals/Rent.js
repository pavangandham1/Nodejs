var mongoose = require('mongoose')
var RentSchema = new mongoose.Schema({
    owner:{
        type:String,
        required:true
    },
    tanent:
    {
        type:String,
        required:true
    },
    loc:{
        type:String,
        required:true
    },
    ophone:
    {
        type:Number,
        required:true
    },
    tphone:
    {
        type:Number,
        required:true
    },
    cost:{
        type:Number,
        required:true
    },
    bno:
    {
        type:String,
        required:true
    }
});
var rent = mongoose.model('Rent',RentSchema);
module.exports = rent;