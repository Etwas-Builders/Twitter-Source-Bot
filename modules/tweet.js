// Exports
var exports = (module.exports = {});

// Modules
const nlp = require("./nlp");
const citation = require("./citation");

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
const client = require("twitter-autohook/client");

let handleNewTweet = async function (newTweet) {
  // let parsedTweet = body.newParsedTweet;
  // let newTweetKey = body.newTweetKey;
  // let citation = null;
  // let content = parsedTweet.content;
  // let hashedTweet = await generateHash(parsedTweet);
  let tweetId = newTweet.id;
  let content = newTweet.full_text;
  console.log("Tweet -> handleNewTweet -> content", content);
  let time = newTweet.created_at;
  let tweetUserID = newTweet.user.id_str;
  let userScreenName = newTweet.user.name;
  let username = newTweet.user.screen_name;

  // Check Cache with Hash

  let wordsToSearch = await nlp.wordsToSearch(content);
  console.log("Tweet -> handleNewTweet -> wordsToSearch", wordsToSearch);

  let query = wordsToSearch.join(" ");
  console.log("Tweet -> handleNewTweet -> query", query);
  //query += ` "news" -twitter `;

  let topResult = await citation.googleSearch(query);
  console.log("Tweet -> handleNewTweet -> topResult", topResult);

  // return cached citation

  // Cite

  return {
    message: `@${username} Our top result for this tweet is : ${topResult.title} ${topResult.url} `,
    url: topResult.url,
  };
  //return `@${username} This is test citation which will be replaced with a valid citation in the near future, follow @whosaidthis_bot for updates`;
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
      tweet_mode: "extended",
    });
    // console.log(
    //   "Tweet -> handleNewReplyEvent -> originalTweet_response",
    //   originalTweet_response
    // );

    let citationResponse = await handleNewTweet(originalTweet_response);
    let message = citationResponse.message;
    message = `@${replyUserScreenName} ${message}`;
    let attachment_url = citationResponse.url;
    console.log(message);
    try {
      let output = await twitterClient.post("statuses/update", {
        status: message,
        in_reply_to_status_id: replyId,
        //attachment_url: attachment_url,
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
