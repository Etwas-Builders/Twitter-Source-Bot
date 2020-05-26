var exports = (module.exports = {});

const scrapper = require("./scraper");
const nlp = require("../nlp");
const any = require("promise.any");

const whitelist = require("./whitelist.json");
const blacklist = require("./blacklist.json");
/*
  BLACKLIST SCHEMA

  "hostName" : score

  Score categories 

  Custom BAN : -1, Example Youtube.com, Facebook.com

  List of sources https://docs.google.com/document/d/10eA5-mCZLSS4MQY5QGb5ewC3VAL6pLkT53V_81ZyitM/preview

  Score based on classification 

  Satire : -0.25
  Unknown : -0.5
  Unreliable : -0.75
  Everything Else : -1, Straight Ban


*/

let urlSorting = function (results, username) {
  for (let result of results) {
    if (
      !(
        (result.url.includes(username) && result.url.includes("twitter")) ||
        result.url.includes("youtube") ||
        result.url.includes("facebook")
      )
    ) {
      // Check Language
      let pathArray = result.url.split("/");
      let protocol = pathArray[0]; // HTTPS or HTTP
      result.score = 0; // Initialization
      //console.info(protocol);
      if (protocol === "http:") {
        result.score -= 0.5;
      }
      let host = pathArray[2];
      if (host.includes("www")) {
        host = host.slice(4);
      }
      let endpoint = pathArray.slice(3);
      endpoint = endpoint.join("/");

      if (
        endpoint.includes("live") ||
        endpoint.includes("latest") ||
        endpoint === ""
      ) {
        result.score -= 1;
      }

      //console.log("Processing -> getTopResult -> url", host);
      if (host in blacklist) {
        result.score = blacklist[host] === -1 ? -1 : blacklist[host] * 10;
        console.log("Found blacklisted score", host);
      }
      //console.log("Processing -> getTopResult -> url", host);
      if (host in whitelist) {
        result.score += 1;
        console.log("Found whitelisted source", host);
      } else {
        result.score += 0;
      }
    } else {
      result.score = -1;
    }
  }
  //console.log("Processing -> getTopResult -> scoreResults", results);
  let cleanedResults = [];

  for (let result of results) {
    if (result.score !== -1) {
      //result.score *= 10; // Score Multiplier
      cleanedResults.push(result);
    }
  }

  results = cleanedResults;
  results.sort((a, b) => b.score - a.score); // Sort by score
  return results;
};

let timeDif = function (time, url) {
  if (time !== "Not Found") {
    try {
      let sourceTime = new Date(time).getTime();
      let currentTime = new Date().getTime();
      let timeDifference = sourceTime - currentTime; // IN Ms

      timeDifference = Math.floor(timeDifference / 1000 / 60 / (60 * 24)); // In Days
      console.log(`TIME DIFFERENCE  ${timeDifference} for url ${url} `);
      if (timeDifference < 30) {
        // In the last month
        return 0.1;
      } else {
        let negativeScore = -Math.log(Math.abs(timeDifference - 24)) / 15;
        console.error(negativeScore);
        negativeScore = Math.max(-0.5, negativeScore);
        if (negativeScore) {
          return negativeScore;
        }
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    return 0.0;
  }
};

let mentionEscaping = function (title) {
  if (title && title.includes("@")) {
    // Handle Escaping
    return title.replace("@", "@ ");
    // Issue #17 Temporary Fix https://github.com/Mozilla-Open-Lab-Etwas/Twitter-Source-Bot/issues/17
  }
  return title;
};

let scrapePromiseHandling = function (
  scrapePromise,
  keywords,
  tweetId,
  userScreenName
) {
  //return
};

exports.getTopResult = async function (
  results,
  username,
  userScreenName,
  keywords,
  tweetId
) {
  console.log(results.length);

  results = urlSorting(results, username);

  console.log("Processing -> getTopResult -> sortedResults", results);

  let cluster = await scrapper.createCluster();

  let [scrapePromises, nlpPromises] = [[], []];
  let closeResults = [];

  for (let result of results) {
    let scrapePromise = scrapper.newUrl(cluster, result.url);
    let nlpPromise = scrapePromise
      .then(async (data) => {
        console.log(
          `Processing -> getTopResult -> Promise Resolution for ${result.url} with title ${data.title}`
        );
        result["title"] = data.title;

        let score = await nlp.scorePage(
          result,
          data,
          keywords,
          tweetId,
          userScreenName
        );

        result.score += score;

        result.score += timeDif(data.time, result.url);

        console.log(
          `Processing -> getTopResult -> finalScore`,
          result.score,
          result.url
        );

        // Set Threshold
        result.title = mentionEscaping(result.title);
        result.body = data.text;

        // Set Threshold
        result.title = mentionEscaping(result.title);
        result.body = data.text;
        if (result.score > 3.2) {
          return { topResult: result, cluster: cluster };
        } else if (result.score > 2.9) {
          closeResults.push(result);
          return Promise.reject(`Close but not good enough`);
        } else {
          console.error(`Invalid Score for ${result.url} of ${result.score} `);
          return Promise.reject(`Not valid score ${result.score}`);
        }
      })
      .catch((err) => {
        //console.info("Failed to read url", result.url, err);
        return Promise.reject("Failed to read page");
      });
    nlpPromises.push(nlpPromise);
  }
  console.log("NLP Promises Length", nlpPromises.length);
  return any(nlpPromises)
    .then((data) => {
      console.log("Processing -> getTopResult -> Complete Promise Resolution");
      return data;
    })
    .catch((err) => {
      console.log(
        "Processing -> getTopResult -> Complete Promise Resolution Error",
        err
      );
      if (closeResults.length > 0) {
        closeResults.sort((a, b) => b.score - a.score);
        return { topResult: closeResults[0], cluster: cluster };
      }
      return { topResult: null, cluster: cluster };
    });
};

// Export For Testing
exports.timeDif = timeDif;
exports.urlSorting = urlSorting;
exports.mentionEscaping = mentionEscaping;
