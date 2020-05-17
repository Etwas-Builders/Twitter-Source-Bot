// Exports
var exports = (module.exports = {});

// Modules
const nlp = require("./nlp");
const citation = require("./citation");
const processing = require("./processing/processing");
const scrapper = require("./processing/scraper");
const tester = require("./tester");
const notFound = require("./notFound/notFound");
const database = require("./database");
const replyHandler = require("./reply");
// Models

//const imageResponse = require("./imageResponse/test.png");
// Imports
const TwitterApi = require("twitter-lite");
const axios = require("axios");
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

let sourceNotFound = async function (cachedParams, username) {
  cachedParams.cited = false;
  cachedParams.citation = null;
  await database.updateTweetCache(cachedParams);

  return await notFound.sourceNotFound(username);
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

let handleNewTweet = async function (newTweet, replyId) {
  let tweetId = newTweet.id_str;
  let cachedContent = await database.checkTweetCache(tweetId);
  let username = newTweet.user.screen_name;
  let name = newTweet.user.name;
  if (cachedContent) {
    let message = cachedContent;
    message = `@${username} ${message}`;
    return {
      message: message,
    };
  }
  let content = newTweet.full_text;

  if (!content) {
    content = newTweet.text;
  }
  console.log("Tweet -> handleNewTweet -> content", content);
  let time = newTweet.created_at;
  let tweetUserID = newTweet.user.id_str;
  let userScreenName = newTweet.user.name;
  let cachedParams = {};
  cachedParams.tweetId = tweetId;
  cachedParams.tweetCreated = time;
  cachedParams.replyId = replyId;
  cachedParams.textContent = content;
  cachedParams.tweet = newTweet;

  axios.post(process.env.DISCORD_WEBHOOK_URL, {
    content: `New Requested Citation from ${userScreenName}.\n Tweet Body :\n ${content}`,
    username: "Who Said This Bot",
    avatar_url:
      "https://pbs.twimg.com/profile_images/1255489352714592256/kICVOCy-_400x400.png",
  });

  // Check Cache with Hash

  let wordsToSearch = await nlp.wordsToSearch(content);
  console.log("Tweet -> handleNewTweet -> wordsToSearch", wordsToSearch);

  let results = await citation.getSearchResults(wordsToSearch);

  if (results.length === 0) {
    return sourceNotFound(cachedParams, username);
  }

  console.log("Tweet -> handleNewTweet -> results", results);

  let processedOutput = await processing.getTopResult(
    results,
    username,
    name,
    wordsToSearch,
    tweetId
  );

  console.log("Tweet -> handleNewTweet -> processedOutput", processedOutput);
  let topResult = processedOutput.topResult;

  if (!topResult) {
    return sourceNotFound(cachedParams, username);
  }

  await scrapper.closeCluster(processedOutput.cluster);
  console.log("Tweet -> handleNewTweet -> topResult.score", topResult.score);

  cachedParams.cited = true;
  cachedParams.citation = {};
  cachedParams.citation.title = topResult.title;
  cachedParams.citation.url = topResult.url;
  cachedParams.citation.score = topResult.score;

  await database.updateTweetCache(cachedParams);

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
      let citationResponse = await handleNewTweet(
        originalTweet_response,
        replyId
      );

      let message = citationResponse.message;
      message = `@${replyUserScreenName} ${message}`;
      let attachment_url = citationResponse.url;
      console.log(message);
      await replyHandler.handleReply(
        citationResponse.mediaId,
        message,
        replyId
      );
    }
  } catch (e) {
    console.log(e);
  }
};

exports.handleNewMentionEvent = async function (event) {
  console.log("Tweet -> handleNewMentionEvent -> event", event);

  let mention = event.tweet_create_events[0];
  let mentionId = mention.id_str;
  let citationResponse = await handleNewTweet(mention, null);
  let message = citationResponse.message;
  let isTestTweet = false;

  if (mention.user.id_str === "1258133916268953601") {
    if (
      mention.text.includes(
        "J.C. Penney is negotiating a bankruptcy deal that would slash the department-store chain’s debt in exchange for control of the company"
      )
    ) {
      // Test Tweet from Salegot
      isTestTweet = true;
      await tester.checkServerActive(mention.text, message);
      return;
    }
  }
  if (!isTestTweet) {
    await replyHandler.handleReply(citation.mediaId, message, mentionId);
  }
};

