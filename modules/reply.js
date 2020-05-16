const TwitterApi = require("twitter-lite");
const axios = require("axios");

// Constants
const twitterClient = new TwitterApi({
  subdomain: "api",
  version: "1.1",
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

var exports = (module.exports = {});

let sendReply = async function (message, tweet_id) {
  try {
    axios.post(process.env.DISCORD_WEBHOOK_URL, {
      content: `${message}`,
      username: "Who Said This Bot",
      avatar_url:
        "https://pbs.twimg.com/profile_images/1255489352714592256/kICVOCy-_400x400.png",
    });

    let output = await twitterClient.post("statuses/update", {
      status: message,
      in_reply_to_status_id: tweet_id,
    });
  } catch (err) {
    console.log("Tweet -> sendReply -> Post Error", err);
  }
};

let sendReplyWithImage = async function (message, tweet_id, media_id) {
  try {
    axios.post(process.env.DISCORD_WEBHOOK_URL, {
      content: `${message}`,
      username: "Who Said This Bot",
      avatar_url:
        "https://pbs.twimg.com/profile_images/1255489352714592256/kICVOCy-_400x400.png",
    });

    let output = await twitterClient.post("statuses/update", {
      status: message,
      in_reply_to_status_id: tweet_id,
      media_ids: media_id,
    });
  } catch (err) {
    console.log("Tweet -> sendReply -> Post Error", err);
  }
};

exports.handleReply = async function (mediaId, message, tweetId) {
  if (mediaId) {
    await sendReplyWithImage(message, tweetId, mediaId);
  } else {
    await sendReply(message, tweetId);
  }
};
