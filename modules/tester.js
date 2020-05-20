var exports = (module.exports = {});

const TwitterApi = require("twitter-lite");
const axios = require("axios");
const tweetSchema = require("../models/tweetSchema");
const testerSchema = require("../models/testerSchema");
const clusterHandler = require("./processing/clusterHandler");
const twitterClient = new TwitterApi({
  subdomain: "api",
  version: "1.1",
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

exports.alphaTest = async function (tweet) {
  let reply_tweet_id = tweet.in_reply_to_status_id_str;
  //console.log("Original Tweet ID",original_tweet_id)
  try {
    let reply_response = await twitterClient.get("statuses/show", {
      id: reply_tweet_id,
      id_str: reply_tweet_id,
      tweet_mode: "extended",
    });

    let original_tweet_id = reply_response.in_reply_to_status_id_str;
    let message = ``;
    for (let user of tweet.entities.user_mentions) {
      message = message.concat(`@${user.screen_name} `);
    }
    message = message.concat(
      `We would really appreciate it if you took the time to fill out a quick 1 min feedback form https://twittersourcebot-feedback.netlify.app/?tweet_id=${original_tweet_id} `
    );
    console.log("Test -> Alpha Test -> message", message);
    try {
      let output = await twitterClient.post("statuses/update", {
        status: message,
        in_reply_to_status_id: tweet.id_str,
        //attachment_url: attachment_url,
      });
    } catch (error) {
      console.log("Post Error", error);
    }
  } catch (error) {
    console.log("Could not find tweet", error);
  }
};

exports.createTest = async function (tweetId, idName, type) {
  // Stores information to create test case
  console.log(tweetId);
  let processedTweet = await tweetSchema.TweetSchema.findOne({
    tweetId: tweetId,
  }).sort({ cacheCreated: "ascending" });
  console.log(processedTweet);
  if (!processedTweet) {
    return "Error tweet has not been processed";
  } else {
    let body;
    let citation;
    if (!processedTweet.citation.body) {
      if (processedTweet.cited) {
        let response = await clusterHandler.getPage(
          processedTweet.citation.url
        );
        body = response.text;
      } else {
        body = "Not Found";
      }
      citation = processedTweet.citation;
      citation.body = body;
    } else {
      citation = processedTweet.citation;
    }

    let new_entry = new testerSchema.TesterSchema({
      id: idName,
      tweetId: tweetId,
      type: type,
      cited: processedTweet.cited,
      citation: citation,
      tweetContent: processedTweet.textContent,
      originalTweet: processedTweet.originalTweet,
    });
    try {
      let tweetEntry = await new_entry.save();
      return "Success";
    } catch (err) {
      return err;
    }
  }
};
