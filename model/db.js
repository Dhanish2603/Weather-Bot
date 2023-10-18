const mongoose = require("mongoose");
require("dotenv").config();
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("succesfully connected");
  })
  .catch((err) => {
    console.log(err);
  });
   