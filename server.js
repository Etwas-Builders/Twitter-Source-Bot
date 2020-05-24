require("dotenv").config();
// Env Variable
const port = 3000;

// Libraries
const bodyParser = require("body-parser"); // Library for parsing data
const jsonParser = bodyParser.json(); // Using Data type Json
const cors = require("cors"); // Library for handling access headers
const { Autohook } = require("twitter-autohook");

const morgan = require("morgan");
const axios = require("axios");
const fs = require("fs");
const mongoose = require("mongoose");

// Modules
const tweetHandler = require("./modules/tweet");
const citation = require("./modules/citation");
const tester = require("./modules/tester");
const IP = require("./modules/ip");

// Server
const express = require("express"); // Framework for Node
const app = express(); // Establishing Express App

morgan("tiny");
app.use(cors()); // Cors to Handle Url Authentication
app.options("*", cors());
app.use(bodyParser.json()); // Using Body Parser
app.set("jwtTokenSecret", ""); // JWT Secret
const server = app.listen(port); // Set Port

mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);

mongoose
  .connect(`mongodb://${process.env.MONGO_URL}`)
  .then((con) => {
    console.log("db connected");
    app.set("con", con);
  })
  .catch((err) => {
    console.log(err);
    throw err;
  });

let webhookSubscribe;

// Twitter Api
let twitterWebhook = async function () {
  try {
    console.log("Starting Webhook ...");
    let webhook = new Autohook({
      token: process.env.ACCESS_TOKEN,
      token_secret: process.env.ACCESS_TOKEN_SECRET,
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET,
      env: process.env.TWITTER_WEBHOOK_ENV,
      port: 1337,
    });
    // Removes existing webhooks
    await webhook.removeWebhooks();

    // Listens to incoming activity
    webhook.on("event", (event) => handleNewWebHook(event));

    // Starts a server and adds a new webhook
    await webhook.start();

    // Subscribes to a user's activity
    webhookSubscribe = await webhook.subscribe({
      oauth_token: process.env.ACCESS_TOKEN,
      oauth_token_secret: process.env.ACCESS_TOKEN_SECRET,
    });
    let ip = await IP.checkGCP();
    axios.post(process.env.DISCORD_SERVER_URL, {
      content: `Webhook Running From ${ip}`,
      username: "Who Said This Bot",
      avatar_url:
        "https://pbs.twimg.com/profile_images/1255489352714592256/kICVOCy-_400x400.png",
    });
  } catch (err) {
    console.log("Error in starting server", err);
    let ip = await IP.checkGCP();
    axios.post(process.env.DISCORD_SERVER_URL, {
      content: `<@285449811975733248> <@491917392646111243> <@179264835618471936> <@367812757485125642> <@311891570570035200> Webhook Could not Start because of ${err} From ${ip}`,
      username: "Who Said This Bot",
      avatar_url:
        "https://pbs.twimg.com/profile_images/1255489352714592256/kICVOCy-_400x400.png",
    });
    setTimeout(() => {
      fs.writeFileSync(
        "./lastRestart.json",
        JSON.stringify({ time: new Date() })
      );
    }, 60 * 1000); // Wait 1 Min
  }
};
let main = async function () {
  await twitterWebhook();
  await tweetHandler.getMentionTimeline();
  setTimeout(async () => {
    await tweetHandler.getMentionTimeline();
  }, 60 * 15 * 1000);
  setTimeout(() => {
    fs.writeFileSync(
      "./lastRestart.json",
      JSON.stringify({ time: new Date() })
    );
  }, 3600 * 1000);
};
main();
let handleNewWebHook = function (event) {
  console.log("handleNewWebHook -> event", event);
  // let fs = require("fs");
  // let json = JSON.stringify(event, null, 2);
  // fs.writeFile("passiveRetweet.json", json, function (err) {
  //   if (err) throw err;
  //   console.log("Saved!");
  // });
  if (event.tweet_create_events) {
    let tweet = event.tweet_create_events[0];
    tweetHandler.tweetClassify(tweet, false);
  }
};

// Create IPFS instance

// Routing

// Get Requests

// Testing Routes

app.get("/dbCheckTweet", async function (req, res) {
  let database = require("./modules/database");
  let tweetId = req.query.tweetId;
  let output = await database.checkTweetCache(tweetId);
  res.status(200).json({
    output: output,
  });
});

app.get("/nlpOutput", async function (req, res) {
  let tweetId = req.query.tweetId;

  mongoose.connection.db.collection("nlpSchemas", async function (
    err,
    collection
  ) {
    if (err) {
      console.log(err);
      res.send(err);
    }
    //console.log("schema accessed");
    console.log(tweetId);

    let response = await collection.findOne({ tweetId: tweetId });
    //console.log(response);
    if (!response) {
      res
        .status(200)
        .json({ output: "Sorry not output found for this tweet id" });
    } else {
      fs.writeFileSync("./nlpOutput.txt", response.nlpOutput);
      res.sendFile(require("path").join(__dirname, "./nlpOutput.txt"));
    }
  });
});

app.get("/", async function (req, res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  try {
    let lastRestart = JSON.parse(fs.readFileSync("./lastRestart.json"));
    res.status(200).json({
      webhookSubscribeStatus: webhookSubscribe,
      serverStatus: "Server is On!",
      lastRestart: lastRestart,
    });
  } catch (err) {
    res.status(200).json({
      webhookSubscribeStatus: webhookSubscribe,
      serverStatus: "Server is On!",
      err: err,
    });
  }
});

app.get("/addTweetToTest", async function (req, res) {
  let tweetId = req.query.tweetId;
  let idName = req.query.testName;
  let type = req.query.type;
  let response = await tester.createTest(tweetId, idName, type);
  res.status(200).json({
    response: response,
  });
});

// Post Requests
// app.post("/newTweets", async function (req, res) {
//   let body = req.body;
//   let citation = await tweet.handleNewTweet(body);
//   console.log(body);
//   res.status(200).json({
//     output: "Test",
//     citation: citation,
//   });
// });
