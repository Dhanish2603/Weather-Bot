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
  // Fetch user data from your database (e.g., MongoDB)
  const data = await user.find(); // Modify this to match your database schema
  if (data == null) {
    return;
  }
  res.render("admin", { data });
});

app.post("/admin/delete/:userId", (req, res) => {
  const userId = req.params.userId;
  // console.log(userId);

  bot.onText(/\/banuser/, (msg) => {
     

    // Ban the user from the chat
    bot.kickChatMember(userId, userId);
});

  // Delete the user from your database (e.g., MongoDB)
  user.findOneAndDelete({ chatid: userId }).then((err) => {
    if (err) {
      console.error(err);
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

bot.on("message", async (msg) => {
  // console.log(msg);
  const chatId = msg.chat.id;
  const userInput = msg.text;

  try {
    await user.findOne({ chatid: chatId }).then((existUser) => {
      if (existUser) {
        // console.log("user is ", existUser);
      } else {
        const createUser = user.create({ chatid: chatId });
        // console.log(createUser);
      }
    });

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
