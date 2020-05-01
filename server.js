// Env Variable
var port = process.env.PORT;

// Libraries
var bodyParser = require("body-parser"); // Library for parsing data
var jsonParser = bodyParser.json(); // Using Data type Json
var cors = require("cors"); // Library for handling access headers
const { Autohook } = require("twitter-autohook");

// Modules
var tweet = require("./modules/tweet");
var citation = require("./modules/citation");

// Server
var express = require("express"); // Framework for Node
var app = express(); // Establishing Express App
//app.use(express.logger());
app.use(cors()); // Cors to Handle Url Authentication
app.use(bodyParser.json()); // Using Body Parser
app.set("jwtTokenSecret", ""); // JWT Secret
var server = app.listen(port); // Set Port

// Twitter Api
let twitterWebhook = async function {
  const webhook = new Autohook();

  // Removes existing webhooks
  await webhook.removeWebhooks();

  // Listens to incoming activity
  webhook.on("event", (event) => console.log("Something happened:", event));

  // Starts a server and adds a new webhook
  await webhook.start();

  // Subscribes to a user's activity
  await webhook.subscribe({ oauth_token, oauth_token_secret });
};

twitterWebhook();

// Routing

// Get Requests

// Testing Routes

app.get("/getGoogleNewsCitation", async function (req, res) {
  var data = req.query.data;
  var returned = await citation.googleNews(data);
  res.status(200).json({
    source: returned,
  });
});

app.get("/getWikiCitation", async function (req, res) {
  var data = req.query.data;
  var returned = await citation.wiki(data);
  res.status(200).json({
    source: returned,
  });
});

app.get("/", function (req, res) {});

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
