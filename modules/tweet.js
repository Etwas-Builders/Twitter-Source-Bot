// Imports
var sha512 = require("sha512"); // Sha512 Library
// Modules
let citation = require("./citation");
// Exports
var exports = (module.exports = {});

exports.handleNewTweet = async function (body) {
  let parsedTweet = body.newParsedTweet;
  let newTweetKey = body.newTweetKey;
  let citation = null;
  let content = parsedTweet.content;
  let hashedTweet = await generateHash(parsedTweet);

  // Check Cache with Hash

  // return cached citation

  // Cite

  return citation;
};

let generateHash = async function (tweet) {
  let hash = {
    username: "",
    time: "",
    content: "",
  };
  hash.username = sha512(tweet.username).toString("hex");
  hash.time = sha512(tweet.time).toString("hex");
  hash.content = sha512(tweet.content).toString("hex");
  return hash;
};

exports.handleTweetEvent = async function (tweet) {};
