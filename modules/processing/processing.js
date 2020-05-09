var exports = (module.exports = {});

const scrapper = require("./scrapper");

const nlp = require("../nlp");

const whitelist = require("./whitelist.json");

exports.getTopResult = async function (results, username, keywords) {
  let topResult;

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
      let host = pathArray[2];
      if (host.includes("www")) {
        host = host.slice(4);
      }
      //console.log("Processing -> getTopResult -> url", host);
      if (host in whitelist) {
        result.score = 1;
        console.log("Found whitelisted source", host);
      } else {
        result.score = 0;
      }
    } else {
      result.score = -1;
    }
  }
  //console.log("Processing -> getTopResult -> scoreResults", results);
  let cleanedResults = [];

  for (let result of results) {
    if (result.score !== -1) {
      cleanedResults.push(result);
    }
  }

  results = cleanedResults;
  results.sort((a, b) => a.score - b.score); // Sort by score
  //console.log("Processing -> getTopResult -> sortedResults", results);

  let cluster = await scrapper.createCluster();

  let pageContents = [];

  let [scrapePromises, nlpPromises] = [[], []];

  for (let result of results) {
    let scrapePromise = scrapper.newUrl(cluster, result.url);
    let nlpPromise = scrapePromise.then(async (data) => {
      console.log(
        `Processing -> getTopResult -> Promise Resolution pageContent  with title ${data.title}`
      );
      let score = await nlp.scorePage(result, data, keywords);
      console.log("Processing -> getTopResult -> nlpScore", score);
      if (score > 0.1) {
        // Set Threshold
        return { topResult: result, cluster: cluster };
      }
    });
    nlpPromises.push(nlpPromise);
  }
  return Promise.race(nlpPromises);
};
