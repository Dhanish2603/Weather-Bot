const mongoose = require("mongoose")
const schema = new mongoose.Schema({
    chatid:String
})
const user = mongoose.model("users",schema)
module.exports = user

