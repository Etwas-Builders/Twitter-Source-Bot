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

let messageTruncate = function (username, title, score, url) {
  score = (Math.log(16 * score) / 5.55) * 100; // Arbitrary Function that gives a percentage value from score

  let message = `@${username} Our top result for this tweet is : ${title} with confidence of ${score.toFixed(
    2
  )}%  ${url} `;
  if (message.length > 220) {
    //console.log(username.length, url.length);
    let titleLength = 195 - username.length - 3 - url.length - 3;
    //console.log(title, titleLength);
    title = title.slice(0, titleLength) + "...";
    message = `@${username} Our top result for this tweet is : ${title} with confidence of ${score.toFixed(
      2
    )}%  ${url} `;
  }
  return message;
};

let notPassiveMention = async function (tweet) {
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

let handleNewTweet = async function (newTweet, replyId, fromMentionTime) {
  let tweetId = newTweet.id_str;
  let userId = newTweet.user.id_str;
  if (userId === "1255487054219218944") {
    return null;
  }
  let cachedContent = await database.checkTweetCache(tweetId);
  let username = newTweet.user.screen_name;
  let name = newTweet.user.name;
  if (cachedContent) {
    if (fromMentionTime) {
      return null;
    }
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
  if (newTweet.quoted_status_id) {
    let quoteContent = newTweet.quoted_status.text;
    if (!quoteContent) {
      quoteContent = newTweet.quoted_status.full_text;
    }
    content = `${content} ${quoteContent}`;
  }
  for (let user of newTweet.entities.user_mentions) {
    content = content.replace(`@${user.screen_name}`, user.name);
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

  let results = await citation.getSearchResults(wordsToSearch, userScreenName);

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

  //console.log("Tweet -> handleNewTweet -> processedOutput", processedOutput);
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
  cachedParams.citation.body = topResult.body;

  await database.updateTweetCache(cachedParams);
  let message = messageTruncate(
    username,
    topResult.title,
    topResult.score,
    topResult.url
  );
  // let message = `@${username} Our top result for this tweet is : ${topResult.title} with score of ${topResult.score}  ${topResult.url} `;

  return {
    message: message,
    url: topResult.url,
  };
};

let handleNewReplyEvent = async function (tweet, fromMentionTime) {
  let reply = tweet;
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
        thread,
        fromMentionTime
      );
    } else if (originalTweet_response.quoted_status) {
      handleNewQuoteEvent(
        originalTweet_response,
        false,
        replyUserScreenName,
        replyId
      );
    } else {
      let citationResponse = await handleNewTweet(
        originalTweet_response,
        replyId,
        fromMentionTime
      );
      if (citationResponse) {
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
    }
  } catch (e) {
    console.log(e);
  }
};

let handleNewMentionEvent = async function (tweet, fromMentionTime) {
  console.log("Tweet -> handleNewMentionEvent -> event", tweet);

  let mention = tweet;
  let mentionId = mention.id_str;
  let citationResponse = await handleNewTweet(mention, null, fromMentionTime);
  if (citationResponse) {
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
  }
};

let handleNewQuoteEvent = async function (
  tweet,
  fromMentionTime,
  replier,
  reply_id
) {
  console.log("Tweet -> handleNewQuoteEvent -> event", tweet);

  let quote = tweet;
  let quoteId = quote.id_str;
  let quoteUserScreenName = quote.user.screen_name;
  let original_tweet = quote.quoted_status;
  let citationResponse = await handleNewTweet(quote, quoteId, fromMentionTime);
  if (citationResponse) {
    let message = citationResponse.message;
    message = `@${quoteUserScreenName} ${message}`;
    if (!replier) {
      await replyHandler.handleReply(
        citationResponse.mediaId,
        message,
        quoteId
      );
    } else {
      message = `@${replier} ${message}`;
      await replyHandler.handleReply(
        citationResponse.mediaId,
        message,
        reply_id
      );
    }
  }
};

let threadRecursive = async function (tweet, thread) {
  // Base Case
  if (!tweet.in_reply_to_status_id) {
    // This tweet is not in reply to any other tweet
    return thread;
  }
  if (tweet.in_reply_to_status_id_str === "1255487054219218944") {
    // if bot is ping in a thread where it already made a citation it won't continue above that
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
    return thread;
  }
};

let handleTweetThread = async function (reply, thread, fromMentionTime) {
  /*
    A thread is a series of replies
  */
  let original_tweet = thread[0];
  if (original_tweet.user.id_str === "1255487054219218944") {
    return;
  } else {
    let username = original_tweet.user.screen_name;
    let name = original_tweet.user.name;
    let cachedContent = await database.checkTweetCache(original_tweet.id_str);
    let message;
    if (cachedContent) {
      if (!fromMentionTime) {
        message = cachedContent;
        let username = original_tweet.user.screen_name;
        message = `@${username} ${message}`;
        message = `@${reply.screen_name} ${message}`;
        await replyHandler.handleReply(null, message, reply.id);
      }
    } else {
      thread = await threadRecursive(original_tweet, thread);
      let fullContent = "";
      for (let tweet of thread) {
        console.log("Tweet -> handleTweetThread -> tweet of thread", tweet);
        let content = tweet.full_text ? tweet.full_text : tweet.text;
        for (let user of tweet.entities.user_mentions) {
          if (user.screen_name !== "@whosaidthis_bot") {
            content = content.replace(user.screen_name, user.name);
          }
        }
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

      let results = await citation.getSearchResults(keywords, name);

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
          let citationResponse = await sourceNotFound(cachedParams, username);
          console.error(citationResponse);
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
        cachedParams.citation.body = topResult.body;

        await scrapper.closeCluster(processedOutput.cluster);
        console.log(
          "Tweet -> handleTweetThread -> topResult.score",
          topResult.score
        );

        await database.updateTweetCache(cachedParams);

        let message = messageTruncate(
          username,
          topResult.title,
          topResult.score,
          topResult.url
        );

        message = `@${reply.screen_name} ${message}`;

        await replyHandler.handleReply(null, message, reply.id); // Cited
      }
    }
  }
};
let tweetClassify = async function (tweet, fromMentionTime) {
  console.log("Tweet -> NewClassifier");
  // If it is not our own tweet
  if (!(tweet.user.id_str === "1255487054219218944")) {
    // Ensure it is not replying to us
    if (notPassiveMention(tweet) && !("retweeted_status" in tweet)) {
      if (tweet.in_reply_to_status_id) {
        // This event is a reply
        handleNewReplyEvent(tweet, fromMentionTime);
      } else if (tweet.quoted_status_id) {
        // Quote Tweet
        handleNewQuoteEvent(tweet, fromMentionTime, null, null);
      } else {
        // Not a Reply or Not Quote
        // Not Handling Mentions Anymore
        // let tweetEntities = tweet.entities;
        // let user_mentions = tweetEntities.user_mentions;
        // for (let user of user_mentions) {
        //   console.log("handleNewWebHook -> user", user);
        //   if (user.id_str === "1255487054219218944") {
        //     // Mention Behaviour
        //     handleNewMentionEvent(tweet, fromMentionTime);
        //   }
        // }

        let tweetId = tweet.id_str;
        let username = tweet.user.screen_name;
        cachedParams.tweetId = tweetId;
        cachedParams.tweetCreated = tweet.created_at;
        cachedParams.replyId = null;
        cachedParams.textContent = tweet.text;
        cachedParams.tweet = tweet;
        cachedParams.cited = false;
        cachedParams.citation = null;
        await database.updateTweetCache(cachedParams);
        await replyHandler.notSupported(tweetId, username);
      }
    }
  }
};

let getMentionTimeline = async function () {
  const mentions = await twitterClient.get("statuses/mentions_timeline");
  for (let tweet of mentions) {
    let tweetId = tweet.id_str;
    let handled = await database.isTweetHandled(tweetId);
    let fromMentionTime = true;
    console.info("Tweet Status", tweetId, handled);
    if (!handled) {
      console.info("Tweet -> getMentionTimeline -> unhandledTweet", tweet.text);
      await tweetClassify(tweet, fromMentionTime);
    }
  }
};
exports.tweetClassify = tweetClassify;
exports.getMentionTimeline = getMentionTimeline;
