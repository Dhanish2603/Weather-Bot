const mongoose = require("mongoose")
const schema = new mongoose.Schema({
    chatid:String,
    fromid:String,
    firstname:String,
    lastname:String,
    block:Boolean
})
const user = mongoose.model("users",schema)
module.exports = user

