const path = require("path");

const express = require("express");
const app = express();
const DataRouter = require("./routes/DataRouter.js");

const { MongoClient } = require("mongodb");
const config = require("../config/config.json");

//middleware
app.use(express.static(path.join(__dirname, "../../client/build")));

//routes
app.use("/api/data", DataRouter);
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/build/index.html"));
});

//creating mongo service
let client = new MongoClient(config.mongo.mongo_url);
client.connect(() => {
  console.log("connected to mongodb");
  //running server on mongo connection success
  app.listen(config.port, () => {
    console.log(`Example app listening at http://localhost:${config.port}`);
  });
  app.locals.db = client.db(config.mongo.db);
});
