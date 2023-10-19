require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const token = process.env.TELE_API;
const express = require("express");
const app = express();
const bot = new TelegramBot(token, { polling: true });
const db = require("./model/db");
const user = require("./model/Schema");

app.set("view engine", "ejs");
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/admin", async (req, res) => {
  const data = await user.find();
  if (data == null) {
    return;
  }
  res.render("admin", { data });
});

app.post("/admin/delete/:userId", (req, res) => {
  const userId = req.params.userId;
  user.findOneAndUpdate({ chatid: userId }, { block: true }).then((err) => {
    if (err) {
      console.error(err);
      console.log(err);
      res.redirect("/admin");
    } else {
      res.redirect("/admin");
    }
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});

bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  bot.sendMessage(chatId, resp);
});

// bot.onText(/\/block/, (msg) => {
//   const chatId = msg.chat.id;
//   const userId = msg.from.id;
//   //  user.findOne({ chatid: chatId }).then((existUser =>{
//     //  console.log("working", existUser.block)
//     bot.restrictChatMember(chatId, userId, {
//       can_send_messages: false,
//       can_send_media_messages: false,
//       can_send_other_messages: false,
//       can_add_web_page_previews: false
//   });

//   //  }))
//     // if(data.block){
//     // }
//   // Ban the user from the chat
// });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userInput = msg.text;
  const fromid = msg.from.id;
  const firstname = msg.from.first_name;
  const lastname = msg.from.last_name;

  try {
    const detail = await user.findOne({ chatid: chatId });
    console.log(detail);

    if (!detail) {
      const createUser = await user.create({
        chatid: chatId,
        firstname,
        lastname,
        fromid,
        block: false,
      });
    }

    if (detail.block == true) {
      bot.sendMessage(chatId, "You are blocked cant get any updates now");
      return;
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${userInput}&appid=b46a526fc6cbc20c83b1b09defa28e89`
    );
    const data = response.data;
    const weather = data.weather[0].description;
    const temperature = data.main.temp - 273.15;
    const city = data.name;
    const humidity = data.main.humidity;
    const pressure = data.main.pressure;
    const windSpeed = data.wind.speed;

    const message = `The weather in ${city} is ${weather} with a temperature of ${temperature.toFixed(
      2
    )}°C. The humidity is ${humidity}%, the pressure is ${pressure}hPa, and the wind speed is ${windSpeed}m/s.`;

    bot.sendMessage(chatId, message);
  } catch (error) {
    console.log("cant access");
    bot.sendMessage(chatId, "City doesn't exist.");
  }
});
