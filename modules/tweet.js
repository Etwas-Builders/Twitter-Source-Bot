// Exports
var exports = (module.exports = {});

// Modules
const nlp = require("./nlp");
const citation = require("./citation");
const processing = require("./processing/processing");
const scrapper = require("./processing/scrapper");

// Imports
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

let sourceNotFound = async function (username) {
  return {
    message: `@${username} Hey we couldn't find a valid citation for this right now. In the future, I might have the required intelligence to find the valid source follow @whosaidthis_bot for updates`,
  };
};

let getSearchResults = async function (keywords) {
  let query = keywords.map((e) => e.word).join(" ");
  query += ` "news"`;
  console.log("Tweet -> getSearchResults -> query", query);
  let results = await citation.googleSearch(query);
  results = results.splice(0, 10);
  query = keywords.map((e) => e.word).join(" ");
  console.log("Tweet -> getSearchResults -> newQuery", query);
  let newResults = await citation.googleSearch(query);
  if (newResults) {
    newResults = newResults.splice(0, 10);
    results.push(...newResults);
  }

  return results;
};

exports.notPassiveMention = async function (tweet) {
  /* 
    A passive mention has a reply_id, and replies to us

  */

  if (tweet.in_reply_to_status_id) {
    if (tweet.in_reply_to_user_id_str === "1255487054219218944") {
      return false;
    }
  }
  return true;
};

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

let handleNewTweet = async function (newTweet) {
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

  axios.post(process.env.DISCORD_WEBHOOK_URL, {
    content: `New Requested Citation from ${userScreenName}.\n Tweet Body :\n ${content}`,
    username: "Who Said This Bot",
    avatar_url:
      "https://pbs.twimg.com/profile_images/1255489352714592256/kICVOCy-_400x400.png",
  });

  // Check Cache with Hash

  let wordsToSearch = await nlp.wordsToSearch(content);
  console.log("Tweet -> handleNewTweet -> wordsToSearch", wordsToSearch);

  let results = await getSearchResults(wordsToSearch);

  if (results.length === 0) {
    return sourceNotFound(username);
  }

  console.log("Tweet -> handleNewTweet -> results", results);

  let processedOutput = await processing.getTopResult(
    results,
    username,
    wordsToSearch
  );

  console.log("Tweet -> handleNewTweet -> processedOutput", processedOutput);
  let topResult = processedOutput.topResult;

  if (!topResult) {
    return sourceNotFound(username);
  }

  await scrapper.closeCluster(processedOutput.cluster);
  console.log("Tweet -> handleNewTweet -> topResult.score", topResult.score);

  let message = `@${username} Our top result for this tweet is : ${topResult.title} with score of ${topResult.score}  ${topResult.url} `;

  return {
    message: message,
    url: topResult.url,
  };
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
    if (originalTweet_response.in_reply_to_status_id) {
      // This is a thread
      let thread = [];
      thread.push(originalTweet_response);
      handleTweetThread(
        { id: replyId, screen_name: replyUserScreenName },
        thread
      );
    } else {
      let citationResponse = await handleNewTweet(originalTweet_response);
      let message = citationResponse.message;
      message = `@${replyUserScreenName} ${message}`;
      let attachment_url = citationResponse.url;
      console.log(message);
      await sendReply(message, replyId);
    }
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

exports.handleNewQuoteEvent = async function (event) {
  console.log("Tweet -> handleNewQuoteEvent -> event", event);

  let quote = event.tweet_create_events[0];
  let quoteId = quote.id_str;
  let quoteUserScreenName = quote.user.screen_name;
  let original_tweet = quote.quoted_status;
  let citationResponse = await handleNewTweet(original_tweet);
  let message = citationResponse.message;
  message = `@${quoteUserScreenName} ${message}`;
  await sendReply(message, quoteId);
};

let threadRecursive = async function (tweet, thread) {
  // Base Case
  if (!tweet.in_reply_to_status_id) {
    // This tweet is not in reply to any other tweet
    return thread;
  }

  let parentTweetId = tweet.in_reply_to_status_id_str;
  try {
    let parentTweet = await twitterClient.get("statuses/show", {
      id: parentTweetId,
      id_str: parentTweetId,
      tweet_mode: "extended",
    });
    thread.push(parentTweet);
    return await threadRecursive(parentTweet, thread);
  } catch (err) {
    console.log("Could not find parent tweet", err);
  }
};

let handleTweetThread = async function (reply, thread) {
  /*
    A thread is a series of replies
  */
  //console.log("Tweet -> handleTweetThread -> reply , thread", reply, thread);
  let original_tweet = thread[0];
  let username = original_tweet.user.screen_name;
  thread = await threadRecursive(original_tweet, thread);
  let fullContent = "";
  for (let tweet of thread) {
    console.log("Tweet -> handleTweetThread -> tweet of thread", tweet);
    let content = tweet.full_text ? tweet.full_text : tweet.text;
    fullContent += `${content} `; // Add delimiter later
  }

  console.log("Tweet -> handleTweetThread -> fullContent", fullContent);

  axios.post(process.env.DISCORD_WEBHOOK_URL, {
    content: `New Requested Citation from ${username}.\n Tweet Body :\n ${fullContent}`,
    username: "Who Said This Bot",
    avatar_url:
      "https://pbs.twimg.com/profile_images/1255489352714592256/kICVOCy-_400x400.png",
  });

  let keywords = await nlp.handleThread(fullContent);

  console.log("Tweet -> handleTweetThread -> keywords", keywords);

  let results = await getSearchResults(keywords);

  console.log("Tweet -> handleTweetThread -> results", results);

  if (results.length === 0) {
    let message = await sourceNotFound(username);
    message = `${reply.screen_name} ${message}`;
    await sendReply(message, reply.id);
  } else {
    let processedOutput = await processing.getTopResult(
      results,
      username,
      keywords
    );
    let topResult = processedOutput.topResult;

    if (!topResult) {
      return sourceNotFound(username);
    }

    await scrapper.closeCluster(processedOutput.cluster);
    console.log(
      "Tweet -> handleTweetThread -> topResult.score",
      topResult.score
    );
    let message = `@${username} Our top result for this tweet is : ${topResult.title} with score of ${topResult.score}  ${topResult.url} `;
    message = `@${reply.screen_name} ${message}`;
    await sendReply(message, reply.id);
  }
};
