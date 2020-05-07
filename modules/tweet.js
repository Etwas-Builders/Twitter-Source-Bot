// Exports
var exports = (module.exports = {});

// Modules
const nlp = require("./nlp");
const citation = require("./citation");
const processing = require("./processing/processing");

// Imports
const sha512 = require("sha512"); // Sha512 Library
const TwitterApi = require("twitter-lite");
const axios = require("axios");
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
  if (!content) {
    content = newTweet.text;
  }
  console.log("Tweet -> handleNewTweet -> content", content);
  let time = newTweet.created_at;
  let tweetUserID = newTweet.user.id_str;
  let userScreenName = newTweet.user.name;
  let username = newTweet.user.screen_name;

  axios.post(
    "https://discordapp.com/api/webhooks/707319466262003802/ZInKaBlUJg3BsCI2-FjV2wJWfre3ZxxzQjdq_ylTgu1Uqkn15CgbJgYZP3yDg5x7lT7g",
    {
      content: `New Requested Citation from ${userScreenName}.\n Tweet Body :\n ${content}`,
      username: "Who Said This Bot",
      avatar_url:
        "https://pbs.twimg.com/profile_images/1255489352714592256/kICVOCy-_400x400.png",
    }
  );

  // Check Cache with Hash

  let wordsToSearch = await nlp.wordsToSearch(content);
  console.log("Tweet -> handleNewTweet -> wordsToSearch", wordsToSearch);

  let query = wordsToSearch.join(" ");
  query += ` "news"`;
  console.log("Tweet -> handleNewTweet -> query", query);

  let results = await citation.googleSearch(query);
  if (results.length === 0) {
    return {
      message: `@${username} Hey we couldn't find a valid citation for this right now. In the future, I might have the required intelligence to find the valid source follow @whosaidthis_bot for updates`,
    };
  }
  console.log("Tweet -> handleNewTweet -> topResult", results);

  let topResult = await processing.getTopResult(results, username);
  console.log("Tweet -> handleNewTweet -> topResult.score", topResult.score);

  if (!topResult) {
    return {
      message: `@${username} Hey we couldn't find a valid citation for this right now. In the future, I might have the required intelligence to find the valid source follow @whosaidthis_bot for updates`,
    };
  }

  // return cached citation

  // Cite

  let message = `@${username} Our top result for this tweet is : ${topResult.title} ${topResult.url} `;

  axios.post(
    "https://discordapp.com/api/webhooks/707319466262003802/ZInKaBlUJg3BsCI2-FjV2wJWfre3ZxxzQjdq_ylTgu1Uqkn15CgbJgYZP3yDg5x7lT7g",
    {
      content: `${message}`,
      username: "Who Said This Bot",
      avatar_url:
        "https://pbs.twimg.com/profile_images/1255489352714592256/kICVOCy-_400x400.png",
    }
  );

  return {
    message: message,
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
  let citationResponse = await handleNewTweet(mention);
  let message = citationResponse.message;

  try {
    let output = await twitterClient.post("statuses/update", {
      status: message,
      in_reply_to_status_id: mentionId,
    });
  } catch (error) {
    console.log("Post Error", error);
  }
};
