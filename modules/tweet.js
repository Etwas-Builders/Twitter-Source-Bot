// Exports
var exports = (module.exports = {});
// Imports
const sha512 = require("sha512"); // Sha512 Library
const TwitterApi = require("twitter-lite");
const twitterClient = new TwitterApi({
  subdomain: "api",
  version: "1.1",
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});
// Modules
let citation = require("./citation");
const client = require("twitter-autohook/client");

let handleNewTweet = async function (newTweet) {
  // let parsedTweet = body.newParsedTweet;
  // let newTweetKey = body.newTweetKey;
  // let citation = null;
  // let content = parsedTweet.content;
  // let hashedTweet = await generateHash(parsedTweet);
  let tweetId = newTweet.id;
  let content = newTweet.text;
  let time = newTweet.created_at;
  let tweetUserID = newTweet.user.id_str;
  let userScreenName = newTweet.user.name;
  let username = newTweet.user.screen_name;

  // Check Cache with Hash

  // return cached citation

  // Cite

  return `@${username} This is test citation which will be replaced with a valid citation in the near future, follow @whosaidthis_bot for updates`;
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
  let replyId = reply.id_str;
  let replyUserScreenName = reply.user.screen_name;
  //console.log("Tweet -> handleNewReplyEvent -> reply", reply);
  let original_tweet_id = reply.in_reply_to_status_id_str;
  //console.log("Original Tweet ID",original_tweet_id)
  try {
    let originalTweet_response = await twitterClient.get("statuses/show", {
      id: original_tweet_id,
      id_str: original_tweet_id,
    });
    let citation = await handleNewTweet(originalTweet_response);
    citation = `@${replyUserScreenName} ${citation}`;
    console.log(citation);
    try {
      let output = await twitterClient.post("statuses/update", {
        status: citation,
        in_reply_to_status_id: replyId,
      });
    } catch (error) {
      console.log("Post Error", error);
    }
    // console.log(
    //   "Tweet -> handleNewReplyEvent -> originalTweet_response",
    //   originalTweet_response
    // );
    // let fs = require("fs");
    // let json = JSON.stringify(originalTweet_response);
    // fs.writeFile("original-tweet.json", json, function (err) {
    //   if (err) throw err;
    //   console.log("Saved!");
    // });
  } catch (e) {
    console.log(e);
  }
};

exports.handleNewMentionEvent = async function (event) {
  console.log("Tweet -> handleNewMentionEvent -> event", event);

  let mention = event.tweet_create_events[0];
  let mentionId = mention.id_str;
  let citation = await handleNewTweet(mention);
  try {
    let output = await twitterClient.post("statuses/update", {
      status: citation,
      in_reply_to_status_id: mentionId,
    });
  } catch (error) {
    console.log("Post Error", error);
  }
};
