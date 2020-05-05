var exports = (module.exports = {});

const scrapper = require("./scrapper");

const nlp = require("../nlp")

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
      console.log("Processing -> getTopResult -> url", host);
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
  let cleanedResults
  for (let result of results) {
    if (result.score !== -1) {
      cleanedResults.push(result)
    }
  }
  let results = cleanedResults
  results.sort((a, b) => a.score - b.score); // Sort by score
  console.log("Processing -> getTopResult -> sortedResults", results);

  let cluster = scrapper.createCluster();
  let resultsLength = results.length
  let resolvedPromise = 0
  let pageContents = []

  for (let i = 0; i < results.length; i++) {

    pageContents[i] = scrapper.newUrl(cluster, results[i].url)
    pageContents[i].then((data) => {
      resolvedPromise++
      
      console.log("Processing -> getTopResult -> Promise Resolution pageContent", i, "with title", data.title)

      // NLP Processing
      let score = await nlp.scorePage(results[i], data, keywords)

      if (score > 0) { // Set Threshold

        return { "topResult": results[i], "cluster": cluster }
      }
      if (resolvedPromise === resultsLength) {
        // scrapper.closeCluster(cluster)
        return { "topResult": null, "cluster": cluster }
      }

    })

  }
};