exports.handleNewQuoteEvent = async function (event) {
  console.log("Tweet -> handleNewQuoteEvent -> event", event);

  let quote = event.tweet_create_events[0];
  let quoteId = quote.id_str;
  let quoteUserScreenName = quote.user.screen_name;
  let original_tweet = quote.quoted_status;
  let citationResponse = await handleNewTweet(original_tweet, quoteId);
  let message = citationResponse.message;
  message = `@${quoteUserScreenName} ${message}`;

  await replyHandler.handleReply(citationResponse.mediaId, message, quoteId);
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
  let original_tweet = thread[0];
  let username = original_tweet.user.screen_name;
  let name = original_tweet.user.name;
  let cachedContent = await database.checkTweetCache(original_tweet.id_str);
  if (cachedContent) {
    let message = cachedContent;
    let username = original_tweet.user.screen_name;
    message = `@${username} ${message}`;
    message = `@${reply.screen_name} ${message}`;
    await replyHandler.handleReply(null, message, reply.id);
  } else {
    thread = await threadRecursive(original_tweet, thread);
    let fullContent = "";
    for (let tweet of thread) {
      console.log("Tweet -> handleTweetThread -> tweet of thread", tweet);
      let content = tweet.full_text ? tweet.full_text : tweet.text;
      fullContent = `${content} ${fullContent} `; // Add delimiter later
    }

    console.log("Tweet -> handleTweetThread -> fullContent", fullContent);

    let cachedParams = {};
    cachedParams.tweetId = original_tweet.id_str;
    cachedParams.tweetCreated = original_tweet.created_at;
    cachedParams.replyId = reply.id;
    cachedParams.textContent = fullContent;
    cachedParams.tweet = original_tweet;

    axios.post(process.env.DISCORD_WEBHOOK_URL, {
      content: `New Requested Citation from ${username}.\n Tweet Body :\n ${fullContent}`,
      username: "Who Said This Bot",
      avatar_url:
        "https://pbs.twimg.com/profile_images/1255489352714592256/kICVOCy-_400x400.png",
    });

    let keywords = await nlp.handleThread(fullContent);

    console.log("Tweet -> handleTweetThread -> keywords", keywords);

    let results = await citation.getSearchResults(keywords);

    console.log("Tweet -> handleTweetThread -> results", results);

    if (results.length === 0) {
      let citationResponse = await sourceNotFound(cachedParams, username);
      message = `${reply.screen_name} ${citationResponse.message}`;

      await replyHandler.handleReply(
        citationResponse.mediaId,
        message,
        reply.id
      );
    } else {
      let processedOutput = await processing.getTopResult(
        results,
        username,
        name,
        keywords,
        original_tweet.id_str
      );
      let topResult = processedOutput.topResult;

      if (!topResult) {
        let citationResponse = sourceNotFound(cachedParams, username);
        message = `${reply.screen_name} ${citationResponse.message}`;

        await replyHandler.handleReply(
          citationResponse.mediaId,
          message,
          reply.id
        );
      }

      cachedParams.cited = true;
      cachedParams.citation = {};
      cachedParams.citation.title = topResult.title;
      cachedParams.citation.url = topResult.url;
      cachedParams.citation.score = topResult.score;

      await scrapper.closeCluster(processedOutput.cluster);
      console.log(
        "Tweet -> handleTweetThread -> topResult.score",
        topResult.score
      );

      await database.updateTweetCache(cachedParams);

      let message = `@${username} Our top result for this tweet is : ${topResult.title} with score of ${topResult.score}  ${topResult.url} `;
      message = `@${reply.screen_name} ${message}`;
      await replyHandler.handleReply(null, message, reply.id); // Cited
    }
  }
};

let getMentionTimeline = async function () {
  const mentions = await twitterClient.get("statuses/mentions_timeline");
  for (let tweet of mentions) {
    let tweetId = tweet.id_str;
    let handled = await database.isTweetHandled(tweetId);
    if (!handled) {
      console.info("Tweet -> getMentionTimeline -> unhandledTweet", tweet);
      await handleNewTweet(tweet);
    }
  }
};

exports.getMentionTimeline = getMentionTimeline;
