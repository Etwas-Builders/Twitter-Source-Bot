var exports = (module.exports = {});

const tweetSchema = require("../models/tweetSchema");
const testerSchema = require("../models/testerSchema");
const fs = require("fs");
const path = require("path");

let updateDatabase = async function (cachedParams) {
  let tweetId, tweetCreated, replyId, cited, citation, textContent, tweet;
  ({
    tweetId,
    tweetCreated,
    replyId,
    cited,
    citation,
    textContent,
    tweet,
  } = cachedParams);

  let new_entry = new tweetSchema.TweetSchema({
    tweetId: tweetId,
    tweetCreated: tweetCreated,
    replyId: replyId ? replyId : "-1",
    cited: cited,
    citation: {
      title: cited && citation.title ? citation.title : "Not Found",
      url: cited ? citation.url : "Not Found",
      body: cited ? citation.body : "Not Found",
    },
    score: cited ? citation.score : 0,
    textContent: textContent,
    originalTweet: tweet ? tweet : null,
  });

  let tweetEntry = await new_entry.save();

  //let existing_user = await models.User.findOne({email: email});
};

let checkDatabase = async function (tweetId) {
  let existingTweet = await tweetSchema.TweetSchema.findOne({
    tweetId: tweetId,
  }).sort({ cacheCreated: "ascending" });
  if (!existingTweet) {
    console.log("Tweet -> checkDatabase -> notCached");
    return null;
  } else {
    // console.log("Tweet -> checkDatabase -> existingTweet", existingTweet);
    if (
      existingTweet.cacheCreated > Date.now() - 2 * 24 * 60 * 60 * 1000 &&
      existingTweet.cited === true
    ) {
      // 48 hr window and is cited

      let topResult = existingTweet.citation;
      topResult.score = existingTweet.score;
      return topResult;
    } else {
      console.log("Tweet -> checkDatabase -> notCached");
      return null;
    }
  }
};
let isTweetHandled = async function (tweetId) {
  let existingTweet = await tweetSchema.TweetSchema.findOne({
    tweetId: tweetId,
  }).sort({ cacheCreated: "ascending" });
  if (!existingTweet) {
    existingTweet = await tweetSchema.TweetSchema.findOne({
      replyId: tweetId,
    }).sort({ cacheCreated: "ascending" });
  }
  return existingTweet ? true : false;
};

let createJestAutomatedTest = async function () {
  const responses = await testerSchema.TesterSchema.find();
  let filepath = path.join(__dirname, "../tests/nlp.spec/nlp.dbTestCases.json");
  try {
    fs.writeFileSync(filepath, JSON.stringify(responses));
  } catch (err) {
    console.error(err);
  }
};

try {
  createJestAutomatedTest();
  exports.updateTweetCache = updateDatabase;
  exports.isTweetHandled = isTweetHandled;
  exports.checkTweetCache = checkDatabase;
} catch (err) {
  console.log("Export Error", err);
}
