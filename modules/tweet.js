// Exports
var exports = (module.exports = {});
// Imports
const sha512 = require("sha512"); // Sha512 Library
const TwitterApi = require("twitter");
const twitterClient = {
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
};
// Modules
let citation = require("./citation");
const client = require("twitter-autohook/client");

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

exports.handleNewReplyEvent = async function (event) {
  let reply = event.tweet_create_events[0];
  let original_tweet_id = reply.in_reply_to_status_id;
  twitterClient.get("statuses/show/", { id: original_tweet_id }, function (
    error,
    response
  ) {
    if (!error) {
      console.log(response);
    }
  });
};

exports.handleNewMentionEvent = async function (event) {};
