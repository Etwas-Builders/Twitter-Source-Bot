var exports = (module.exports = {});

const fs = require("fs");
const TwitterApi = require("twitter-lite");

const notText = require("./notFoundText.json");
const xkcdImages = require("./imageResponse/xkcd.json");

const uploadClient = new TwitterApi({
  subdomain: "upload",
  version: "1.1",
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

exports.sourceNotFound = async function (username) {
  console.log("Not Found");
  let text = notText.text;

  let cycle = Math.floor(Math.random() * 14) + 1;
  let textCycle = Math.floor(Math.random() * text.length) + 0;
  console.log("Meme Number", cycle, textCycle);
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
  let message = text[textCycle];
  try {
    let response = await uploadClient.post("media/upload", {
      media: b64content,
    });
    console.log("Tweet -> sourceNotFound -> response", response);
    let mediaId = response.media_id_string;
    return {
      message: `@${username} ${message} ${xkcdSource}`,
      mediaId: mediaId,
    };
  } catch (err) {
    axios.post(process.env.DISCORD_WEBHOOK_URL, {
      content: `@here Error, notFound -> sourceNotFound -> upload error imageNumber ${cycle} \n ${err}`,
      username: "Who Said This Bot",
      avatar_url:
        "https://pbs.twimg.com/profile_images/1255489352714592256/kICVOCy-_400x400.png",
    });
  }
};
