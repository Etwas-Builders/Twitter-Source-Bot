// Exports
var exports = (module.exports = {});

// Modules
const nlp = require("./nlp");
const citation = require("./citation");
const processing = require("./processing/processing");
const scrapper = require("./processing/scrapper");
const tester = require("./test");
const fs = require("fs");
// Models
const tweetSchema = require("../models/tweetSchema");

//const imageResponse = require("./imageResponse/test.png");
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
const uploadClient = new TwitterApi({
  subdomain: "upload",
  version: "1.1",
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});
// Modules

let sourceNotFound = async function (cachedParams, username) {
  cachedParams.cited = false;
  cachedParams.citation = null;
  await updateDatabase(cachedParams);

  console.log("Not Found");
  let imageResponse = "test";

  let cycle = Math.floor(Math.random() * 3) + 1;
  //const filename = "modules/imageResponse/test.png";
  let filePath = `modules/imageResponse/image${cycle}.png`;
  var params = {
    encoding: "base64",
  };
  var b64content = fs.readFileSync(filename, params);
  try {
    let response = await uploadClient.post("media/upload", {
      media: b64content,
    });
    console.log("Tweet -> sourceNotFound -> response", response);
    let mediaId = response.media_id_string;
    return {
      message: `@${username} Hey we couldn't find a valid citation for this right now. In the future, I might have the required intelligence to find the valid source follow @whosaidthis_bot for updates`,
      mediaId: mediaId,
    };
  } catch (err) {
    console.log(err);
  }
  //return {
  //message: `@${username} Hey we couldn't find a valid citation for this right now. In the future, I might have the required intelligence to find the valid source follow @whosaidthis_bot for updates`,
  //};
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
      title: cited ? citation.title : "Not Found",
      url: cited ? citation.url : "Not Found",
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
    return null;
  } else {
    console.log("Tweet -> checkDatabase -> existingTweet", existingTweet);
    if (
      // existingTweet.cacheCreated < Date.now() - 2 * 24 * 60 * 60 * 1000 &&
      existingTweet.cited === true
    ) {
      // 48 hr window and is cited

      let topResult = existingTweet.citation;
      return `Our top result for this tweet is : ${topResult.title} with score of ${existingTweet.score}  ${topResult.url}`;
    } else {
      return null;
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
    console.log("Tweet -> sendReply -> Post Error", err);
  }
};

let handleNewTweet = async function (newTweet, replyId) {
  let tweetId = newTweet.id_str;
  let cachedContent = await checkDatabase(tweetId);
  let username = newTweet.user.screen_name;
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

  let results = await getSearchResults(wordsToSearch);

  if (results.length === 0) {
    return sourceNotFound(cachedParams, username);
  }

  console.log("Tweet -> handleNewTweet -> results", results);

  let processedOutput = await processing.getTopResult(
    results,
    username,
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

  await updateDatabase(cachedParams);

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
      if (citationResponse.mediaId) {
        await sendReplyWithImage(message, replyId, citationResponse.mediaId);
      } else {
        await sendReply(message, replyId);
      }
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
    if (citationResponse.mediaId) {
      await sendReplyWithImage(message, mentionId, citationResponse.mediaId);
    } else {
      await sendReply(message, mentionId);
    }
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
  if (citationResponse.mediaId) {
    await sendReplyWithImage(message, mentionId, quoteId);
  } else {
    await sendReply(message, quoteId);
  }

  //await sendReply(message, quoteId);
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
  let cachedContent = await checkDatabase(original_tweet.id_str);
  if (cachedContent) {
    let message = cachedContent;
    let username = original_tweet.user.screen_name;
    message = `@${username} ${message}`;
    message = `@${reply.screen_name} ${message}`;
    await sendReply(message, reply.id);
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

    let results = await getSearchResults(keywords);

    console.log("Tweet -> handleTweetThread -> results", results);

    if (results.length === 0) {
      let citationResponse = await sourceNotFound(cachedParams, username);
      message = `${reply.screen_name} ${citationResponse.message}`;

      await sendReplyWithImage(message, reply.id, citationResponse.mediaId);
    } else {
      let processedOutput = await processing.getTopResult(
        results,
        username,
        keywords,
        original_tweet.id_str
      );
      let topResult = processedOutput.topResult;

      if (!topResult) {
        let citationResponse = sourceNotFound(cachedParams, username);
        message = `${reply.screen_name} ${citationResponse.message}`;

        await sendReplyWithImage(message, reply.id, citationResponse.mediaId);
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

      await updateDatabase(cachedParams);

      let message = `@${username} Our top result for this tweet is : ${topResult.title} with score of ${topResult.score}  ${topResult.url} `;
      message = `@${reply.screen_name} ${message}`;
      await sendReply(message, reply.id);
    }
  }
};
