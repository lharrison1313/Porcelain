//run at 8:00am and 8:00pm
//unique sessions
//total sessions
//top 5 countries
//top 5 num of sessions by ip

const { Telegraf } = require("telegraf");
const config = require("../../config/config.json");
const { buildHoneyBotData } = require("../services/CowrieDataService");
const moment = require("moment");
const { MongoClient } = require("mongodb");

const time = process.argv[2];
const date = moment().format("MM/DD/YYYY").toString();
const honeyBot = new Telegraf(config.honey_bot.token);
let client = new MongoClient(config.mongo.mongo_url);
let db = client.db(config.mongo.db);

//connecting to mongo
client.connect(async () => {
  console.log("connected to mongodb");
  try {
    //getting data by time period specified in args
    if (time === "morning") {
      //8:00pm-7:59am
      let evening = moment().subtract(1, "day").startOf("day").set("hours", 20);
      let morning = moment().startOf("day").set({ hours: 7, minutes: 59 });
      var data = await buildHoneyBotData(evening, morning, db);
    } else if (time === "evening") {
      //8:00am-7:59pm
      let morning = moment().startOf("day").set("hours", 8);
      let evening = moment().startOf("day").set({ hours: 19, minutes: 59 });
      var data = await buildHoneyBotData(morning, evening, db);
    } else {
      throw "Invalid time argument please use 'morning' or 'evening'";
    }

    //building message data
    var message = `Here is your ${time} honeypot overview for ${date}\n`;
    message = message.concat(`---------------------------\n`);
    message = message.concat(`Total Sessions: ${data.total_sessions} \nUnique Sessions: ${data.unique_sessions}`);
    message = message.concat(`\n---------------------------`);
    message = message.concat(`\nTop Countries by Unique Sessions:`);
    data.countries.forEach((element, index) => {
      message = message.concat(`\n${index + 1}) ${element.country}: ${element.sessions}`);
    });
    message = message.concat(`\n---------------------------`);
    message = message.concat(`\nTop IPs by Sessions:`);
    data.sessions_by_ip.forEach((element, index) => {
      message = message.concat(`\n${index + 1}) ${element.src_ip}: ${element.sessions}`);
    });

    //sending message
    honeyBot.telegram.sendMessage(config.honey_bot.chat_id, message);
    client.close();
    console.log(`*** The ${date} ${time} honeybot notification was successfully sent ***`);
  } catch (error) {
    console.log(`!!! An error occured with the ${date} ${time} honeybot notification !!!`);
    console.log(error);
    client.close();
  }
});
