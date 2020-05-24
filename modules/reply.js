const TwitterApi = require("twitter-lite");
const axios = require("axios");
const xkcdImages = require("./notFound/imageResponse/xkcd.json");
const fs = require("fs");

// Constants
const twitterClient = new TwitterApi({
  subdomain: "api",
  version: "1.1",
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

const uploadClient = new TwitterApi({
  subdomain: "upload",
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
    if (err[0].code !== 187) {
      axios.post(process.env.DISCORD_WEBHOOK_URL, {
        content: `@here Error, Reply -> sendReply -> error\n Message : ${message} \n ${JSON.stringify(
          err
        )}`,
        username: "Who Said This Bot",
        avatar_url:
          "https://pbs.twimg.com/profile_images/1255489352714592256/kICVOCy-_400x400.png",
      });
    }
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
    axios.post(process.env.DISCORD_WEBHOOK_URL, {
      content: `@here Error, Reply -> sendReplyWithImage -> error\n${err}`,
      username: "Who Said This Bot",
      avatar_url:
        "https://pbs.twimg.com/profile_images/1255489352714592256/kICVOCy-_400x400.png",
    });
  }
};

let notSupported = async function (tweet_id, username) {
  let message = `@${username} We are sorry but this interaction is not supported, but here is a meme for your troubles`;
  let cycle = Math.floor(Math.random() * 14) + 1;
  console.log("Meme Number", cycle);
  let xkcdSource = "";
  let filename;
  if (cycle in xkcdImages) {
    filename = `modules/notFound/imageResponse/${xkcdImages[cycle].path}.png`;
    xkcdSource = `
    Source : ${xkcdImages[cycle].url}`;
  } else {
    filename = `modules/notFound/imageResponse/image${cycle}.png`;
  }
  let params = {
    encoding: "base64",
  };
  let b64content = fs.readFileSync(filename, params);
  try {
    let response = await uploadClient.post("media/upload", {
      media: b64content,
    });

    let mediaId = response.media_id_string;
    let output = await twitterClient.post("statuses/update", {
      status: message,
      in_reply_to_status_id: tweet_id,
      media_ids: mediaId,
    });
  } catch (err) {
    axios.post(process.env.DISCORD_WEBHOOK_URL, {
      content: `@here Error, Reply -> notSupported -> error\n${err}`,
      username: "Who Said This Bot",
      avatar_url:
        "https://pbs.twimg.com/profile_images/1255489352714592256/kICVOCy-_400x400.png",
    });
  }
};

exports.notSupported = notSupported;

exports.handleReply = async function (mediaId, message, tweetId) {
  if (mediaId) {
    await sendReplyWithImage(message, tweetId, mediaId);
  } else {
    await sendReply(message, tweetId);
  }
};
