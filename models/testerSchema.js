const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var exports = (module.exports = {});

const TestSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  tweetId: {
    type: String,
    required: true,
  },

  citation: {
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
  },
  tweetContent: {
    type: String,
    required: true,
  },
  originalTweet: {},
});

exports.TweetSchema = mongoose.model("TestSchema", TestSchema);
