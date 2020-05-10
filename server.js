require("dotenv").config();
// Env Variable
const port = 3000;

// Libraries
const bodyParser = require("body-parser"); // Library for parsing data
const jsonParser = bodyParser.json(); // Using Data type Json
const cors = require("cors"); // Library for handling access headers
const { Autohook } = require("twitter-autohook");
const OAuth = require("oauth");
const morgan = require("morgan");
const axios = require("axios");
const publicIp = require("public-ip");

// Modules
const tweetHandler = require("./modules/tweet");
const citation = require("./modules/citation");
const tester = require("./modules/test");

// Server
const express = require("express"); // Framework for Node
const app = express(); // Establishing Express App
morgan("tiny");
app.use(cors()); // Cors to Handle Url Authentication
app.options("*", cors());
app.use(bodyParser.json()); // Using Body Parser
app.set("jwtTokenSecret", ""); // JWT Secret
const server = app.listen(port); // Set Port

let webhookSubscribe;

// Twitter Api
let twitterWebhook = async function () {
  const webhook = new Autohook({
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
  let ip = await publicIp.v4();
  if (ip === process.env.GCP_IP) {
    ip = "Google Cloud";
  } else {
    ip = `Not From GCP Server ${ip}`;
  }
  axios.post(process.env.DISCORD_WEBHOOK_URL, {
    content: `Webhook and Server Setup and Running From ${ip}`,
    username: "Who Said This Bot",
    avatar_url:
      "https://pbs.twimg.com/profile_images/1255489352714592256/kICVOCy-_400x400.png",
  });
};

twitterWebhook();

let handleNewWebHook = function (event) {
  console.log("handleNewWebHook -> event", event);
  // let fs = require("fs");
  // let json = JSON.stringify(event, null, 2);
  // fs.writeFile("reply.json", json, function (err) {
  //   if (err) throw err;
  //   console.log("Saved!");
  // });
  if (event.tweet_create_events) {
    let tweet = event.tweet_create_events[0];
    if (!(tweet.user.id_str === "1255487054219218944")) {
      // If it is not our own tweet
      if (tweet.in_reply_to_status_id) {
        // This event is a reply
        tweetHandler.handleNewReplyEvent(event);
      } else {
        console.log("Not Reply event");
        let tweetEntities = tweet.entities;
        let user_mentions = tweetEntities.user_mentions;
        for (let user of user_mentions) {
          console.log("handleNewWebHook -> user", user);
          if (user.id_str === "1255487054219218944") {
            // Mention Behaviour
            tweetHandler.handleNewMentionEvent(event);
          }
        }
      }
    } else {
      let tweetContent = tweet.text;
      if (tweetContent.includes("Our top result for this tweet is :")) {
        // Testing Code
        tester.alphaTest(tweet);
      }
    }
  }
};

// Create IPFS instance

// Routing

// Get Requests

// Testing Routes

app.get("/getGoogleNewsCitation", async function (req, res) {
  let data = req.query.data;
  let returned = await citation.googleNews(data);
  res.status(200).json({
    source: returned,
  });
});

app.get("/getWikiCitation", async function (req, res) {
  let data = req.query.data;
  let returned = await citation.wiki(data);
  res.status(200).json({
    source: returned,
  });
});

app.get("/", async function (req, res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  res.status(200).json({
    webhookSubscribeStatus: webhookSubscribe,
    serverStatus: "Server is On!",
  });
});

app.get("/dbTest", async function (req, res) {
  // let orbitdb = await initOrbitDb();
  // const counter = await orbitdb.counter("Mozilla-Open-Lab-Etwas");
  // await counter.inc();
  // console.log("Orbit Db", counter.value);
  // res.send(counter.value);
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
