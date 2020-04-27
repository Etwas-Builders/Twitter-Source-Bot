// Env Variable
var port = process.env.PORT;

// Libraries
var bodyParser = require("body-parser"); // Library for parsing data
var jsonParser = bodyParser.json(); // Using Data type Json

// Modules
n;
var tweet = require("./modules/tweet");
var citation = require("./modules/citation");

// Server
var express = require("express"); // Framework for Node
var app = express(); // Establishing Express App
app.use(express.logger());
app.use(cors()); // Cors to Handle Url Authentication
app.use(bodyParser.json()); // Using Body Parser
app.set("jwtTokenSecret", ""); // JWT Secret
var server = app.listen(port); // Set Port

// Routing

// Get Requests

// Testing Routes

app.get("/getGsogleCitation", async function (req, res) {
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
app.post("/newTweets", function (req, res) {
  let body = req.body;
  console.log(body);
  res.status(200).json({
    output: "Test",
  });
});
