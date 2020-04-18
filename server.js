// Env Variable
var port = process.env.PORT;

// Libraries
var bodyParser = require("body-parser"); // Library for parsing data
var jsonParser = bodyParser.json(); // Using Data type Json

// Modules

var tweet = require("./modules/tweet");

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
app.get();

// Post Requests
app.post();
