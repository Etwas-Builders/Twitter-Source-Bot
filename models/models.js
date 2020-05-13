const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var exports = (module.exports = {});

const TweetSchema = new Schema({
  tweetId: {
    type: String,
    required: true,
  },
  cacheCreated: {
    type: Date,
    default: Date.now(),
  },
  tweetCreated: {
    type: String,
    required: true,
  },
  replyId: {
    type: String,
    default: "-1",
  },
  cited: {
    type: Boolean,
    default: false,
  },
  citation: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  textContent: {
    type: String,
    required: true,
  },
  originalTweet: {},
  repliedTweet: {},
  nlpOutput: {
    type: String,
  },
});

exports.TweetSchema = mongoose.model("TweetSchema", TweetSchema);
